\set ON_ERROR_STOP on

begin read only;

do $$
begin
  if to_regclass('public.campaigns') is null
     or to_regclass('public.booking_requests') is null
     or to_regclass('public.booking_ingress_attempts') is null
     or to_regclass('public.staff_profiles') is null
     or to_regclass('public.content_items') is null
     or to_regclass('public.media_assets') is null
     or to_regclass('public.background_jobs') is null
     or to_regclass('public.content_publication_receipts') is null
     or to_regclass('public.content_automation_runs') is null then
    raise exception 'FRESH_HISTORY_REQUIRED_TABLE_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'
  ) is null then
    raise exception 'FRESH_HISTORY_LEGACY_BOOKING_FUNCTION_MISSING';
  end if;

  if to_regprocedure(
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)'
  ) is null then
    raise exception 'FRESH_HISTORY_BOOKING_INGRESS_MISSING';
  end if;

  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'FRESH_HISTORY_LEGACY_BOOKING_ANON_EXECUTE_MISSING';
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
    raise exception 'FRESH_HISTORY_BOOKING_INGRESS_PUBLIC_EXECUTE';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.submit_booking_request_ingress(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid,text,text,integer)',
    'EXECUTE'
  ) then
    raise exception 'FRESH_HISTORY_BOOKING_INGRESS_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if has_table_privilege('anon', 'public.booking_requests', 'INSERT')
     or has_table_privilege('authenticated', 'public.booking_requests', 'INSERT')
     or has_table_privilege('anon', 'public.booking_ingress_attempts', 'SELECT')
     or has_table_privilege('authenticated', 'public.booking_ingress_attempts', 'SELECT') then
    raise exception 'FRESH_HISTORY_BOOKING_TABLE_GRANTS_WIDENED';
  end if;

  if not (select relrowsecurity from pg_class where oid = 'public.campaigns'::regclass)
     or not (select relrowsecurity from pg_class where oid = 'public.booking_requests'::regclass)
     or not (select relrowsecurity from pg_class where oid = 'public.booking_ingress_attempts'::regclass) then
    raise exception 'FRESH_HISTORY_REQUIRED_RLS_DISABLED';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'campaigns'
      and column_name in ('title', 'type')
  ) then
    raise exception 'FRESH_HISTORY_ADDED_LEGACY_CAMPAIGN_COLUMNS';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'booking_requests'
      and indexname = 'booking_requests_active_phone_slot_unique'
  ) then
    raise exception 'FRESH_HISTORY_BOOKING_DUPLICATE_INDEX_MISSING';
  end if;
end
$$;

commit;

set role anon;

select public.submit_booking_request(
  'Disposable UAE Booking',
  '0500000000',
  'Male',
  'Adult',
  'Al Falah',
  null,
  true,
  false,
  'Private',
  current_date + ((8 - extract(isodow from current_date)::integer) % 7) + 7,
  time '16:00',
  true,
  '40000000-0000-4000-8000-000000000001'::uuid
);

reset role;

do $$
begin
  if not exists (
    select 1
    from public.booking_requests
    where idempotency_key = '40000000-0000-4000-8000-000000000001'::uuid
  ) then
    raise exception 'FRESH_HISTORY_LEGACY_UAE_BOOKING_FAILED';
  end if;

  if (select normalized_phone
      from public.booking_requests
      where idempotency_key = '40000000-0000-4000-8000-000000000001'::uuid)
      <> '971500000000' then
    raise exception 'FRESH_HISTORY_LEGACY_UAE_NORMALIZATION_FAILED';
  end if;
end
$$;
