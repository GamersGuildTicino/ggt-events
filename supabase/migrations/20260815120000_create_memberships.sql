create type public.membership_payment_method as enum (
  'twint',
  'bank_transfer',
  'cash'
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone_number text,
  home_address text not null,
  payment_method public.membership_payment_method not null,
  newsletter_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint memberships_full_name_not_blank
    check (btrim(full_name) <> ''),
  constraint memberships_email_normalized
    check (email = lower(btrim(email))),
  constraint memberships_email_not_blank
    check (email <> ''),
  constraint memberships_home_address_not_blank
    check (btrim(home_address) <> ''),
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
