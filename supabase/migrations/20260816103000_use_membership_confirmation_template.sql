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
        'city', p_membership.city,
        'email', p_membership.email,
        'firstName', p_membership.first_name,
        'fullName', concat_ws(' ', p_membership.first_name, p_membership.last_name),
        'lastName', p_membership.last_name,
        'paymentMethod', p_membership.payment_method,
        'postalCode', p_membership.postal_code,
        'street', p_membership.street
      ),
      'type', p_type
    )
  )
  into v_request_id;

  return v_request_id;
end;
$$;
