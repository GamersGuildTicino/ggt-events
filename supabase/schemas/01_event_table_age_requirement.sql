--------------------------------------------------------------------------------
-- Event Table Age Requirement
--------------------------------------------------------------------------------

create type public.event_table_age_requirement as enum (
  'any',
  'age_9_11',
  'age_11_13',
  'age_14_plus',
  'age_15_plus',
  'age_16_plus',
  'age_17_plus',
  'age_18_plus'
);
