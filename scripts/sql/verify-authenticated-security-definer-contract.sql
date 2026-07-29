\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_contract constant jsonb := $contract$
  [
    {"signature":"can_manage_relax_fix_media()","search_path":"search_path=public, pg_temp","guard_tokens":["frompublic.staff_profilessp","wheresp.id=auth.uid()","andsp.active=true","andsp.rolein('super_admin','admin','content_manager')"]},
    {"signature":"create_staff_generated_content_batch(jsonb,text)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"create_staff_media_asset_record(uuid,text,text,text,text,text,jsonb)","search_path":"search_path=public, storage, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"create_staff_video_generation_job(uuid,text,text,text,text,text,integer,jsonb)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"get_staff_bookings()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"get_staff_command_center()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach','content_manager'])"]},
    {"signature":"get_staff_content_automation_status()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"get_staff_content_brain_context()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"get_staff_content_items()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach','content_manager'])"]},
    {"signature":"get_staff_conversation_messages(uuid)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"get_staff_crm_leads()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"get_staff_growth_analytics()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach','content_manager'])"]},
    {"signature":"get_staff_inbox()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"get_staff_media_assets()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach','content_manager'])"]},
    {"signature":"get_staff_operations_queue()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach','content_manager'])"]},
    {"signature":"get_staff_video_generation_job(uuid)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"get_staff_video_generation_jobs()","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"set_staff_conversation_mode(uuid,text)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"transition_staff_content_item(uuid,text,timestamp with time zone)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"update_booking_request_status(uuid,text)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception'])"]},
    {"signature":"update_staff_content_item(uuid,text,text,text,text,text[],text)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]},
    {"signature":"update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)","search_path":"search_path=public, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','reception','coach'])"]},
    {"signature":"update_staff_video_generation_job(uuid,text,text,text,jsonb)","search_path":"search_path=public, storage, pg_temp","guard_tokens":["public.is_active_staff(array['super_admin','admin','content_manager'])"]}
  ]
  $contract$::jsonb;
  v_expected record;
  v_oid oid;
  v_proc pg_proc%rowtype;
  v_source text;
  v_token text;
  v_search_paths text[];
  v_grantees text[];
  v_unexpected text;
begin
  if jsonb_array_length(v_contract) <> 23 then
    raise exception 'AUTH_SECURITY_DEFINER_CONTRACT_COUNT_INVALID';
  end if;

  for v_expected in
    select *
    from jsonb_to_recordset(v_contract)
      as x(signature text, search_path text, guard_tokens jsonb)
  loop
    v_oid := to_regprocedure('public.' || v_expected.signature);
    if v_oid is null then
      raise exception 'AUTH_SECURITY_DEFINER_MISSING:%', v_expected.signature;
    end if;

    select * into strict v_proc from pg_proc where oid = v_oid;

    if not v_proc.prosecdef then
      raise exception 'AUTH_SECURITY_DEFINER_NOT_DEFINER:%', v_expected.signature;
    end if;

    if has_function_privilege('anon', v_oid, 'EXECUTE') then
      raise exception 'AUTH_SECURITY_DEFINER_ANON_EXECUTE:%', v_expected.signature;
    end if;
    if not has_function_privilege('authenticated', v_oid, 'EXECUTE')
       or not has_function_privilege('service_role', v_oid, 'EXECUTE') then
      raise exception 'AUTH_SECURITY_DEFINER_REQUIRED_EXECUTE_MISSING:%', v_expected.signature;
    end if;

    select coalesce(
             array_agg(coalesce(r.rolname, 'PUBLIC') order by coalesce(r.rolname, 'PUBLIC')),
             '{}'::text[]
           )
      into v_grantees
    from aclexplode(coalesce(v_proc.proacl, acldefault('f', v_proc.proowner))) a
    left join pg_roles r on r.oid = a.grantee
    where a.privilege_type = 'EXECUTE'
      and a.grantee <> v_proc.proowner;

    if v_grantees is distinct from array['authenticated','service_role']::text[] then
      raise exception 'AUTH_SECURITY_DEFINER_EXECUTE_GRANTEES_INVALID:%:%',
        v_expected.signature, v_grantees;
    end if;

    select coalesce(array_agg(cfg order by cfg), '{}'::text[])
      into v_search_paths
    from unnest(coalesce(v_proc.proconfig, '{}'::text[])) cfg
    where cfg like 'search_path=%';

    if v_search_paths is distinct from array[v_expected.search_path]::text[] then
      raise exception 'AUTH_SECURITY_DEFINER_SEARCH_PATH_INVALID:%:%',
        v_expected.signature, v_search_paths;
    end if;

    v_source := regexp_replace(lower(v_proc.prosrc), '\s+', '', 'g');
    for v_token in select jsonb_array_elements_text(v_expected.guard_tokens)
    loop
      if strpos(v_source, lower(v_token)) = 0 then
        raise exception 'AUTH_SECURITY_DEFINER_GUARD_INVALID:%:%',
          v_expected.signature, v_token;
      end if;
    end loop;
  end loop;

  select string_agg(p.oid::regprocedure::text, E'\n' order by p.oid::regprocedure::text)
    into v_unexpected
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and has_function_privilege('authenticated', p.oid, 'EXECUTE')
    and not exists (
      select 1
      from jsonb_to_recordset(v_contract)
        as x(signature text, search_path text, guard_tokens jsonb)
      where to_regprocedure('public.' || x.signature) = p.oid
    );

  if v_unexpected is not null then
    raise exception 'AUTH_SECURITY_DEFINER_UNCLASSIFIED:%', E'\n' || v_unexpected;
  end if;

  if to_regclass('public.staff_profiles') is null then
    raise exception 'STAFF_PROFILES_MISSING';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.staff_profiles'::regclass) then
    raise exception 'STAFF_PROFILES_RLS_DISABLED';
  end if;
  if not has_table_privilege('authenticated', 'public.staff_profiles', 'SELECT') then
    raise exception 'STAFF_PROFILES_AUTHENTICATED_SELECT_MISSING';
  end if;
  if has_table_privilege('authenticated', 'public.staff_profiles', 'INSERT')
     or has_table_privilege('authenticated', 'public.staff_profiles', 'UPDATE')
     or has_table_privilege('authenticated', 'public.staff_profiles', 'DELETE')
     or has_table_privilege('authenticated', 'public.staff_profiles', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.staff_profiles', 'REFERENCES')
     or has_table_privilege('authenticated', 'public.staff_profiles', 'TRIGGER') then
    raise exception 'STAFF_PROFILES_AUTHENTICATED_WRITE_EXPOSED';
  end if;
end
$$;

commit;

select 'authenticated_security_definer_contract_verified' as result;
