alter table public.event_registrations
add column participant_is_minor boolean not null default false,
add column guardian_name text not null default '',
add column guardian_phone_number text not null default '';

alter table public.event_registrations
add constraint event_registrations_guardian_contact_for_minors
check (
  not participant_is_minor
  or (btrim(guardian_name) <> '' and btrim(guardian_phone_number) <> '')
);

drop function public.register_for_event_table(uuid, text, text, text, text);

create or replace function public.register_for_event_table(
  p_event_table_id uuid,
  p_player_name text,
  p_email text,
  p_phone_number text default '',
  p_locale text default 'en-GB',
  p_participant_is_minor boolean default false,
  p_guardian_name text default '',
  p_guardian_phone_number text default ''
)
returns public.event_registrations
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_cancellation_token text;
  v_event public.events;
  v_event_table public.event_tables;
  v_locale text;
  v_registration public.event_registrations;
  v_registration_count integer;
  v_time_slot public.event_time_slots;
  v_email text;
  v_guardian_name text;
  v_guardian_phone_number text;
  v_participant_is_minor boolean;
  v_phone_number text;
  v_player_name text;
begin
  v_cancellation_token := encode(gen_random_bytes(32), 'hex');
  v_player_name := btrim(coalesce(p_player_name, ''));
  v_email := lower(btrim(coalesce(p_email, '')));
  v_phone_number := btrim(coalesce(p_phone_number, ''));
  v_locale := coalesce(p_locale, 'en-GB');
  v_participant_is_minor := coalesce(p_participant_is_minor, false);
  v_guardian_name := btrim(coalesce(p_guardian_name, ''));
  v_guardian_phone_number := btrim(coalesce(p_guardian_phone_number, ''));

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

  if v_event_table.age_requirement not in (
    'age_14_plus',
    'age_15_plus',
    'age_16_plus',
    'age_17_plus'
  ) then
    v_participant_is_minor := false;
    v_guardian_name := '';
    v_guardian_phone_number := '';
  end if;

  if v_participant_is_minor and (v_guardian_name = '' or v_guardian_phone_number = '') then
    raise exception using message = 'invalid_guardian_contact';
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
    participant_is_minor,
    guardian_name,
    guardian_phone_number,
    locale,
    cancellation_token_hash,
    cancellation_token_expires_at
  )
  values (
    v_event_table.id,
    v_player_name,
    v_email,
    v_phone_number,
    v_participant_is_minor,
    v_guardian_name,
    v_guardian_phone_number,
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
$$;

grant execute on function public.register_for_event_table(uuid, text, text, text, text, boolean, text, text) to anon;
grant execute on function public.register_for_event_table(uuid, text, text, text, text, boolean, text, text) to authenticated;

create or replace function public.anonymize_old_event_registrations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
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
    participant_is_minor = false,
    guardian_name = '',
    guardian_phone_number = '',
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
$$;

grant execute on function public.anonymize_old_event_registrations() to authenticated;
