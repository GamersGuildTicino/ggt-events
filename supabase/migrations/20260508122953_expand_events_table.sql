alter table "public"."events" add column "description" text not null default ''::text;

alter table "public"."events" add column "image_url" text not null default ''::text;

alter table "public"."events" add column "short_description" text not null default ''::text;

alter table "public"."events" add column "slug" text;

update "public"."events"
set "slug" = "id"::text
where "slug" is null;

alter table "public"."events" alter column "slug" set not null;

CREATE UNIQUE INDEX events_slug_key ON public.events USING btree (slug);

alter table "public"."events" add constraint "events_slug_format_valid" CHECK ((slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)) not valid;

alter table "public"."events" validate constraint "events_slug_format_valid";

alter table "public"."events" add constraint "events_slug_key" UNIQUE using index "events_slug_key";

