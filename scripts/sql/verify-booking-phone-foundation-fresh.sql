\set ON_ERROR_STOP on

-- Runs after the complete migration directory is applied to a fresh disposable database.
do $$
begin
  if to_regprocedure(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
  ) is null then
    raise exception 'FRESH_CHAIN_LEGACY_FUNCTION_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_international_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
  ) is null then
    raise exception 'FRESH_CHAIN_INTERNATIONAL_FUNCTION_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)'
  ) is null then
    raise exception 'FRESH_CHAIN_INGRESS_FUNCTION_MISSING';
  end if;

  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'FRESH_CHAIN_LEGACY_ANON_EXECUTE_MISSING';
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
    raise exception 'FRESH_CHAIN_INTERNAL_FUNCTION_PUBLICLY_EXECUTABLE';
  end if;

  if public.normalize_international_phone('+1 202-555-0123') <> '12025550123'
     or public.normalize_international_phone('0012025550123') <> '12025550123'
     or public.normalize_international_phone('0500000000') <> '971500000000' then
    raise exception 'FRESH_CHAIN_NORMALIZATION_FAILED';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_normalized_phone_e164_check'
  ) or not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_ingress_attempts'::regclass
      and conname = 'booking_ingress_attempts_normalized_phone_check'
  ) then
    raise exception 'FRESH_CHAIN_E164_CONSTRAINTS_MISSING';
  end if;
end
$$;

set role anon;

do $$
declare
  v_result jsonb;
  v_date date := current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7;
begin
  v_result := public.submit_booking_request(
    'Fresh Legacy UAE Test',
    '0500000000',
    'Male',
    'Adult',
    'Al Falah',
    null,
    true,
    false,
    'Private',
    v_date,
    time '16:00',
    true,
    '00000000-0000-4000-8000-0000000000c1'::uuid
  );

  if coalesce((v_result->>'success')::boolean, false) is distinct from true then
    raise exception 'FRESH_CHAIN_LEGACY_UAE_BOOKING_FAILED: %', v_result;
  end if;
end
$$;

reset role;
set role service_role;

do $$
declare
  v_result jsonb;
  v_date date := current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7;
begin
  v_result := public.submit_booking_request_ingress(
    'Fresh International Test',
    '+1 (202) 555-0123',
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
    '00000000-0000-4000-8000-0000000000c2'::uuid,
    repeat('7', 64),
    '',
    3000
  );

  if coalesce((v_result->>'success')::boolean, false) is distinct from true then
    raise exception 'FRESH_CHAIN_INTERNATIONAL_INGRESS_FAILED: %', v_result;
  end if;
end
$$;

reset role;

do $$
begin
  if (select normalized_phone from public.booking_requests
      where idempotency_key = '00000000-0000-4000-8000-0000000000c1'::uuid)
      <> '971500000000' then
    raise exception 'FRESH_CHAIN_LEGACY_CANONICAL_PHONE_FAILED';
  end if;

  if (select normalized_phone from public.booking_requests
      where idempotency_key = '00000000-0000-4000-8000-0000000000c2'::uuid)
      <> '12025550123' then
    raise exception 'FRESH_CHAIN_INTERNATIONAL_CANONICAL_PHONE_FAILED';
  end if;

  if has_table_privilege('anon', 'public.booking_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_requests', 'INSERT')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'SELECT') then
    raise exception 'FRESH_CHAIN_TABLE_PRIVILEGES_WIDENED';
  end if;
end
$$;
