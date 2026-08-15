--------------------------------------------------------------------------------
-- Membership Payment Method
--------------------------------------------------------------------------------

create type public.membership_payment_method as enum (
  'twint',
  'bank_transfer',
  'cash'
);
