\set ON_ERROR_STOP on

-- Runs against the current booking schema before Phase A is applied.
-- It proves that the deployed legacy RPC is genuinely executable by anon, then snapshots
-- the function and row so Phase A can prove it did not change either one.

do $$
begin
  if not has_function_privilege(
    'anon',
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)',
    'EXECUTE'
  ) then
    raise exception 'PRE_FOUNDATION_LEGACY_ANON_EXECUTE_MISSING';
  end if;
end
$$;

set role anon;

select (
  public.submit_booking_request(
    'Legacy UAE Compatibility Test',
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
    '00000000-0000-4000-8000-0000000000a1'::uuid
  )->>'bookingRequestId'
) as legacy_booking_id
\gset

reset role;

create table public._booking_phone_rollout_snapshot (
  singleton boolean primary key default true check (singleton),
  legacy_function_hash text not null,
  legacy_booking_id uuid not null,
  legacy_booking_hash text not null,
  booking_count bigint not null,
  ingress_count bigint not null
);

insert into public._booking_phone_rollout_snapshot (
  legacy_function_hash,
  legacy_booking_id,
  legacy_booking_hash,
  booking_count,
  ingress_count
)
select
  md5(pg_get_functiondef(
    'public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid)'::regprocedure
  )),
  b.id,
  md5(row_to_json(b)::text),
  (select count(*) from public.booking_requests),
  (select count(*) from public.booking_ingress_attempts)
from public.booking_requests b
where b.id = :'legacy_booking_id'::uuid;

do $$
declare
  v_phone text;
  v_normalized text;
begin
  select phone, normalized_phone
  into v_phone, v_normalized
  from public.booking_requests
  where idempotency_key = '00000000-0000-4000-8000-0000000000a1'::uuid;

  if not found then
    raise exception 'PRE_FOUNDATION_LEGACY_UAE_BOOKING_NOT_CREATED';
  end if;

  if v_phone <> '0500000000' or v_normalized <> '971500000000' then
    raise exception 'PRE_FOUNDATION_LEGACY_UAE_NORMALIZATION_CHANGED: %, %', v_phone, v_normalized;
  end if;
end
$$;
