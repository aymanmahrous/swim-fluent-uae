\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_matrix constant jsonb := $matrix$
  [
    {"signature":"can_manage_relax_fix_media()","status":"NOT_VERIFIED"},
    {"signature":"create_staff_generated_content_batch(jsonb,text)","status":"NOT_VERIFIED"},
    {"signature":"create_staff_media_asset_record(uuid,text,text,text,text,text,jsonb)","status":"NOT_VERIFIED"},
    {"signature":"create_staff_video_generation_job(uuid,text,text,text,text,text,integer,jsonb)","status":"NOT_VERIFIED"},
    {"signature":"get_staff_bookings()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_command_center()","status":"VERIFIED","allow":["super_admin","admin","reception","coach"],"deny":["anon","authenticated_non_staff","inactive_staff","content_manager"]},
    {"signature":"get_staff_content_automation_status()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_content_brain_context()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_content_items()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_conversation_messages(uuid)","status":"NOT_VERIFIED"},
    {"signature":"get_staff_crm_leads()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_growth_analytics()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_inbox()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_media_assets()","status":"NOT_VERIFIED"},
    {"signature":"get_staff_operations_queue()","status":"VERIFIED","allow":["super_admin","admin","reception","coach"],"deny":["anon","authenticated_non_staff","inactive_staff","content_manager"],"coach_error":"JOB_FAILED"},
    {"signature":"get_staff_video_generation_job(uuid)","status":"NOT_VERIFIED"},
    {"signature":"get_staff_video_generation_jobs()","status":"NOT_VERIFIED"},
    {"signature":"set_staff_conversation_mode(uuid,text)","status":"NOT_VERIFIED"},
    {"signature":"transition_staff_content_item(uuid,text,timestamp with time zone)","status":"NOT_VERIFIED"},
    {"signature":"update_booking_request_status(uuid,text)","status":"NOT_VERIFIED"},
    {"signature":"update_staff_content_item(uuid,text,text,text,text,text[],text)","status":"NOT_VERIFIED"},
    {"signature":"update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)","status":"NOT_VERIFIED"},
    {"signature":"update_staff_video_generation_job(uuid,text,text,text,jsonb)","status":"NOT_VERIFIED"}
  ]
  $matrix$::jsonb;
  v_item record;
  v_oid oid;
  v_source text;
  v_verified integer;
  v_not_verified integer;
begin
  if jsonb_array_length(v_matrix) <> 23 then
    raise exception 'SECURITY_DEFINER_ROLE_MATRIX_COUNT_INVALID';
  end if;

  select count(*) filter (where value->>'status' = 'VERIFIED'),
         count(*) filter (where value->>'status' = 'NOT_VERIFIED')
    into v_verified, v_not_verified
  from jsonb_array_elements(v_matrix);

  if v_verified <> 2 or v_not_verified <> 21 then
    raise exception 'SECURITY_DEFINER_ROLE_MATRIX_STATUS_INVALID:%:%', v_verified, v_not_verified;
  end if;

  for v_item in
    select value->>'signature' as signature, value->>'status' as status
    from jsonb_array_elements(v_matrix)
  loop
    v_oid := to_regprocedure('public.' || v_item.signature);
    if v_oid is null then
      raise exception 'SECURITY_DEFINER_ROLE_MATRIX_FUNCTION_MISSING:%', v_item.signature;
    end if;
    if not (select prosecdef from pg_proc where oid = v_oid) then
      raise exception 'SECURITY_DEFINER_ROLE_MATRIX_NOT_DEFINER:%', v_item.signature;
    end if;
  end loop;

  select regexp_replace(lower(prosrc), '\s+', '', 'g') into v_source
  from pg_proc where oid = 'public.get_staff_command_center()'::regprocedure;

  if strpos(v_source, $token$public.is_active_staff(array['super_admin','admin','reception','coach'])$token$) = 0
     or strpos(v_source, 'content_manager') > 0 then
    raise exception 'COMMAND_CENTER_ROLE_CONTRACT_INVALID';
  end if;

  select regexp_replace(lower(prosrc), '\s+', '', 'g') into v_source
  from pg_proc where oid = 'public.get_staff_operations_queue()'::regprocedure;

  if strpos(v_source, $token$public.is_active_staff(array['super_admin','admin','reception','coach'])$token$) = 0
     or strpos(v_source, 'content_manager') > 0
     or strpos(v_source, $token$whenv_staff_role='coach'andj.last_errorisnotnullthen'job_failed'$token$) = 0 then
    raise exception 'OPERATIONS_QUEUE_ROLE_OR_SANITIZATION_CONTRACT_INVALID';
  end if;

  if has_function_privilege('anon', 'public.get_staff_command_center()', 'EXECUTE')
     or has_function_privilege('anon', 'public.get_staff_operations_queue()', 'EXECUTE') then
    raise exception 'VERIFIED_ROLE_CONTRACT_ANON_EXECUTE_EXPOSED';
  end if;

  if not has_function_privilege('authenticated', 'public.get_staff_command_center()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.get_staff_operations_queue()', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.get_staff_command_center()', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.get_staff_operations_queue()', 'EXECUTE') then
    raise exception 'VERIFIED_ROLE_CONTRACT_REQUIRED_EXECUTE_MISSING';
  end if;
end
$$;

select jsonb_pretty($matrix$
[
  {"signature":"get_staff_command_center()","status":"VERIFIED"},
  {"signature":"get_staff_operations_queue()","status":"VERIFIED","coach_error":"JOB_FAILED"},
  {"remaining_authenticated_rpcs":21,"status":"NOT_VERIFIED"}
]
$matrix$::jsonb) as role_contract_summary;

commit;
