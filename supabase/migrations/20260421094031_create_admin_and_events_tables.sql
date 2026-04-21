create type "public"."event_visibility" as enum ('private', 'public', 'restricted');


  create table "public"."admin_users" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_users" enable row level security;


  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "starts_at" timestamp with time zone not null,
    "location_name" text not null,
    "location_address" text not null,
    "registrations_open" boolean not null default false,
    "visibility" public.event_visibility not null default 'private'::public.event_visibility,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."events" enable row level security;

CREATE UNIQUE INDEX admin_users_pkey ON public.admin_users USING btree (user_id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

alter table "public"."admin_users" add constraint "admin_users_pkey" PRIMARY KEY using index "admin_users_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."admin_users" add constraint "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."admin_users" validate constraint "admin_users_user_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$function$
;

grant delete on table "public"."admin_users" to "anon";

grant insert on table "public"."admin_users" to "anon";

grant references on table "public"."admin_users" to "anon";

grant select on table "public"."admin_users" to "anon";

grant trigger on table "public"."admin_users" to "anon";

grant truncate on table "public"."admin_users" to "anon";

grant update on table "public"."admin_users" to "anon";

grant delete on table "public"."admin_users" to "authenticated";

grant insert on table "public"."admin_users" to "authenticated";

grant references on table "public"."admin_users" to "authenticated";

grant select on table "public"."admin_users" to "authenticated";

grant trigger on table "public"."admin_users" to "authenticated";

grant truncate on table "public"."admin_users" to "authenticated";

grant update on table "public"."admin_users" to "authenticated";

grant delete on table "public"."admin_users" to "service_role";

grant insert on table "public"."admin_users" to "service_role";

grant references on table "public"."admin_users" to "service_role";

grant select on table "public"."admin_users" to "service_role";

grant trigger on table "public"."admin_users" to "service_role";

grant truncate on table "public"."admin_users" to "service_role";

grant update on table "public"."admin_users" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";


  create policy "admins can delete admin users"
  on "public"."admin_users"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admins can insert admin users"
  on "public"."admin_users"
  as permissive
  for insert
  to authenticated
with check (public.is_admin());



  create policy "admins can view admin users"
  on "public"."admin_users"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "admins can delete events"
  on "public"."events"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admins can insert events"
  on "public"."events"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() AND (created_by = auth.uid())));



  create policy "admins can update events"
  on "public"."events"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "admins can view all events"
  on "public"."events"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "everyone can view non private events"
  on "public"."events"
  as permissive
  for select
  to anon, authenticated
using ((visibility = ANY (ARRAY['public'::public.event_visibility, 'restricted'::public.event_visibility])));



