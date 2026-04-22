create type "public"."event_table_experience_level" as enum ('unspecified', 'any', 'first_time', 'novice', 'intermediate', 'expert');

alter table "public"."event_tables" add column "experience_level" public.event_table_experience_level not null default 'unspecified'::public.event_table_experience_level;


