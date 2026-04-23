set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_public_event_tables(p_event_id uuid)
 RETURNS TABLE(id uuid, time_slot_id uuid, game_system_id uuid, title text, description text, game_master_name text, experience_level public.event_table_experience_level, language public.event_table_language, notes text, min_players integer, max_players integer, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone, registration_count integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    event_tables.*,
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


