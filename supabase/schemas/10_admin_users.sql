--------------------------------------------------------------------------------
-- Admin Users
--------------------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

--------------------------------------------------------------------------------
-- Is Admin
--------------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

create policy "admins can insert admin users"
on public.admin_users
for insert
to authenticated
with check (public.is_admin());

create policy "admins can delete admin users"
on public.admin_users
for delete
to authenticated
using (public.is_admin());
