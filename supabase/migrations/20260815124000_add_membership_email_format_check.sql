alter table public.memberships
add constraint memberships_email_format
check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
not valid;
