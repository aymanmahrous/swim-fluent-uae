\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_source text;
begin
  if has_function_privilege('anon', 'public.update_booking_request_status(uuid,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)', 'EXECUTE')
     or has_function_privilege('anon', 'public.set_staff_conversation_mode(uuid,text)', 'EXECUTE') then
    raise exception 'SEC_01B_ANON_EXECUTE_EXPOSED';
  end if;

  if not has_function_privilege('authenticated', 'public.update_booking_request_status(uuid,text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.set_staff_conversation_mode(uuid,text)', 'EXECUTE') then
    raise exception 'SEC_01B_AUTHENTICATED_EXECUTE_MISSING';
  end if;

  select regexp_replace(lower(prosrc), '\s+', '', 'g') into v_source
  from pg_proc where oid = 'public.update_booking_request_status(uuid,text)'::regprocedure;
  if strpos(v_source, $token$public.is_active_staff(array['super_admin','admin','reception'])$token$) = 0
     or strpos(v_source, 'coach') > 0
     or strpos(v_source, 'content_manager') > 0
     or strpos(v_source, $token$p_statusnotin('pending','contacted','confirmed','declined','cancelled')$token$) = 0
     or strpos(v_source, 'booking_request_status_updated') = 0 then
    raise exception 'SEC_01B_BOOKING_CONTRACT_INVALID';
  end if;

  select regexp_replace(lower(prosrc), '\s+', '', 'g') into v_source
  from pg_proc where oid = 'public.update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)'::regprocedure;
  if strpos(v_source, $token$public.is_active_staff(array['super_admin','admin','reception','coach'])$token$) = 0
     or strpos(v_source, 'content_manager') > 0
     or strpos(v_source, $token$p_stagenotin('new','contacted','qualified','booking_intent','booked','follow_up','lost','customer')$token$) = 0
     or strpos(v_source, 'invalid_follow_up_time') = 0
     or strpos(v_source, 'follow_up_too_far') = 0
     or strpos(v_source, 'lead_workflow_updated') = 0 then
    raise exception 'SEC_01B_LEAD_CONTRACT_INVALID';
  end if;

  select regexp_replace(lower(prosrc), '\s+', '', 'g') into v_source
  from pg_proc where oid = 'public.set_staff_conversation_mode(uuid,text)'::regprocedure;
  if strpos(v_source, $token$public.is_active_staff(array['super_admin','admin','reception'])$token$) = 0
     or strpos(v_source, 'coach') > 0
     or strpos(v_source, 'content_manager') > 0
     or strpos(v_source, $token$p_modenotin('ai_active','human_takeover','human_required','paused')$token$) = 0
     or strpos(v_source, 'conversation_mode_updated') = 0 then
    raise exception 'SEC_01B_CONVERSATION_CONTRACT_INVALID';
  end if;
end
$$;

select jsonb_pretty(jsonb_build_object(
  'status', 'STATIC_CONTRACTS_PASS',
  'functions', jsonb_build_array(
    'update_booking_request_status(uuid,text)',
    'update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)',
    'set_staff_conversation_mode(uuid,text)'
  ),
  'disposable_role_execution', 'REQUIRED_BEFORE_PASS_EXPANSION'
)) as sec_01b_summary;

commit;
