\set ON_ERROR_STOP on

-- Executable assertions for Phase A after applying it over the current schema.

do $$
declare
  v_snapshot public._booking_phone_rollout_snapshot%rowtype;
  v_current_function_hash text;
  v_current_booking_hash text;
  v_booking_count bigint;
  v_ingress_count bigint;
  v_constraint text;
  v_rls boolean;
begin
  select * into strict v_snapshot
  from public._booking_phone_rollout_snapshot
  where singleton;

  select md5(pg_get_functiondef(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'::regprocedure
  )) into v_current_function_hash;

  if v_current_function_hash <> v_snapshot.legacy_function_hash then
    raise exception 'PHASE_A_CHANGED_LEGACY_PUBLIC_FUNCTION';
  end if;

  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'PHASE_A_REVOKED_LEGACY_ANON_EXECUTE';
  end if;

  select md5(row_to_json(b)::text)
  into v_current_booking_hash
  from public.booking_requests b
  where b.id = v_snapshot.legacy_booking_id;

  if v_current_booking_hash <> v_snapshot.legacy_booking_hash then
    raise exception 'PHASE_A_REWROTE_LEGACY_BOOKING';
  end if;

  select count(*) into v_booking_count from public.booking_requests;
  select count(*) into v_ingress_count from public.booking_ingress_attempts;

  if v_booking_count <> v_snapshot.booking_count
     or v_ingress_count <> v_snapshot.ingress_count then
    raise exception 'PHASE_A_CHANGED_EXISTING_ROW_COUNTS: bookings %, ingress %',
      v_booking_count, v_ingress_count;
  end if;

  if public.normalize_international_phone('+1 (202) 555-0123') <> '12025550123'
     or public.normalize_international_phone('001-202-555-0123') <> '12025550123'
     or public.normalize_international_phone('+1 202 555 0123') <> '12025550123'
     or public.normalize_international_phone('050 000 0000') <> '971500000000' then
    raise exception 'PHASE_A_CANONICAL_NORMALIZATION_FAILED';
  end if;

  if public.normalize_international_phone('2025550123') is not null then
    raise exception 'PHASE_A_ACCEPTED_AMBIGUOUS_NON_UAE_LOCAL_NUMBER';
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
    raise exception 'PHASE_A_INTERNAL_FUNCTION_PUBLICLY_EXECUTABLE';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'PHASE_A_INTERNAL_FUNCTION_SERVICE_ROLE_EXECUTE_MISSING';
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
    raise exception 'PHASE_A_INGRESS_PUBLICLY_EXECUTABLE';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'PHASE_A_INGRESS_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  select pg_get_constraintdef(oid)
  into v_constraint
  from pg_constraint
  where conrelid = 'public.booking_ingress_attempts'::regclass
    and conname = 'booking_ingress_attempts_normalized_phone_check';

  if v_constraint is null or v_constraint not like '%[1-9][0-9]{7,14}%' then
    raise exception 'PHASE_A_INGRESS_E164_CONSTRAINT_MISSING: %', v_constraint;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_normalized_phone_e164_check'
  ) then
    raise exception 'PHASE_A_BOOKING_E164_CONSTRAINT_MISSING';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'booking_requests'
      and indexname = 'booking_requests_active_phone_slot_unique'
  ) or not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'booking_ingress_attempts'
      and indexname = 'idx_booking_ingress_phone_attempted'
  ) then
    raise exception 'PHASE_A_BOOKING_INDEX_MISSING';
  end if;

  select relrowsecurity into v_rls
  from pg_class
  where oid = 'public.booking_requests'::regclass;
  if not coalesce(v_rls, false) then
    raise exception 'PHASE_A_BOOKING_RLS_DISABLED';
  end if;

  select relrowsecurity into v_rls
  from pg_class
  where oid = 'public.booking_ingress_attempts'::regclass;
  if not coalesce(v_rls, false) then
    raise exception 'PHASE_A_INGRESS_RLS_DISABLED';
  end if;

  if has_table_privilege('anon', 'public.booking_requests', 'INSERT')
     or has_table_privilege('anon', 'public.booking_requests', 'UPDATE')
     or has_table_privilege('anon', 'public.booking_requests', 'DELETE')
     or has_table_privilege('authenticated', 'public.booking_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_requests', 'UPDATE')
     or has_table_privilege('authenticated', 'public.booking_requests', 'DELETE')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'INSERT') then
    raise exception 'PHASE_A_WIDENED_TABLE_PRIVILEGES';
  end if;
end
$$;

-- Prove the protected ingress and internal international function execute as service_role.
set role service_role;

