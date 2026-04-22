--------------------------------------------------------------------------------
-- Event Time Slots
--------------------------------------------------------------------------------

create table public.event_time_slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_time_slots_ends_after_starts check (ends_at > starts_at)
);

create trigger set_event_time_slots_updated_at
before update on public.event_time_slots
for each row
execute function public.set_updated_at();

alter table public.event_time_slots enable row level security;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view all event time slots"
on public.event_time_slots
for select
to authenticated
using (public.is_admin());

create policy "everyone can view slots for non private events"
on public.event_time_slots
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_time_slots.event_id
      and events.visibility in ('public', 'restricted')
  )
);

create policy "admins can insert event time slots"
on public.event_time_slots
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "admins can update event time slots"
on public.event_time_slots
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete event time slots"
on public.event_time_slots
for delete
to authenticated
using (public.is_admin());
