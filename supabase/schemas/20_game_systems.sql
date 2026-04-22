--------------------------------------------------------------------------------
-- Game Systems
--------------------------------------------------------------------------------

create table public.game_systems (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image_url text not null default '',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_game_systems_updated_at
before update on public.game_systems
for each row
execute function public.set_updated_at();

alter table public.game_systems enable row level security;

--------------------------------------------------------------------------------
-- RLS Policies
--------------------------------------------------------------------------------

create policy "everyone can view game systems"
on public.game_systems
for select
to anon, authenticated
using (true);

create policy "admins can insert game systems"
on public.game_systems
for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "admins can update game systems"
on public.game_systems
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete game systems"
on public.game_systems
for delete
to authenticated
using (public.is_admin());
