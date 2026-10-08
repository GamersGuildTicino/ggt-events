--------------------------------------------------------------------------------
-- Event Manager Core
--------------------------------------------------------------------------------

create table public.event_managers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  assigned_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  display_name text
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
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.event_manager_events
    where user_id = auth.uid() and event_id = p_event_id
  );
$$;

create or replace function public.is_event_manager_user()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.event_managers where user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_event(p_event_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or public.is_event_manager(p_event_id);
$$;

create or replace function public.get_current_admin_access()
returns table (is_admin boolean, is_event_manager boolean)
language sql stable security definer set search_path = public
as $$
  select public.is_admin(), public.is_event_manager_user();
$$;

grant execute on function public.is_event_manager(uuid) to authenticated;
grant execute on function public.is_event_manager_user() to authenticated;
grant execute on function public.can_manage_event(uuid) to authenticated;
grant execute on function public.get_current_admin_access() to authenticated;
