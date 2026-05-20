drop function if exists "public"."send_registration_email"(p_type text, p_registration public.event_registrations);

alter table "public"."event_registrations" add column "cancellation_token_expires_at" timestamp with time zone;

alter table "public"."event_registrations" add column "cancellation_token_hash" text;

CREATE UNIQUE INDEX event_registrations_cancellation_token_hash_key ON public.event_registrations USING btree (cancellation_token_hash);

alter table "public"."event_registrations" add constraint "event_registrations_cancellation_token_hash_key" UNIQUE using index "event_registrations_cancellation_token_hash_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cancel_registration_with_token(p_token text)
 RETURNS TABLE(event_title text, game_master_name text, location_address text, location_name text, player_name text, table_title text, time_slot_ends_at timestamp with time zone, time_slot_starts_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_registration public.event_registrations;
begin
  select
    events.title,
    event_tables.game_master_name,
    events.location_address,
    events.location_name,
    event_registrations.player_name,
    event_tables.title,
    event_time_slots.ends_at,
    event_time_slots.starts_at
  into
    event_title,
    game_master_name,
    location_address,
    location_name,
    player_name,
    table_title,
    time_slot_ends_at,
    time_slot_starts_at
  from public.event_registrations
  join public.event_tables on event_tables.id = event_registrations.event_table_id
  join public.event_time_slots on event_time_slots.id = event_tables.time_slot_id
  join public.events on events.id = event_time_slots.event_id
  where event_registrations.cancellation_token_hash =
      encode(digest(p_token, 'sha256'), 'hex')
    and event_registrations.cancellation_token_expires_at > now()
    and event_registrations.anonymized_at is null;

  if not found then
    raise exception using message = 'registration_cancellation_not_found';
  end if;

  delete from public.event_registrations
  where cancellation_token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and cancellation_token_expires_at > now()
    and anonymized_at is null
  returning *
  into v_registration;

  if not found then
    raise exception using message = 'registration_cancellation_not_found';
  end if;

  perform public.send_registration_email('registration-removed', v_registration);
  perform public.send_registration_email('registration-removed-admin-notification', v_registration);

  return next;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_registration_cancellation(p_token text)
 RETURNS TABLE(event_title text, game_master_name text, location_address text, location_name text, player_name text, table_title text, time_slot_ends_at timestamp with time zone, time_slot_starts_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  select
    events.title as event_title,
    event_tables.game_master_name,
    events.location_address,
    events.location_name,
    event_registrations.player_name,
    event_tables.title as table_title,
    event_time_slots.ends_at as time_slot_ends_at,
    event_time_slots.starts_at as time_slot_starts_at
  from public.event_registrations
  join public.event_tables on event_tables.id = event_registrations.event_table_id
  join public.event_time_slots on event_time_slots.id = event_tables.time_slot_id
  join public.events on events.id = event_time_slots.event_id
  where event_registrations.cancellation_token_hash =
      encode(digest(p_token, 'sha256'), 'hex')
    and event_registrations.cancellation_token_expires_at > now()
    and event_registrations.anonymized_at is null
  limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.send_registration_email(p_type text, p_registration public.event_registrations, p_cancellation_token text DEFAULT NULL::text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_event public.events;
  v_event_table public.event_tables;
  v_cancellation_url text;
  v_request_id bigint;
  v_time_slot public.event_time_slots;
  v_function_secret text;
  v_headers jsonb;
  v_project_url text;
  v_site_url text;
begin
  if p_type not in (
    'registration-confirmed',
    'registration-removed',
    'registration-removed-admin-notification'
  ) then
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

  select decrypted_secret
  into v_site_url
  from vault.decrypted_secrets
  where name = 'site_url';

  if p_cancellation_token is not null and v_site_url is not null then
    v_cancellation_url :=
      rtrim(v_site_url, '/') || '/registrations/cancel?token=' || p_cancellation_token;
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
        'cancellationUrl', v_cancellation_url,
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

CREATE OR REPLACE FUNCTION public.register_for_event_table(p_event_table_id uuid, p_player_name text, p_email text, p_phone_number text DEFAULT ''::text, p_locale text DEFAULT 'en-GB'::text)
 RETURNS public.event_registrations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_cancellation_token text;
  v_event public.events;
  v_event_table public.event_tables;
  v_locale text;
  v_registration public.event_registrations;
  v_registration_count integer;
  v_time_slot public.event_time_slots;
  v_email text;
  v_phone_number text;
  v_player_name text;
begin
  v_cancellation_token := encode(gen_random_bytes(32), 'hex');
  v_player_name := btrim(coalesce(p_player_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')));
  v_phone_number := btrim(coalesce(p_phone_number, ''));
  v_locale := coalesce(p_locale, 'en-GB');

  if v_player_name = '' then
    raise exception using message = 'invalid_name';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception using message = 'invalid_email';
  end if;

  if v_locale not in ('en-GB', 'it-CH') then
    raise exception using message = 'invalid_locale';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_email || E'\n' || v_player_name, 0)
  );

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

  if v_time_slot.ends_at <= now() then
    raise exception using message = 'time_slot_closed';
  end if;

  if exists (
    select 1
    from public.event_registrations
    where event_table_id = v_event_table.id
      and email = v_email
      and player_name = v_player_name
  ) then
    raise exception using message = 'already_registered_same_table';
  end if;

  if exists (
    select 1
    from public.event_registrations registrations
    join public.event_tables tables on tables.id = registrations.event_table_id
    join public.event_time_slots slots on slots.id = tables.time_slot_id
    where registrations.email = v_email
      and registrations.player_name = v_player_name
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
    email,
    phone_number,
    locale,
    cancellation_token_hash,
    cancellation_token_expires_at
  )
  values (
    v_event_table.id,
    v_player_name,
    v_email,
    v_phone_number,
    v_locale,
    encode(digest(v_cancellation_token, 'sha256'), 'hex'),
    v_time_slot.ends_at
  )
  returning *
  into v_registration;

  perform public.send_registration_email(
    'registration-confirmed',
    v_registration,
    v_cancellation_token
  );

  return v_registration;
exception
  when unique_violation then
    raise exception using message = 'already_registered_same_table';
end;
$function$
;


