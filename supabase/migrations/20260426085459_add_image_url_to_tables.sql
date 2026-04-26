drop function if exists "public"."fetch_public_event_tables"(p_event_id uuid);

alter table "public"."event_tables" add column "image_url" text not null default ''::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_public_event_tables(p_event_id uuid)
 RETURNS TABLE(id uuid, time_slot_id uuid, game_system_id uuid, title text, description text, image_url text, game_master_name text, experience_level public.event_table_experience_level, language public.event_table_language, notes text, min_players integer, max_players integer, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, registration_count integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    event_tables.id,
    event_tables.time_slot_id,
    event_tables.game_system_id,
    event_tables.title,
    event_tables.description,
    event_tables.image_url,
    event_tables.game_master_name,
    event_tables.experience_level,
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
    and events.visibility in ('public', 'restricted')
  order by event_tables.title asc;
$function$
;


