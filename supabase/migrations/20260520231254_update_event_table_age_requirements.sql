create type public.event_table_age_requirement_new as enum (
  'any',
  'age_9_11',
  'age_11_13',
  'age_14_plus',
  'age_15_plus',
  'age_16_plus',
  'age_17_plus',
  'age_18_plus'
);

drop function if exists public.fetch_public_event_tables(uuid);

alter table public.event_tables
alter column age_requirement drop default;

alter table public.event_tables
alter column age_requirement type public.event_table_age_requirement_new
using (
  case age_requirement::text
    when 'kids' then 'age_11_13'
    else age_requirement::text
  end
)::public.event_table_age_requirement_new;

drop type public.event_table_age_requirement;

alter type public.event_table_age_requirement_new
rename to event_table_age_requirement;

alter table public.event_tables
alter column age_requirement set default 'age_14_plus'::public.event_table_age_requirement;

create or replace function public.fetch_public_event_tables(p_event_id uuid)
returns table (
  id uuid,
  time_slot_id uuid,
  game_system_id uuid,
  title text,
  description text,
  image_url text,
  game_master_name text,
  experience_level public.event_table_experience_level,
  age_requirement public.event_table_age_requirement,
  language public.event_table_language,
  notes text,
  min_players integer,
  max_players integer,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  registration_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    event_tables.id,
    event_tables.time_slot_id,
    event_tables.game_system_id,
    event_tables.title,
    event_tables.description,
    event_tables.image_url,
    event_tables.game_master_name,
    event_tables.experience_level,
    event_tables.age_requirement,
    event_tables.language,
    event_tables.notes,
    event_tables.min_players,
    event_tables.max_players,
    event_tables.created_by,
    event_tables.created_at,
    event_tables.updated_at,
    (
      select count(*)::integer
      from public.event_registrations
      where event_registrations.event_table_id = event_tables.id
    ) as registration_count
  from public.event_tables
  join public.event_time_slots on event_time_slots.id = event_tables.time_slot_id
  join public.events on events.id = event_time_slots.event_id
  where event_time_slots.event_id = p_event_id
  order by event_tables.title asc;
$$;

grant execute on function public.fetch_public_event_tables(uuid) to anon;
grant execute on function public.fetch_public_event_tables(uuid) to authenticated;
