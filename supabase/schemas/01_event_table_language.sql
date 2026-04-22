--------------------------------------------------------------------------------
-- Event Table Language
--------------------------------------------------------------------------------

create type public.event_table_language as enum (
  'unspecified',
  'italian',
  'english',
  'french',
  'german',
  'spanish',
  'portuguese'
);
