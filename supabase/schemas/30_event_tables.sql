--------------------------------------------------------------------------------
-- Event Tables
--------------------------------------------------------------------------------

create table public.event_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  game_system_id uuid not null references public.game_systems (id) on delete restrict,
  title text not null,
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
    from public.events
    where events.id = event_tables.event_id
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
