set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_event_registration(p_registration_id uuid)
 RETURNS public.event_registrations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_registration public.event_registrations;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception using message = 'forbidden';
  end if;

  delete from public.event_registrations
  where id = p_registration_id
  returning *
  into v_registration;

  if not found then
    raise exception using message = 'event_registration_not_found';
  end if;

  return v_registration;
end;
$function$
;


