alter table "public"."event_registrations" add column "anonymized_at" timestamp with time zone;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.anonymize_old_event_registrations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_count integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using message = 'forbidden';
  end if;

  update public.event_registrations registrations
  set
    player_name = 'Anonymized participant',
    email = 'anonymous+' || registrations.id::text || '@example.invalid',
    phone_number = '',
    anonymized_at = now()
  from public.event_tables tables
  join public.event_time_slots slots on slots.id = tables.time_slot_id
  where registrations.event_table_id = tables.id
    and registrations.anonymized_at is null
    and slots.event_id in (
      select event_time_slots.event_id
      from public.event_time_slots
      group by event_time_slots.event_id
      having max(event_time_slots.ends_at) < now() - interval '12 months'
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$function$
;


