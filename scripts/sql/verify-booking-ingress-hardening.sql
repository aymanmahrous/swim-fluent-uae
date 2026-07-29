do $$
declare
  direct_booking text :=
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time,boolean,uuid)';
  hardened_ingress text :=
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time,boolean,uuid,text,text,integer)';
  media_trigger text := 'public.enqueue_content_media_after_insert()';
begin
  if to_regprocedure(direct_booking) is null then
    raise exception 'DIRECT_BOOKING_FUNCTION_MISSING';
  end if;
  if to_regprocedure(hardened_ingress) is null then
    raise exception 'HARDENED_BOOKING_INGRESS_MISSING';
  end if;
  if to_regprocedure(media_trigger) is null then
    raise exception 'MEDIA_TRIGGER_FUNCTION_MISSING';
  end if;

  if has_function_privilege('anon', direct_booking, 'EXECUTE')
     or has_function_privilege('authenticated', direct_booking, 'EXECUTE')
  then
    raise exception 'DIRECT_BOOKING_RPC_STILL_PUBLIC';
  end if;

  if has_function_privilege('anon', hardened_ingress, 'EXECUTE')
     or has_function_privilege('authenticated', hardened_ingress, 'EXECUTE')
  then
    raise exception 'HARDENED_BOOKING_INGRESS_EXPOSED';
  end if;

  if not has_function_privilege('service_role', direct_booking, 'EXECUTE')
     or not has_function_privilege('service_role', hardened_ingress, 'EXECUTE')
  then
    raise exception 'BOOKING_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if has_function_privilege('anon', media_trigger, 'EXECUTE')
     or has_function_privilege('authenticated', media_trigger, 'EXECUTE')
  then
    raise exception 'MEDIA_TRIGGER_EXECUTE_STILL_PUBLIC';
  end if;
end
$$;

select 'booking_ingress_hardening_verified' as result;
