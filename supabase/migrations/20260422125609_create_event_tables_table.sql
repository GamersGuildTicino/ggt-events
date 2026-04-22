
  create table "public"."event_tables" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "game_system_id" uuid not null,
    "title" text not null,
    "min_players" integer not null,
    "max_players" integer not null,
    "created_by" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event_tables" enable row level security;

CREATE UNIQUE INDEX event_tables_pkey ON public.event_tables USING btree (id);

alter table "public"."event_tables" add constraint "event_tables_pkey" PRIMARY KEY using index "event_tables_pkey";

alter table "public"."event_tables" add constraint "event_tables_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."event_tables" validate constraint "event_tables_created_by_fkey";

alter table "public"."event_tables" add constraint "event_tables_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE not valid;

alter table "public"."event_tables" validate constraint "event_tables_event_id_fkey";

alter table "public"."event_tables" add constraint "event_tables_game_system_id_fkey" FOREIGN KEY (game_system_id) REFERENCES public.game_systems(id) ON DELETE RESTRICT not valid;

alter table "public"."event_tables" validate constraint "event_tables_game_system_id_fkey";

alter table "public"."event_tables" add constraint "event_tables_max_players_valid" CHECK ((max_players >= min_players)) not valid;

alter table "public"."event_tables" validate constraint "event_tables_max_players_valid";

alter table "public"."event_tables" add constraint "event_tables_min_players_non_negative" CHECK ((min_players >= 0)) not valid;

alter table "public"."event_tables" validate constraint "event_tables_min_players_non_negative";

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
   FROM public.events
  WHERE ((events.id = event_tables.event_id) AND (events.visibility = ANY (ARRAY['public'::public.event_visibility, 'restricted'::public.event_visibility]))))));


CREATE TRIGGER set_event_tables_updated_at BEFORE UPDATE ON public.event_tables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


