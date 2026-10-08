--------------------------------------------------------------------------------
-- Event Managers
--------------------------------------------------------------------------------

create or replace function public.is_event_completed(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_time_slots where event_id = p_event_id
  )
  and not exists (
    select 1
    from public.event_time_slots
    where event_id = p_event_id
      and ends_at >= now()
  );
$$;

grant execute on function public.is_event_completed(uuid) to authenticated;

--------------------------------------------------------------------------------
-- Event Manager Registration Management
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
-- Event Manager Policies
--------------------------------------------------------------------------------

create policy "admins can view all event managers"
on public.event_managers for select to authenticated
using (public.is_admin());

create policy "event managers can view their assignments"
on public.event_managers for select to authenticated
using (user_id = auth.uid());

create policy "admins can insert event managers"
on public.event_managers for insert to authenticated
with check (public.is_admin());

create policy "admins can delete event managers"
on public.event_managers for delete to authenticated
using (public.is_admin());

create policy "admins can view all event manager events"
on public.event_manager_events for select to authenticated
using (public.is_admin());

create policy "event managers can view their event assignments"
on public.event_manager_events for select to authenticated
using (user_id = auth.uid());

create policy "admins can insert event manager events"
on public.event_manager_events for insert to authenticated
with check (public.is_admin());

create policy "admins can delete event manager events"
on public.event_manager_events for delete to authenticated
using (public.is_admin());

create policy "event managers can view assigned events"
on public.events for select to authenticated
using (public.is_event_manager(id));

create policy "event managers can view assigned time slots"
on public.event_time_slots for select to authenticated
using (public.is_event_manager(event_id));

create policy "event managers can insert assigned time slots"
on public.event_time_slots for insert to authenticated
with check (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
  and created_by = auth.uid()
);

create policy "event managers can update assigned time slots"
on public.event_time_slots for update to authenticated
using (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
)
with check (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
);

create policy "event managers can delete assigned time slots"
on public.event_time_slots for delete to authenticated
using (
  public.is_event_manager(event_id)
  and not public.is_event_completed(event_id)
);

create policy "event managers can view assigned tables"
on public.event_tables for select to authenticated
using (
  exists (
    select 1
    from public.event_time_slots
    where event_time_slots.id = event_tables.time_slot_id
      and public.is_event_manager(event_time_slots.event_id)
  )
);

create policy "event managers can insert assigned tables"
on public.event_tables for insert to authenticated
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
on public.event_tables for update to authenticated
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
on public.event_tables for delete to authenticated
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
on public.event_registrations for select to authenticated
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
