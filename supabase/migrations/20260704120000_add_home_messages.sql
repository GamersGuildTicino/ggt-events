create table public.home_messages (
  key text primary key,
  enabled boolean not null default false,
  title jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint home_messages_key_format_valid
    check (key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  constraint home_messages_title_is_object
    check (jsonb_typeof(title) = 'object'),
  constraint home_messages_body_is_object
    check (jsonb_typeof(body) = 'object')
);

create trigger set_home_messages_updated_at
before update on public.home_messages
for each row
execute function public.set_updated_at();

alter table public.home_messages enable row level security;

create policy "everyone can view enabled home messages"
on public.home_messages
for select
to anon, authenticated
using (enabled or public.is_admin());

create policy "admins can insert home messages"
on public.home_messages
for insert
to authenticated
with check (public.is_admin());

create policy "admins can update home messages"
on public.home_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins can delete home messages"
on public.home_messages
for delete
to authenticated
using (public.is_admin());
