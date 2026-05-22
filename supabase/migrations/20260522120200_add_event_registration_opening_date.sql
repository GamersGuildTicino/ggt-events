alter table public.events
add column registrations_open_at timestamptz;

update public.events
set registrations_open_at = coalesce(
  (
    select min(event_time_slots.starts_at) - interval '14 days'
    from public.event_time_slots
    where event_time_slots.event_id = events.id
  ),
  now()
)
where registrations_open_at is null;

alter table public.events
alter column registrations_open_at set not null;
