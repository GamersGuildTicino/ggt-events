--------------------------------------------------------------------------------
-- Events
--------------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  slug text not null unique,
  location_name text not null,
  location_address text not null,
  registrations_open boolean not null default false,
  registrations_open_at timestamptz not null,
  visibility public.event_visibility not null default 'private',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_slug_format_valid
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;

--------------------------------------------------------------------------------
-- Open Due Event Registrations
--------------------------------------------------------------------------------

create or replace function public.open_due_event_registrations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.events
  set registrations_open = true
  where registrations_open = false
    and registrations_open_at <= now()
    and visibility <> 'private'
    and exists (
      select 1
      from public.event_time_slots
      where event_time_slots.event_id = events.id
        and event_time_slots.ends_at >= now()
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

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
