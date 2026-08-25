--------------------------------------------------------------------------------
-- Memberships
--------------------------------------------------------------------------------

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone_number text,
  street text not null,
  postal_code text not null,
  city text not null,
  newsletter_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint memberships_first_name_not_blank
    check (btrim(first_name) <> ''),
  constraint memberships_last_name_not_blank
    check (btrim(last_name) <> ''),
  constraint memberships_email_normalized
    check (email = lower(btrim(email))),
  constraint memberships_email_not_blank
    check (email <> ''),
  constraint memberships_email_format
    check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint memberships_street_not_blank
    check (btrim(street) <> ''),
  constraint memberships_postal_code_not_blank
    check (btrim(postal_code) <> ''),
  constraint memberships_city_not_blank
    check (btrim(city) <> ''),
  constraint memberships_phone_number_not_blank
    check (phone_number is null or btrim(phone_number) <> '')
);

create unique index memberships_email_unique
on public.memberships (lower(email));

create trigger set_memberships_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

alter table public.memberships enable row level security;

--------------------------------------------------------------------------------
-- Membership Payments
--------------------------------------------------------------------------------

create table public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  paid_at timestamptz not null,
  method public.membership_payment_method not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint membership_payments_amount_not_negative
    check (amount >= 0)
);

create index membership_payments_membership_id_paid_at_idx
on public.membership_payments (membership_id, paid_at desc);

create trigger set_membership_payments_updated_at
before update on public.membership_payments
for each row
execute function public.set_updated_at();

--------------------------------------------------------------------------------
-- Send Membership Email
--------------------------------------------------------------------------------

create or replace function public.send_membership_email(
  p_type text,
  p_membership public.memberships,
  p_payment_method public.membership_payment_method,
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
        'paymentMethod', p_payment_method,
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

--------------------------------------------------------------------------------
-- Create Membership
--------------------------------------------------------------------------------

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

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view memberships"
on public.memberships
for select
to authenticated
using (public.is_admin());

create policy "admins can insert memberships"
on public.memberships
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update memberships"
on public.memberships
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete memberships"
on public.memberships
for delete
to authenticated
using (public.is_admin());

alter table public.membership_payments enable row level security;

create policy "admins can view membership payments"
on public.membership_payments
for select
to authenticated
using (public.is_admin());

create policy "admins can insert membership payments"
on public.membership_payments
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update membership payments"
on public.membership_payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete membership payments"
on public.membership_payments
for delete
to authenticated
using (public.is_admin());
