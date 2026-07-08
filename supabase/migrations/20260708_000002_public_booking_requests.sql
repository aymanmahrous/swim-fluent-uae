-- Public booking request intake for the current Relax Fix website.
-- This is intentionally a booking REQUEST workflow, not confirmed capacity booking.

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  phone text not null,
  normalized_phone text not null,
  gender text not null check (gender in ('Male','Female')),
  category text not null check (category in ('Boy','Girl','Adult','People of Determination')),
  location text not null,
  other_location text,
  swam_before boolean not null,
  fear_of_water boolean not null,
  training_type text not null check (training_type in ('Private','Semi-Private','Group')),
  requested_date date not null,
  requested_time time without time zone not null,
  status text not null default 'pending' check (status in ('pending','contacted','confirmed','declined','cancelled')),
  terms_accepted boolean not null check (terms_accepted = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_status_created_idx
  on public.booking_requests(status, created_at desc);
create index if not exists booking_requests_phone_date_idx
  on public.booking_requests(normalized_phone, requested_date, requested_time);

alter table public.booking_requests enable row level security;

create or replace function public.submit_booking_request(
  p_full_name text,
  p_phone text,
  p_gender text,
  p_category text,
  p_location text,
  p_other_location text,
  p_swam_before boolean,
  p_fear_of_water boolean,
  p_training_type text,
  p_requested_date date,
  p_requested_time time without time zone,
  p_terms_accepted boolean,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_normalized_phone text;
  v_existing_id uuid;
  v_id uuid;
  v_now_dubai timestamp without time zone := now() at time zone 'Asia/Dubai';
begin
  if p_idempotency_key is null then
    return jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Idempotency key is required.');
  end if;

  select id into v_existing_id
  from public.booking_requests
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object('success', true, 'bookingRequestId', v_existing_id, 'duplicate', true);
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2
     or char_length(btrim(coalesce(p_location, ''))) < 2
     or p_requested_date is null
     or p_requested_time is null
     or p_terms_accepted is distinct from true then
    return jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Required booking fields are missing.');
  end if;

  v_normalized_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if left(v_normalized_phone, 5) = '00971' then
    v_normalized_phone := substring(v_normalized_phone from 6);
  elsif left(v_normalized_phone, 3) = '971' then
    v_normalized_phone := substring(v_normalized_phone from 4);
  elsif left(v_normalized_phone, 1) = '0' then
    v_normalized_phone := substring(v_normalized_phone from 2);
  end if;
  v_normalized_phone := '971' || v_normalized_phone;

  if v_normalized_phone !~ '^9715[0-9]{8}$' then
    return jsonb_build_object('success', false, 'code', 'INVALID_PHONE', 'message', 'A valid UAE mobile number is required.');
  end if;

  if (p_requested_date + p_requested_time) < v_now_dubai then
    return jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'The requested time is in the past.');
  end if;

  select id into v_existing_id
  from public.booking_requests
  where normalized_phone = v_normalized_phone
    and requested_date = p_requested_date
    and requested_time = p_requested_time
    and status in ('pending','contacted','confirmed')
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object('success', false, 'code', 'DUPLICATE_REQUEST', 'message', 'This phone already has an active request for the selected time.');
  end if;

  insert into public.booking_requests (
    idempotency_key,
    full_name,
    phone,
    normalized_phone,
    gender,
    category,
    location,
    other_location,
    swam_before,
    fear_of_water,
    training_type,
    requested_date,
    requested_time,
    terms_accepted
  ) values (
    p_idempotency_key,
    btrim(p_full_name),
    btrim(p_phone),
    v_normalized_phone,
    p_gender,
    p_category,
    btrim(p_location),
    nullif(btrim(coalesce(p_other_location, '')), ''),
    p_swam_before,
    p_fear_of_water,
    p_training_type,
    p_requested_date,
    p_requested_time,
    p_terms_accepted
  ) returning id into v_id;

  return jsonb_build_object('success', true, 'bookingRequestId', v_id, 'duplicate', false);
exception
  when unique_violation then
    select id into v_existing_id
    from public.booking_requests
    where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('success', true, 'bookingRequestId', v_existing_id, 'duplicate', true);
    end if;
    return jsonb_build_object('success', false, 'code', 'DUPLICATE_REQUEST', 'message', 'A duplicate booking request already exists.');
  when others then
    return jsonb_build_object('success', false, 'code', 'SERVER_ERROR', 'message', 'Unable to store booking request.');
end;
$$;

revoke all on function public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid) from public;
grant execute on function public.submit_booking_request(text,text,text,text,text,text,boolean,boolean,text,date,time without time zone,boolean,uuid) to anon, authenticated;

-- No direct anon table access. Public callers can only use the validated RPC.
revoke all on public.booking_requests from anon, authenticated;
