--------------------------------------------------------------------------------
-- Event Tables
--------------------------------------------------------------------------------

create table public.event_tables (
  id uuid primary key default gen_random_uuid(),
  time_slot_id uuid not null references public.event_time_slots (id) on delete cascade,
  game_system_id uuid not null references public.game_systems (id) on delete restrict,
  title text not null,
  description text not null default '',
  image_url text not null default '',
  game_master_name text not null,
  experience_level public.event_table_experience_level not null default 'unspecified',
  language public.event_table_language not null default 'italian',
  notes text not null default '',
  min_players integer not null,
  max_players integer not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_tables_min_players_non_negative check (min_players >= 0),
  constraint event_tables_max_players_valid check (max_players >= min_players)
);

create trigger set_event_tables_updated_at
before update on public.event_tables
for each row
execute function public.set_updated_at();

alter table public.event_tables enable row level security;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view all event tables"
on public.event_tables
for select
to authenticated
using (public.is_admin());

create policy "everyone can view tables for non private events"
on public.event_tables
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.event_time_slots
    join public.events on events.id = event_time_slots.event_id
    where event_time_slots.id = event_tables.time_slot_id
      and events.visibility in ('public', 'restricted')
  )
);

create policy "admins can insert event tables"
on public.event_tables
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "admins can update event tables"
on public.event_tables
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete event tables"
on public.event_tables
for delete
to authenticated
using (public.is_admin());
