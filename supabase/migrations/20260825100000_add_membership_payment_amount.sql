drop function public.create_membership(text, text, text, text, text, text, text, text, boolean, text);

create or replace function public.create_membership(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone_number text,
  p_street text,
  p_postal_code text,
  p_city text,
  p_payment_method text,
  p_payment_amount numeric default 0,
  p_newsletter_accepted boolean default false,
  p_locale text default 'en-GB'
)
returns public.memberships
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_city text;
  v_email text;
  v_first_name text;
  v_last_name text;
  v_locale text;
  v_membership public.memberships;
  v_newsletter_accepted boolean;
  v_payment_amount numeric;
  v_payment_method public.membership_payment_method;
  v_phone_number text;
  v_postal_code text;
  v_street text;
begin
  v_first_name := btrim(coalesce(p_first_name, ''));
  v_last_name := btrim(coalesce(p_last_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')));
  v_phone_number := nullif(btrim(coalesce(p_phone_number, '')), '');
  v_street := btrim(coalesce(p_street, ''));
  v_postal_code := btrim(coalesce(p_postal_code, ''));
  v_city := btrim(coalesce(p_city, ''));
  v_newsletter_accepted := coalesce(p_newsletter_accepted, false);
  v_payment_amount := coalesce(p_payment_amount, 0);
  v_locale := coalesce(p_locale, 'en-GB');

  if v_first_name = '' or v_last_name = '' then
    raise exception using message = 'invalid_name';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using message = 'invalid_email';
  end if;

  if v_street = '' or v_postal_code = '' or v_city = '' then
    raise exception using message = 'invalid_home_address';
  end if;

  if p_payment_method is null or p_payment_method not in ('twint', 'bank_transfer', 'cash') then
    raise exception using message = 'invalid_payment_method';
  end if;

  if v_payment_amount < 0 then
    raise exception using message = 'invalid_payment_amount';
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
    first_name,
    last_name,
    email,
    phone_number,
    street,
    postal_code,
    city,
    newsletter_accepted
  )
  values (
    v_first_name,
    v_last_name,
    v_email,
    v_phone_number,
    v_street,
    v_postal_code,
    v_city,
    v_newsletter_accepted
  )
  returning *
  into v_membership;

  insert into public.membership_payments (
    amount,
    membership_id,
    method,
    paid_at
  )
  values (
    v_payment_amount,
    v_membership.id,
    v_payment_method,
    v_membership.created_at
  );

  perform public.send_membership_email(
    'membership-confirmed',
    v_membership,
    v_payment_method,
    v_locale
  );

  return v_membership;
exception
  when unique_violation then
    raise exception using message = 'email_already_used';
end;
$$;

grant execute on function public.create_membership(text, text, text, text, text, text, text, text, numeric, boolean, text) to anon;
grant execute on function public.create_membership(text, text, text, text, text, text, text, text, numeric, boolean, text) to authenticated;

notify pgrst, 'reload schema';
