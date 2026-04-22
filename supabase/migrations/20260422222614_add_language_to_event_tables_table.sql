create type "public"."event_table_language" as enum ('unspecified', 'italian', 'english', 'french', 'german', 'spanish', 'portuguese');

alter table "public"."event_tables" add column "language" public.event_table_language not null default 'italian'::public.event_table_language;