do $$
declare
  v_date date := current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7;
  v_first jsonb;
  v_same_idempotency jsonb;
  v_duplicate jsonb;
  v_first_id uuid;
begin
  v_first := public.submit_booking_request_ingress(
    'International Foundation Test',
    '+1 (202) 555-0123',
    'Male',
    'Adult',
    'Al Falah',
    null,
    true,
    false,
    'Private',
    v_date,
    time '16:45',
    true,
    '00000000-0000-4000-8000-0000000000b1'::uuid,
    repeat('a', 64),
    '',
    3000
  );

  if coalesce((v_first->>'success')::boolean, false) is distinct from true
     or coalesce((v_first->>'duplicate')::boolean, true) is distinct from false then
    raise exception 'PHASE_A_SERVICE_ROLE_INTERNATIONAL_INGRESS_FAILED: %', v_first;
  end if;

  v_first_id := (v_first->>'bookingRequestId')::uuid;

  v_same_idempotency := public.submit_booking_request_ingress(
    'International Foundation Test',
    '001-202-555-0123',
    'Male',
    'Adult',
    'Al Falah',
    null,
    true,
    false,
    'Private',
    v_date,
    time '16:45',
    true,
    '00000000-0000-4000-8000-0000000000b1'::uuid,
    repeat('b', 64),
    '',
    3000
  );

  if coalesce((v_same_idempotency->>'success')::boolean, false) is distinct from true
     or coalesce((v_same_idempotency->>'duplicate')::boolean, false) is distinct from true
     or (v_same_idempotency->>'bookingRequestId')::uuid <> v_first_id then
    raise exception 'PHASE_A_IDEMPOTENCY_FAILED: %', v_same_idempotency;
  end if;

  v_duplicate := public.submit_booking_request_ingress(
    'International Duplicate Test',
    '+1 202-555-0123',
    'Female',
    'Adult',
    'Al Falah',
    null,
    false,
    false,
    'Private',
    v_date,
    time '16:45',
    true,
    '00000000-0000-4000-8000-0000000000b2'::uuid,
    repeat('c', 64),
    '',
    3000
  );

  if v_duplicate->>'code' <> 'DUPLICATE_REQUEST' then
    raise exception 'PHASE_A_DUPLICATE_DETECTION_FAILED: %', v_duplicate;
  end if;

  if (select normalized_phone from public.booking_requests where id = v_first_id) <> '12025550123' then
    raise exception 'PHASE_A_INTERNATIONAL_CANONICAL_STORAGE_FAILED';
  end if;
end
$$;

-- Five differently formatted attempts for one canonical phone must share one rate-limit key.
do $$
declare
  v_date date := current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7;
  v_result jsonb;
  v_index integer;
  v_phone text;
begin
  for v_index in 1..5 loop
    v_phone := case v_index
      when 1 then '+1 (202) 555-0124'
      when 2 then '001-202-555-0124'
      when 3 then '+1 202 555 0124'
      when 4 then '+12025550124'
      else '0012025550124'
    end;

    v_result := public.submit_booking_request_ingress(
      'Rate Limit Foundation Test',
      v_phone,
      'Male',
      'Adult',
      'Al Falah',
      null,
      false,
      false,
      'Private',
      v_date,
      time '16:01',
      true,
      ('00000000-0000-4000-8000-' || lpad((200 + v_index)::text, 12, '0'))::uuid,
      repeat(substr('def0123456', v_index, 1), 64),
      '',
      3000
    );

    if v_result->>'code' = 'RATE_LIMITED' then
      raise exception 'PHASE_A_RATE_LIMIT_TRIGGERED_TOO_EARLY_AT_%: %', v_index, v_result;
    end if;
  end loop;

  v_result := public.submit_booking_request_ingress(
    'Rate Limit Foundation Test',
    '+1-202-555-0124',
    'Male',
    'Adult',
    'Al Falah',
    null,
    false,
    false,
    'Private',
    v_date,
    time '16:01',
    true,
    '00000000-0000-4000-8000-000000000299'::uuid,
    repeat('9', 64),
    '',
    3000
  );

  if v_result->>'code' <> 'RATE_LIMITED' then
    raise exception 'PHASE_A_CANONICAL_PHONE_RATE_LIMIT_FAILED: %', v_result;
  end if;

  if (select count(distinct normalized_phone)
      from public.booking_ingress_attempts
      where normalized_phone = '12025550124') <> 1 then
    raise exception 'PHASE_A_RATE_LIMIT_NORMALIZATION_DIVERGED';
  end if;
end
$$;

reset role;

drop table public._booking_phone_rollout_snapshot;
