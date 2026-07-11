\set ON_ERROR_STOP on

create schema if not exists migration_test authorization postgres;
drop table if exists migration_test.phase_a_snapshot;

set role anon;

select public.submit_booking_request(
  'Stacked Legacy UAE Booking',
  '0500000001',
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
  '50000000-0000-4000-8000-000000000001'::uuid
);

reset role;

do $$
begin
  if not exists (
    select 1
    from public.booking_requests
    where idempotency_key = '50000000-0000-4000-8000-000000000001'::uuid
  ) then
    raise exception 'STACKED_PRE_LEGACY_UAE_BOOKING_FAILED';
  end if;
end
$$;

create table migration_test.phase_a_snapshot as
select
  md5(pg_get_functiondef(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'::regprocedure
  )) as legacy_function_hash,
  b.id as legacy_booking_id,
  md5(row_to_json(b)::text) as legacy_booking_hash,
  (select count(*) from public.booking_requests)::bigint as booking_count,
  has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) as legacy_anon_execute
from public.booking_requests b
where b.idempotency_key = '50000000-0000-4000-8000-000000000001'::uuid;

do $$
begin
  if (select count(*) from migration_test.phase_a_snapshot) <> 1 then
    raise exception 'STACKED_PRE_SNAPSHOT_MISSING';
  end if;

  if (select legacy_anon_execute from migration_test.phase_a_snapshot) is distinct from true then
    raise exception 'STACKED_PRE_LEGACY_ANON_EXECUTE_MISSING';
  end if;
end
$$;
