--------------------------------------------------------------------------------
-- Event Table Age Requirement
--------------------------------------------------------------------------------

create type public.event_table_age_requirement as enum (
  'kids',
  'age_14_plus',
  'age_15_plus',
  'age_16_plus',
  'age_17_plus',
  'age_18_plus'
);
