--------------------------------------------------------------------------------
-- Event Registrations
--------------------------------------------------------------------------------

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_table_id uuid not null references public.event_tables (id) on delete cascade,
  player_name text not null,
  email text not null,
  created_at timestamptz not null default now(),

  constraint event_registrations_player_name_not_blank
    check (btrim(player_name) <> ''),
  constraint event_registrations_email_normalized
    check (email = lower(btrim(email))),
  constraint event_registrations_email_not_blank
    check (email <> ''),
  constraint event_registrations_table_email_unique
    unique (event_table_id, email)
);

alter table public.event_registrations enable row level security;

--------------------------------------------------------------------------------
-- Register For Event Table
--------------------------------------------------------------------------------

create or replace function public.register_for_event_table(
  p_event_table_id uuid,
  p_player_name text,
  p_email text
)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
  v_event_table public.event_tables;
  v_registration public.event_registrations;
  v_registration_count integer;
  v_time_slot public.event_time_slots;
  v_email text;
  v_player_name text;
begin
  v_player_name := btrim(coalesce(p_player_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')));

  if v_player_name = '' then
    raise exception using message = 'invalid_name';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using message = 'invalid_email';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));

  select *
  into v_event_table
  from public.event_tables
  where id = p_event_table_id
  for update;

  if not found then
    raise exception using message = 'event_table_not_found';
  end if;

  select *
  into v_time_slot
  from public.event_time_slots
  where id = v_event_table.time_slot_id;

  if not found then
    raise exception using message = 'event_time_slot_not_found';
  end if;

  select *
  into v_event
  from public.events
  where id = v_time_slot.event_id;

  if not found then
    raise exception using message = 'event_not_found';
  end if;

  if not v_event.registrations_open or v_event.visibility = 'private' then
    raise exception using message = 'registrations_closed';
  end if;

  if exists (
    select 1
    from public.event_registrations
    where event_table_id = v_event_table.id
      and email = v_email
  ) then
    raise exception using message = 'already_registered_same_table';
  end if;

  if exists (
    select 1
    from public.event_registrations registrations
    join public.event_tables tables on tables.id = registrations.event_table_id
    join public.event_time_slots slots on slots.id = tables.time_slot_id
    where registrations.email = v_email
      and slots.starts_at < v_time_slot.ends_at
      and slots.ends_at > v_time_slot.starts_at
  ) then
    raise exception using message = 'slot_conflict';
  end if;

  select count(*)
  into v_registration_count
  from public.event_registrations
  where event_table_id = v_event_table.id;

  if v_registration_count >= v_event_table.max_players then
    raise exception using message = 'table_full';
  end if;

  insert into public.event_registrations (
    event_table_id,
    player_name,
    email
  )
  values (
    v_event_table.id,
    v_player_name,
    v_email
  )
  returning *
  into v_registration;

  return v_registration;
exception
  when unique_violation then
    raise exception using message = 'already_registered_same_table';
end;
$$;

grant execute on function public.register_for_event_table(uuid, text, text) to anon;
grant execute on function public.register_for_event_table(uuid, text, text) to authenticated;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view registrations"
on public.event_registrations
for select
to authenticated
using (public.is_admin());

create policy "admins can insert registrations"
on public.event_registrations
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update registrations"
on public.event_registrations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete registrations"
on public.event_registrations
for delete
to authenticated
using (public.is_admin());
