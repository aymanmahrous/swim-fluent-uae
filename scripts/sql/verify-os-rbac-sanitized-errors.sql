\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_command_source text;
  v_operations_source text;
begin
  select regexp_replace(lower(prosrc), '\s+', '', 'g')
    into v_command_source
  from pg_proc
  where oid = 'public.get_staff_command_center()'::regprocedure;

  select regexp_replace(lower(prosrc), '\s+', '', 'g')
    into v_operations_source
  from pg_proc
  where oid = 'public.get_staff_operations_queue()'::regprocedure;

  if v_command_source is null or v_operations_source is null then
    raise exception 'OS_RBAC_FUNCTION_MISSING';
  end if;

  if strpos(v_command_source, "public.is_active_staff(array['super_admin','admin','reception','coach'])") = 0 then
    raise exception 'COMMAND_CENTER_ALLOWED_ROLE_MATRIX_INVALID';
  end if;

  if strpos(v_operations_source, "public.is_active_staff(array['super_admin','admin','reception','coach'])") = 0 then
    raise exception 'OPERATIONS_QUEUE_ALLOWED_ROLE_MATRIX_INVALID';
  end if;

  if strpos(v_command_source, 'content_manager') > 0 then
    raise exception 'COMMAND_CENTER_CONTENT_MANAGER_STILL_ALLOWED';
  end if;

  if strpos(v_operations_source, 'content_manager') > 0 then
    raise exception 'OPERATIONS_QUEUE_CONTENT_MANAGER_STILL_ALLOWED';
  end if;

  if strpos(v_operations_source, "whenv_staff_role='coach'andj.last_errorisnotnullthen'job_failed'") = 0 then
    raise exception 'COACH_LAST_ERROR_SANITIZER_MISSING';
  end if;

  if strpos(v_operations_source, "selectsp.role::textintov_staff_rolefrompublic.staff_profilesspwheresp.id=auth.uid()andsp.active=true") = 0 then
    raise exception 'COACH_ROLE_RESOLUTION_MISSING';
  end if;

  if strpos(v_operations_source, "elsej.last_error") = 0 then
    raise exception 'PRIVILEGED_RAW_ERROR_PATH_MISSING';
  end if;

  if has_function_privilege('anon', 'public.get_staff_command_center()', 'EXECUTE')
     or has_function_privilege('anon', 'public.get_staff_operations_queue()', 'EXECUTE') then
    raise exception 'OS_RBAC_ANON_EXECUTE_EXPOSED';
  end if;

  if not has_function_privilege('authenticated', 'public.get_staff_command_center()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.get_staff_operations_queue()', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.get_staff_command_center()', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.get_staff_operations_queue()', 'EXECUTE') then
    raise exception 'OS_RBAC_REQUIRED_EXECUTE_MISSING';
  end if;
end
$$;

commit;

select 'os_rbac_sanitized_errors_verified' as result;
