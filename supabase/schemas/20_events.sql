--------------------------------------------------------------------------------
-- Events
--------------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  location_name text not null,
  location_address text not null,
  registrations_open boolean not null default false,
  visibility public.event_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view all events"
on public.events
for select
to authenticated
using (public.is_admin());

create policy "everyone can view non private events"
on public.events
for select
to anon, authenticated
using (visibility in ('public', 'restricted'));

create policy "admins can insert events"
on public.events
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "admins can update events"
on public.events
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete events"
on public.events
for delete
to authenticated
using (public.is_admin());
