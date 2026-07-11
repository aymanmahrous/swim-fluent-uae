\set ON_ERROR_STOP on

begin read only;

do $$
declare
  v_snapshot migration_test.phase_a_snapshot%rowtype;
  v_current_function_hash text;
  v_current_booking_hash text;
  v_current_count bigint;
begin
  select * into strict v_snapshot from migration_test.phase_a_snapshot;

  select md5(pg_get_functiondef(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'::regprocedure
  )) into v_current_function_hash;

  if v_current_function_hash <> v_snapshot.legacy_function_hash then
    raise exception 'STACKED_PHASE_A_CHANGED_LEGACY_FUNCTION';
  end if;

  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'STACKED_PHASE_A_REVOKED_LEGACY_ANON_EXECUTE';
  end if;

  select md5(row_to_json(b)::text)
  into v_current_booking_hash
  from public.booking_requests b
  where b.id = v_snapshot.legacy_booking_id;

  if v_current_booking_hash <> v_snapshot.legacy_booking_hash then
    raise exception 'STACKED_PHASE_A_REWROTE_LEGACY_BOOKING';
  end if;

  select count(*) into v_current_count from public.booking_requests;
  if v_current_count <> v_snapshot.booking_count then
    raise exception 'STACKED_PHASE_A_CHANGED_BOOKING_COUNT_BEFORE_EXECUTION';
  end if;

  if to_regprocedure('public.normalize_international_phone(text)') is null
     or to_regprocedure(
       'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
     ) is null then
    raise exception 'STACKED_PHASE_A_INTERNATIONAL_CONTRACT_MISSING';
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
    raise exception 'STACKED_PHASE_A_INTERNAL_FUNCTION_PUBLIC_EXECUTE';
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
    raise exception 'STACKED_PHASE_A_INGRESS_PUBLIC_EXECUTE';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'STACKED_PHASE_A_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if public.normalize_international_phone('+1 (202) 555-0123') <> '12025550123'
     or public.normalize_international_phone('001-202-555-0123') <> '12025550123'
     or public.normalize_international_phone('050 000 0001') <> '971500000001' then
    raise exception 'STACKED_PHASE_A_NORMALIZATION_FAILED';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_normalized_phone_e164_check'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_ingress_attempts'::regclass
      and conname = 'booking_ingress_attempts_normalized_phone_check'
      and pg_get_constraintdef(oid) like '%[1-9][0-9]{7,14}%'
  ) then
    raise exception 'STACKED_PHASE_A_E164_CONSTRAINT_MISSING';
  end if;

  if has_table_privilege('anon', 'public.booking_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_requests', 'INSERT')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'SELECT') then
    raise exception 'STACKED_PHASE_A_TABLE_GRANTS_WIDENED';
  end if;
end
$$;

commit;

set role service_role;

select public.submit_booking_request_ingress(
  'Stacked International Booking',
  '+1 (202) 555-0123',
  'Female',
  'Adult',
  'Al Falah',
  null,
  false,
  false,
  'Private',
  current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7,
  time '16:45',
  true,
  '50000000-0000-4000-8000-000000000002'::uuid,
  repeat('a', 64),
  '',
  3000
) as international_result
\gset

reset role;

do $$
declare
  v_result jsonb := :'international_result'::jsonb;
begin
  if coalesce((v_result->>'success')::boolean, false) is distinct from true then
    raise exception 'STACKED_PHASE_A_INTERNATIONAL_INGRESS_FAILED: %', v_result;
  end if;

  if (select normalized_phone
      from public.booking_requests
      where idempotency_key = '50000000-0000-4000-8000-000000000002'::uuid)
      <> '12025550123' then
    raise exception 'STACKED_PHASE_A_INTERNATIONAL_STORAGE_FAILED';
  end if;

  if (select count(*) from public.booking_requests) < 2 then
    raise exception 'STACKED_PHASE_A_LEGACY_OR_INTERNATIONAL_BOOKING_MISSING';
  end if;
end
$$;

drop schema migration_test cascade;
