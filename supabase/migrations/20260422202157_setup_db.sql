create type "public"."event_visibility" as enum ('private', 'public', 'restricted');


  create table "public"."admin_users" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admin_users" enable row level security;


  create table "public"."event_tables" (
    "id" uuid not null default gen_random_uuid(),
    "time_slot_id" uuid not null,
    "game_system_id" uuid not null,
    "title" text not null,
    "description" text not null default ''::text,
    "game_master_name" text not null,
    "min_players" integer not null,
    "max_players" integer not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event_tables" enable row level security;


  create table "public"."event_time_slots" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "starts_at" timestamp with time zone not null,
    "ends_at" timestamp with time zone not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event_time_slots" enable row level security;


  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "location_name" text not null,
    "location_address" text not null,
    "registrations_open" boolean not null default false,
    "visibility" public.event_visibility not null default 'private'::public.event_visibility,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."events" enable row level security;


  create table "public"."game_systems" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text not null default ''::text,
    "image_url" text not null default ''::text,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."game_systems" enable row level security;

CREATE UNIQUE INDEX admin_users_pkey ON public.admin_users USING btree (user_id);

CREATE UNIQUE INDEX event_tables_pkey ON public.event_tables USING btree (id);

CREATE UNIQUE INDEX event_time_slots_pkey ON public.event_time_slots USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX game_systems_pkey ON public.game_systems USING btree (id);

alter table "public"."admin_users" add constraint "admin_users_pkey" PRIMARY KEY using index "admin_users_pkey";

alter table "public"."event_tables" add constraint "event_tables_pkey" PRIMARY KEY using index "event_tables_pkey";

alter table "public"."event_time_slots" add constraint "event_time_slots_pkey" PRIMARY KEY using index "event_time_slots_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."game_systems" add constraint "game_systems_pkey" PRIMARY KEY using index "game_systems_pkey";

alter table "public"."admin_users" add constraint "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."admin_users" validate constraint "admin_users_user_id_fkey";

alter table "public"."event_tables" add constraint "event_tables_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."event_tables" validate constraint "event_tables_created_by_fkey";

alter table "public"."event_tables" add constraint "event_tables_game_system_id_fkey" FOREIGN KEY (game_system_id) REFERENCES public.game_systems(id) ON DELETE RESTRICT not valid;

alter table "public"."event_tables" validate constraint "event_tables_game_system_id_fkey";

alter table "public"."event_tables" add constraint "event_tables_max_players_valid" CHECK ((max_players >= min_players)) not valid;

alter table "public"."event_tables" validate constraint "event_tables_max_players_valid";

alter table "public"."event_tables" add constraint "event_tables_min_players_non_negative" CHECK ((min_players >= 0)) not valid;

alter table "public"."event_tables" validate constraint "event_tables_min_players_non_negative";

alter table "public"."event_tables" add constraint "event_tables_time_slot_id_fkey" FOREIGN KEY (time_slot_id) REFERENCES public.event_time_slots(id) ON DELETE CASCADE not valid;

alter table "public"."event_tables" validate constraint "event_tables_time_slot_id_fkey";

alter table "public"."event_time_slots" add constraint "event_time_slots_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."event_time_slots" validate constraint "event_time_slots_created_by_fkey";

alter table "public"."event_time_slots" add constraint "event_time_slots_ends_after_starts" CHECK ((ends_at > starts_at)) not valid;

alter table "public"."event_time_slots" validate constraint "event_time_slots_ends_after_starts";

alter table "public"."event_time_slots" add constraint "event_time_slots_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE not valid;

alter table "public"."event_time_slots" validate constraint "event_time_slots_event_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."game_systems" add constraint "game_systems_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."game_systems" validate constraint "game_systems_created_by_fkey";

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

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
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

grant delete on table "public"."event_tables" to "anon";

grant insert on table "public"."event_tables" to "anon";

grant references on table "public"."event_tables" to "anon";

grant select on table "public"."event_tables" to "anon";

grant trigger on table "public"."event_tables" to "anon";

grant truncate on table "public"."event_tables" to "anon";

grant update on table "public"."event_tables" to "anon";

grant delete on table "public"."event_tables" to "authenticated";

grant insert on table "public"."event_tables" to "authenticated";

grant references on table "public"."event_tables" to "authenticated";

grant select on table "public"."event_tables" to "authenticated";

grant trigger on table "public"."event_tables" to "authenticated";

grant truncate on table "public"."event_tables" to "authenticated";

grant update on table "public"."event_tables" to "authenticated";

grant delete on table "public"."event_tables" to "service_role";

grant insert on table "public"."event_tables" to "service_role";

grant references on table "public"."event_tables" to "service_role";

grant select on table "public"."event_tables" to "service_role";

grant trigger on table "public"."event_tables" to "service_role";

grant truncate on table "public"."event_tables" to "service_role";

grant update on table "public"."event_tables" to "service_role";

grant delete on table "public"."event_time_slots" to "anon";

grant insert on table "public"."event_time_slots" to "anon";

grant references on table "public"."event_time_slots" to "anon";

grant select on table "public"."event_time_slots" to "anon";

grant trigger on table "public"."event_time_slots" to "anon";

grant truncate on table "public"."event_time_slots" to "anon";

grant update on table "public"."event_time_slots" to "anon";

grant delete on table "public"."event_time_slots" to "authenticated";

grant insert on table "public"."event_time_slots" to "authenticated";

grant references on table "public"."event_time_slots" to "authenticated";

grant select on table "public"."event_time_slots" to "authenticated";

grant trigger on table "public"."event_time_slots" to "authenticated";

grant truncate on table "public"."event_time_slots" to "authenticated";

grant update on table "public"."event_time_slots" to "authenticated";

grant delete on table "public"."event_time_slots" to "service_role";

grant insert on table "public"."event_time_slots" to "service_role";

grant references on table "public"."event_time_slots" to "service_role";

grant select on table "public"."event_time_slots" to "service_role";

grant trigger on table "public"."event_time_slots" to "service_role";

grant truncate on table "public"."event_time_slots" to "service_role";

grant update on table "public"."event_time_slots" to "service_role";

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

grant delete on table "public"."game_systems" to "anon";

grant insert on table "public"."game_systems" to "anon";

grant references on table "public"."game_systems" to "anon";

grant select on table "public"."game_systems" to "anon";

grant trigger on table "public"."game_systems" to "anon";

grant truncate on table "public"."game_systems" to "anon";

grant update on table "public"."game_systems" to "anon";

grant delete on table "public"."game_systems" to "authenticated";

grant insert on table "public"."game_systems" to "authenticated";

grant references on table "public"."game_systems" to "authenticated";

grant select on table "public"."game_systems" to "authenticated";

grant trigger on table "public"."game_systems" to "authenticated";

grant truncate on table "public"."game_systems" to "authenticated";

grant update on table "public"."game_systems" to "authenticated";

grant delete on table "public"."game_systems" to "service_role";

grant insert on table "public"."game_systems" to "service_role";

grant references on table "public"."game_systems" to "service_role";

grant select on table "public"."game_systems" to "service_role";

grant trigger on table "public"."game_systems" to "service_role";

grant truncate on table "public"."game_systems" to "service_role";

grant update on table "public"."game_systems" to "service_role";


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



  create policy "admins can delete event tables"
  on "public"."event_tables"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admins can insert event tables"
  on "public"."event_tables"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() AND (created_by = auth.uid())));



  create policy "admins can update event tables"
  on "public"."event_tables"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "admins can view all event tables"
  on "public"."event_tables"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "everyone can view tables for non private events"
  on "public"."event_tables"
  as permissive
  for select
  to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM (public.event_time_slots
     JOIN public.events ON ((events.id = event_time_slots.event_id)))
  WHERE ((event_time_slots.id = event_tables.time_slot_id) AND (events.visibility = ANY (ARRAY['public'::public.event_visibility, 'restricted'::public.event_visibility]))))));



  create policy "admins can delete event time slots"
  on "public"."event_time_slots"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admins can insert event time slots"
  on "public"."event_time_slots"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() AND (created_by = auth.uid())));



  create policy "admins can update event time slots"
  on "public"."event_time_slots"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "admins can view all event time slots"
  on "public"."event_time_slots"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "everyone can view slots for non private events"
  on "public"."event_time_slots"
  as permissive
  for select
  to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_time_slots.event_id) AND (events.visibility = ANY (ARRAY['public'::public.event_visibility, 'restricted'::public.event_visibility]))))));



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



  create policy "admins can delete game systems"
  on "public"."game_systems"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "admins can insert game systems"
  on "public"."game_systems"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin() AND (created_by = auth.uid())));



  create policy "admins can update game systems"
  on "public"."game_systems"
  as permissive
  for update
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "everyone can view game systems"
  on "public"."game_systems"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER set_event_tables_updated_at BEFORE UPDATE ON public.event_tables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_event_time_slots_updated_at BEFORE UPDATE ON public.event_time_slots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_game_systems_updated_at BEFORE UPDATE ON public.game_systems FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


