--------------------------------------------------------------------------------
-- Event Registrations
--------------------------------------------------------------------------------

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_table_id uuid not null references public.event_tables (id) on delete cascade,
  player_name text not null,
  email text not null,
  phone_number text not null default '',
  locale text not null default 'en-GB',
  created_at timestamptz not null default now(),

  constraint event_registrations_player_name_not_blank
    check (btrim(player_name) <> ''),
  constraint event_registrations_email_normalized
    check (email = lower(btrim(email))),
  constraint event_registrations_email_not_blank
    check (email <> ''),
  constraint event_registrations_locale_valid
    check (locale in ('en-GB', 'it-CH')),
  constraint event_registrations_table_email_player_name_unique
    unique (event_table_id, email, player_name)
);

alter table public.event_registrations enable row level security;

--------------------------------------------------------------------------------
-- Send Registration Email
--------------------------------------------------------------------------------

create or replace function public.send_registration_email(
  p_type text,
  p_registration public.event_registrations
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
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
$$;

--------------------------------------------------------------------------------
-- Register For Event Table
--------------------------------------------------------------------------------

create or replace function public.register_for_event_table(
  p_event_table_id uuid,
  p_player_name text,
  p_email text,
  p_phone_number text default '',
  p_locale text default 'en-GB'
)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
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
    locale
  )
  values (
    v_event_table.id,
    v_player_name,
    v_email,
    v_phone_number,
    v_locale
  )
  returning *
  into v_registration;

  perform public.send_registration_email(
    'registration-confirmed',
    v_registration
  );

  return v_registration;
exception
  when unique_violation then
    raise exception using message = 'already_registered_same_table';
end;
$$;

grant execute on function public.register_for_event_table(uuid, text, text, text, text) to anon;
grant execute on function public.register_for_event_table(uuid, text, text, text, text) to authenticated;

--------------------------------------------------------------------------------
-- Delete Event Registration
--------------------------------------------------------------------------------

create or replace function public.delete_event_registration(
  p_registration_id uuid
)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration public.event_registrations;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using message = 'forbidden';
  end if;

  delete from public.event_registrations
  where id = p_registration_id
  returning *
  into v_registration;

  if not found then
    raise exception using message = 'event_registration_not_found';
  end if;

  perform public.send_registration_email(
    'registration-removed',
    v_registration
  );

  return v_registration;
end;
$$;

grant execute on function public.delete_event_registration(uuid) to authenticated;

--------------------------------------------------------------------------------
-- Fetch Public Event Tables
--------------------------------------------------------------------------------

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
$$;

grant execute on function public.fetch_public_event_tables(uuid) to anon;
grant execute on function public.fetch_public_event_tables(uuid) to authenticated;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "admins can view registrations"
on public.event_registrations
for select
to authenticated
using (public.is_admin());
