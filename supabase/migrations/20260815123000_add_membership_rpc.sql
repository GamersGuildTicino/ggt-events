create or replace function public.send_membership_email(
  p_type text,
  p_membership public.memberships,
  p_locale text default 'en-GB'
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_function_secret text;
  v_headers jsonb;
  v_project_url text;
  v_request_id bigint;
begin
  if p_type not in ('membership-confirmed') then
    raise exception using message = 'invalid_email_type';
  end if;

  select decrypted_secret
  into v_project_url
  from vault.decrypted_secrets
  where name = 'project_url';

  if v_project_url is null then
    return null;
  end if;

  v_headers := jsonb_build_object(
    'Authorization',
      'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'anon_key'
      ),
    'Content-Type',
      'application/json'
  );

  select decrypted_secret
  into v_function_secret
  from vault.decrypted_secrets
  where name = 'transactional_email_secret';

  if v_function_secret is not null then
    v_headers :=
      v_headers || jsonb_build_object('x-transactional-email-secret', v_function_secret);
  end if;

  select net.http_post(
    url := v_project_url || '/functions/v1/send-transactional-email',
    headers := v_headers,
    body := jsonb_build_object(
      'locale', p_locale,
      'membership', jsonb_build_object(
        'email', p_membership.email,
        'fullName', p_membership.full_name,
        'paymentMethod', p_membership.payment_method
      ),
      'type', p_type
    )
  )
  into v_request_id;

  return v_request_id;
end;
$$;

create or replace function public.create_membership(
  p_full_name text,
  p_email text,
  p_phone_number text,
  p_home_address text,
  p_payment_method text,
  p_newsletter_accepted boolean default false,
  p_locale text default 'en-GB'
)
returns public.memberships
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text;
  v_full_name text;
  v_home_address text;
  v_locale text;
  v_membership public.memberships;
  v_newsletter_accepted boolean;
  v_payment_method public.membership_payment_method;
  v_phone_number text;
begin
  v_full_name := btrim(coalesce(p_full_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')));
  v_phone_number := nullif(btrim(coalesce(p_phone_number, '')), '');
  v_home_address := btrim(coalesce(p_home_address, ''));
  v_newsletter_accepted := coalesce(p_newsletter_accepted, false);
  v_locale := coalesce(p_locale, 'en-GB');

  if v_full_name = '' then
    raise exception using message = 'invalid_name';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using message = 'invalid_email';
  end if;

  if v_home_address = '' then
    raise exception using message = 'invalid_home_address';
  end if;

  if p_payment_method is null or p_payment_method not in ('twint', 'bank_transfer', 'cash') then
    raise exception using message = 'invalid_payment_method';
  end if;

  if v_locale not in ('en-GB', 'it-CH') then
    raise exception using message = 'invalid_locale';
  end if;

  v_payment_method := p_payment_method::public.membership_payment_method;

  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));

  if exists (
    select 1
    from public.memberships
    where email = v_email
  ) then
    raise exception using message = 'email_already_used';
  end if;

  insert into public.memberships (
    full_name,
    email,
    phone_number,
    home_address,
    payment_method,
    newsletter_accepted
  )
  values (
    v_full_name,
    v_email,
    v_phone_number,
    v_home_address,
    v_payment_method,
    v_newsletter_accepted
  )
  returning *
  into v_membership;

  perform public.send_membership_email(
    'membership-confirmed',
    v_membership,
    v_locale
  );

  return v_membership;
exception
  when unique_violation then
    raise exception using message = 'email_already_used';
end;
$$;

grant execute on function public.create_membership(text, text, text, text, text, boolean, text) to anon;
grant execute on function public.create_membership(text, text, text, text, text, boolean, text) to authenticated;

notify pgrst, 'reload schema';
