--------------------------------------------------------------------------------
-- Event Managers
--------------------------------------------------------------------------------

create table public.event_managers (
  user_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (user_id)
);

create table public.event_manager_events (
  user_id uuid not null references public.event_managers (user_id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  assigned_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.event_managers enable row level security;
alter table public.event_manager_events enable row level security;

create or replace function public.is_event_manager(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_manager_events
    where user_id = auth.uid()
      and event_id = p_event_id
  );
$$;

create or replace function public.is_event_manager_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_managers
    where user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.is_event_manager(p_event_id);
$$;

create or replace function public.is_event_completed(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_time_slots
    where event_id = p_event_id
  )
  and not exists (
    select 1
    from public.event_time_slots
    where event_id = p_event_id
      and ends_at >= now()
  );
$$;

grant execute on function public.is_event_manager(uuid) to authenticated;
grant execute on function public.is_event_manager_user() to authenticated;
grant execute on function public.can_manage_event(uuid) to authenticated;
grant execute on function public.is_event_completed(uuid) to authenticated;

create or replace function public.get_current_admin_access()
returns table (
  is_admin boolean,
  is_event_manager boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(), public.is_event_manager_user();
$$;

grant execute on function public.get_current_admin_access() to authenticated;

--------------------------------------------------------------------------------
-- Event Manager Policies
--------------------------------------------------------------------------------

create policy "admins can view all event managers"
on public.event_managers
for select
to authenticated
using (public.is_admin());

create policy "event managers can view their assignments"
on public.event_managers
for select
to authenticated
using (user_id = auth.uid());

create policy "admins can view all event manager events"
on public.event_manager_events
for select
to authenticated
using (public.is_admin());

create policy "event managers can view their event assignments"
on public.event_manager_events
for select
to authenticated
using (user_id = auth.uid());

create policy "admins can insert event managers"
on public.event_managers
for insert
to authenticated
with check (public.is_admin());

create policy "admins can delete event managers"
on public.event_managers
for delete
to authenticated
using (public.is_admin());

create policy "admins can insert event manager events"
on public.event_manager_events
for insert
to authenticated
with check (public.is_admin());

create policy "admins can delete event manager events"
on public.event_manager_events
for delete
to authenticated
using (public.is_admin());

create policy "event managers can view assigned events"
on public.events
for select
to authenticated
using (public.is_event_manager(id));

create policy "event managers can view assigned time slots"
on public.event_time_slots
for select
to authenticated
using (public.is_event_manager(event_id));

create policy "event managers can insert assigned time slots"
on public.event_time_slots
for insert
to authenticated
with check (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
  and created_by = auth.uid()
);

create policy "event managers can update assigned time slots"
on public.event_time_slots
for update
to authenticated
using (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
)
with check (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
);

create policy "event managers can delete assigned time slots"
on public.event_time_slots
for delete
to authenticated
using (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
);

create policy "event managers can view assigned tables"
on public.event_tables
for select
to authenticated
using (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
  )
);

create policy "event managers can insert assigned tables"
on public.event_tables
for insert
to authenticated
with check (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
      and not public.is_event_completed(event_time_slots.event_id)
  )
  and created_by = auth.uid()
);

create policy "event managers can update assigned tables"
on public.event_tables
for update
to authenticated
using (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
      and not public.is_event_completed(event_time_slots.event_id)
  )
)
with check (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
      and not public.is_event_completed(event_time_slots.event_id)
  )
);

create policy "event managers can delete assigned tables"
on public.event_tables
for delete
to authenticated
using (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
      and not public.is_event_completed(event_time_slots.event_id)
  )
);

create policy "event managers can view assigned registrations"
on public.event_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.event_tables
    join public.event_time_slots
      on event_time_slots.id = event_tables.time_slot_id
    where event_tables.id = event_registrations.event_table_id
      and public.is_event_manager(event_time_slots.event_id)
  )
);

--------------------------------------------------------------------------------
-- Admin Event List
--------------------------------------------------------------------------------

create or replace function public.fetch_admin_events()
returns setof public.events
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception using message = 'forbidden';
  end if;

  if public.is_admin() then
    return query select * from public.events order by created_at desc;
  end if;

  return query
    select events.*
    from public.events
    join public.event_manager_events
      on event_manager_events.event_id = events.id
    where event_manager_events.user_id = auth.uid()
    order by events.created_at desc;
end;
$$;

grant execute on function public.fetch_admin_events() to authenticated;

--------------------------------------------------------------------------------
-- Event Registration Authorization
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
  v_event_id uuid;
  v_registration public.event_registrations;
begin
  select event_time_slots.event_id
  into v_event_id
  from public.event_registrations
  join public.event_tables
    on event_tables.id = event_registrations.event_table_id
  join public.event_time_slots
    on event_time_slots.id = event_tables.time_slot_id
  where event_registrations.id = p_registration_id;

  if v_event_id is null
    or not public.can_manage_event(v_event_id)
    or (public.is_event_manager(v_event_id) and public.is_event_completed(v_event_id))
  then
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
-- Public Event Tables
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
  age_requirement public.event_table_age_requirement,
  language public.event_table_language,
  notes text,
  min_players integer,
  max_players integer,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  registration_count integer,
  is_visible boolean
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
    ) as registration_count,
    event_tables.is_visible
  from public.event_tables
  join public.event_time_slots on event_time_slots.id = event_tables.time_slot_id
  join public.events on events.id = event_time_slots.event_id
  join public.game_systems on game_systems.id = event_tables.game_system_id
  where event_time_slots.event_id = p_event_id
    and (
      (
        events.visibility in ('public', 'restricted')
        and events.tables_published
        and event_tables.is_visible
      )
      or (
        auth.uid() is not null
        and public.can_manage_event(events.id)
      )
    )
  order by game_systems.name asc, event_tables.title asc;
$$;

grant execute on function public.fetch_public_event_tables(uuid) to anon;
grant execute on function public.fetch_public_event_tables(uuid) to authenticated;

--------------------------------------------------------------------------------
-- Register For Event Table
--------------------------------------------------------------------------------

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
  v_can_manage_event boolean;
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

  v_can_manage_event := public.can_manage_event(v_event.id);

  if not v_can_manage_event and (
    not v_event.registrations_open
    or v_event.visibility = 'private'
    or not v_event.tables_published
    or not v_event_table.is_visible
  ) then
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
