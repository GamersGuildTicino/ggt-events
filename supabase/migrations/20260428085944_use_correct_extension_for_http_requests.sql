set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.send_registration_email(p_type text, p_registration public.event_registrations)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_event public.events;
  v_event_table public.event_tables;
  v_request_id bigint;
  v_time_slot public.event_time_slots;
  v_function_secret text;
  v_headers jsonb;
  v_project_url text;
begin
  if p_type not in ('registration-confirmed', 'registration-removed') then
    raise exception using message = 'invalid_email_type';
  end if;

  select *
  into v_event_table
  from public.event_tables
  where id = p_registration.event_table_id;

  if not found then
    return null;
  end if;

  select *
  into v_time_slot
  from public.event_time_slots
  where id = v_event_table.time_slot_id;

  if not found then
    return null;
  end if;

  select *
  into v_event
  from public.events
  where id = v_time_slot.event_id;

  if not found then
    return null;
  end if;

  select decrypted_secret
  into v_project_url
  from vault.decrypted_secrets
  where name = 'project_url';

  if v_project_url is null then
    return null;
  end if;

  v_headers := jsonb_build_object(
    'Authorization',
      'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'anon_key'
      ),
    'Content-Type',
      'application/json'
  );

  select decrypted_secret
  into v_function_secret
  from vault.decrypted_secrets
  where name = 'transactional_email_secret';

  if v_function_secret is not null then
    v_headers :=
      v_headers || jsonb_build_object('x-transactional-email-secret', v_function_secret);
  end if;

  select net.http_post(
    url := v_project_url || '/functions/v1/send-transactional-email',
    headers := v_headers,
    body := jsonb_build_object(
      'event', jsonb_build_object(
        'locationAddress', v_event.location_address,
        'locationName', v_event.location_name,
        'title', v_event.title
      ),
      'registration', jsonb_build_object(
        'email', p_registration.email,
        'playerName', p_registration.player_name
      ),
      'locale', p_registration.locale,
      'table', jsonb_build_object(
        'gameMasterName', v_event_table.game_master_name,
        'title', v_event_table.title
      ),
      'timeSlot', jsonb_build_object(
        'endsAt', v_time_slot.ends_at,
        'startsAt', v_time_slot.starts_at
      ),
      'type', p_type
    )
  )
  into v_request_id;

  return v_request_id;
end;
$function$
;


