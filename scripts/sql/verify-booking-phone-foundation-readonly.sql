\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_definition text;
  v_constraint text;
  v_rls boolean;
begin
  if to_regprocedure(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
  ) is null then
    raise exception 'READONLY_LEGACY_FUNCTION_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
  ) is null then
    raise exception 'READONLY_INTERNAL_FUNCTION_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)'
  ) is null then
    raise exception 'READONLY_INGRESS_FUNCTION_MISSING';
  end if;

  select pg_get_functiondef(
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)'::regprocedure
  ) into v_definition;

  if v_definition not like '%submit_international_booking_request%' then
    raise exception 'READONLY_INGRESS_NOT_USING_INTERNAL_FUNCTION';
  end if;

  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'READONLY_PHASE_A_LEGACY_ANON_EXECUTE_MISSING';
  end if;

  if has_function_privilege(
    'anon',
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'READONLY_INTERNAL_FUNCTION_PUBLICLY_EXECUTABLE';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'READONLY_INTERNAL_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if has_function_privilege(
    'anon',
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'READONLY_INGRESS_PUBLICLY_EXECUTABLE';
  end if;

  select pg_get_constraintdef(oid)
  into v_constraint
  from pg_constraint
  where conrelid = 'public.booking_ingress_attempts'::regclass
    and conname = 'booking_ingress_attempts_normalized_phone_check';

  if v_constraint is null or v_constraint not like '%[1-9][0-9]{7,14}%' then
    raise exception 'READONLY_INGRESS_E164_CONSTRAINT_MISSING';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_normalized_phone_e164_check'
  ) then
    raise exception 'READONLY_BOOKING_E164_CONSTRAINT_MISSING';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'booking_requests'
      and indexname = 'booking_requests_active_phone_slot_unique'
  ) or not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'booking_ingress_attempts'
      and indexname = 'idx_booking_ingress_phone_attempted'
  ) then
    raise exception 'READONLY_REQUIRED_INDEX_MISSING';
  end if;

  select relrowsecurity into v_rls
  from pg_class
  where oid = 'public.booking_requests'::regclass;
  if not coalesce(v_rls, false) then
    raise exception 'READONLY_BOOKING_RLS_DISABLED';
  end if;

  select relrowsecurity into v_rls
  from pg_class
  where oid = 'public.booking_ingress_attempts'::regclass;
  if not coalesce(v_rls, false) then
    raise exception 'READONLY_INGRESS_RLS_DISABLED';
  end if;

  if has_table_privilege('anon', 'public.booking_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_requests', 'INSERT')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'SELECT') then
    raise exception 'READONLY_TABLE_PRIVILEGES_WIDENED';
  end if;
end
$$;

commit;
