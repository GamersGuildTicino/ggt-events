
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

CREATE UNIQUE INDEX game_systems_pkey ON public.game_systems USING btree (id);

alter table "public"."game_systems" add constraint "game_systems_pkey" PRIMARY KEY using index "game_systems_pkey";

alter table "public"."game_systems" add constraint "game_systems_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."game_systems" validate constraint "game_systems_created_by_fkey";

set check_function_bodies = off;

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


CREATE TRIGGER set_game_systems_updated_at BEFORE UPDATE ON public.game_systems FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


