create extension if not exists pg_cron;

create or replace function public.open_due_event_registrations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.events
  set registrations_open = true
  where registrations_open = false
    and registrations_open_at <= now()
    and visibility <> 'private'
    and exists (
      select 1
      from public.event_time_slots
      where event_time_slots.event_id = events.id
        and event_time_slots.ends_at >= now()
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'open-due-event-registrations';

select cron.schedule(
  'open-due-event-registrations',
  '*/5 * * * *',
  'select public.open_due_event_registrations();'
);
