-- PHASE A: zero-downtime database compatibility foundation for international booking phones.
--
-- Compatibility contract:
--   * The existing public submit_booking_request function is intentionally NOT replaced.
--   * Its existing anon/service_role execute grants are intentionally NOT changed here.
--   * Existing deployed clients therefore continue to accept UAE mobile bookings unchanged.
--   * International bookings use a separate service-role-only internal function through ingress.
--   * No booking or ingress row is updated, deleted, or backfilled by this migration.

begin;

create or replace function public.normalize_international_phone(p_phone text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_input text := btrim(coalesce(p_phone, ''));
  v_compact text;
  v_digits text;
begin
  if v_input = '' or char_length(v_input) > 64 then
    return null;
  end if;

  if v_input !~ '^[+0-9() .-]+$' then
    return null;
  end if;

  v_compact := regexp_replace(v_input, '[[:space:]]', '', 'g');
  v_digits := regexp_replace(v_compact, '[^0-9]', '', 'g');

  if left(v_compact, 1) = '+' then
    null;
  elsif left(v_digits, 2) = '00' then
    v_digits := substring(v_digits from 3);
  elsif v_digits ~ '^05[0-9]{8}$' then
    v_digits := '971' || substring(v_digits from 2);
  elsif v_digits ~ '^5[0-9]{8}$' then
    v_digits := '971' || v_digits;
  else
    return null;
  end if;

  if v_digits !~ '^[1-9][0-9]{7,14}$' then
    return null;
  end if;

  return v_digits;
end;
$$;

revoke all on function public.normalize_international_phone(text)
from public, anon, authenticated;
grant execute on function public.normalize_international_phone(text) to service_role;

alter table public.booking_ingress_attempts
  drop constraint if exists booking_ingress_attempts_normalized_phone_check;

alter table public.booking_ingress_attempts
  add constraint booking_ingress_attempts_normalized_phone_check
  check (normalized_phone is null or normalized_phone ~ '^[1-9][0-9]{7,14}$')
  not valid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_normalized_phone_e164_check'
  ) then
    alter table public.booking_requests
      add constraint booking_requests_normalized_phone_e164_check
      check (normalized_phone ~ '^[1-9][0-9]{7,14}$')
      not valid;
  end if;
end
$$;

create or replace function public.submit_international_booking_request(
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
  v_booking_enabled boolean;
  v_locations text[];
  v_duration integer;
  v_dow integer;
  v_requested_minutes integer;
  v_valid_slot boolean := false;
  v_now_dubai timestamp without time zone := now() at time zone 'Asia/Dubai';
begin
  if p_idempotency_key is null then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Idempotency key is required.'
    );
  end if;

  select id
  into v_existing_id
  from public.booking_requests
  where idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'success', true,
      'bookingRequestId', v_existing_id,
      'duplicate', true
    );
  end if;

  select booking_enabled, locations, session_duration_minutes
  into v_booking_enabled, v_locations, v_duration
  from public.business_settings
  where id = 'primary';

  if not found or v_booking_enabled is distinct from true then
    return jsonb_build_object(
      'success', false,
      'code', 'SERVER_ERROR',
      'message', 'Online booking is currently unavailable.'
    );
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2
     or char_length(btrim(coalesce(p_full_name, ''))) > 120
     or char_length(btrim(coalesce(p_phone, ''))) > 64
     or char_length(btrim(coalesce(p_location, ''))) < 2
     or char_length(btrim(coalesce(p_location, ''))) > 120
     or char_length(btrim(coalesce(p_other_location, ''))) > 200
     or p_requested_date is null
     or p_requested_time is null
     or p_terms_accepted is distinct from true
  then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Required booking fields are missing or invalid.'
    );
  end if;

  if p_gender not in ('Male', 'Female')
     or p_category not in ('Boy', 'Girl', 'Adult', 'People of Determination')
     or p_training_type not in ('Private', 'Semi-Private', 'Group')
  then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Booking option is not supported.'
    );
  end if;

  if p_location = 'Other' then
    if char_length(btrim(coalesce(p_other_location, ''))) < 2 then
      return jsonb_build_object(
        'success', false,
        'code', 'INVALID_INPUT',
        'message', 'Please provide the requested location.'
      );
    end if;
  elsif not (p_location = any(v_locations)) then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Selected location is not available.'
    );
  end if;

  v_normalized_phone := public.normalize_international_phone(p_phone);

  if v_normalized_phone is null then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_PHONE',
      'message', 'A canonical international phone number is required.'
    );
  end if;

  if (p_requested_date + p_requested_time) < v_now_dubai then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'The requested time is in the past.'
    );
  end if;

  if extract(second from p_requested_time) <> 0 then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Selected time is not available.'
    );
  end if;

  v_dow := extract(dow from p_requested_date)::integer;
  v_requested_minutes :=
    extract(hour from p_requested_time)::integer * 60
    + extract(minute from p_requested_time)::integer;

  if v_dow = 1 then
    v_valid_slot :=
      v_requested_minutes >= 16 * 60
      and v_requested_minutes + v_duration <= 21 * 60
      and (v_requested_minutes - 16 * 60) % v_duration = 0;
  elsif v_dow in (0, 6) then
    v_valid_slot :=
      v_requested_minutes >= 18 * 60
      and v_requested_minutes + v_duration <= 22 * 60
      and (v_requested_minutes - 18 * 60) % v_duration = 0;
  elsif v_dow in (2, 4, 5) then
    v_valid_slot := (
      v_requested_minutes >= 13 * 60
      and v_requested_minutes + v_duration <= 15 * 60
      and (v_requested_minutes - 13 * 60) % v_duration = 0
    ) or (
      v_requested_minutes >= 19 * 60
      and v_requested_minutes + v_duration <= 22 * 60
      and (v_requested_minutes - 19 * 60) % v_duration = 0
    );
  else
    v_valid_slot :=
      v_requested_minutes >= 16 * 60
      and v_requested_minutes + v_duration <= 21 * 60
      and (v_requested_minutes - 16 * 60) % v_duration = 0;
  end if;

  if not v_valid_slot then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Selected time is not available.'
    );
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
  )
  values (
    p_idempotency_key,
    btrim(p_full_name),
    btrim(p_phone),
    v_normalized_phone,
    p_gender,
    p_category,
    btrim(p_location),
    case when p_location = 'Other' then btrim(p_other_location) else null end,
    p_swam_before,
    p_fear_of_water,
    p_training_type,
    p_requested_date,
    p_requested_time,
    p_terms_accepted
  )
  returning id into v_id;

  return jsonb_build_object(
    'success', true,
    'bookingRequestId', v_id,
    'duplicate', false
  );

exception
  when unique_violation then
    select id
    into v_existing_id
    from public.booking_requests
    where idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'success', true,
        'bookingRequestId', v_existing_id,
        'duplicate', true
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'code', 'DUPLICATE_REQUEST',
      'message', 'This phone already has an active request for the selected time.'
    );
  when others then
    return jsonb_build_object(
      'success', false,
      'code', 'SERVER_ERROR',
      'message', 'Unable to store booking request.'
    );
end;
$$;

revoke all on function public.submit_international_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date,
  time without time zone, boolean, uuid
) from public, anon, authenticated;

grant execute on function public.submit_international_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date,
  time without time zone, boolean, uuid
) to service_role;

create or replace function public.submit_booking_request_ingress(
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
  p_requested_time time,
  p_terms_accepted boolean,
  p_idempotency_key uuid,
  p_client_fingerprint text,
  p_honeypot text,
  p_form_elapsed_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing_id uuid;
  v_phone text;
  v_result jsonb;
  v_code text;
  v_fingerprint_15m integer;
  v_fingerprint_24h integer;
  v_phone_24h integer;
  v_phone_7d integer;
begin
  if p_idempotency_key is not null then
    select id into v_existing_id
    from public.booking_requests
    where idempotency_key = p_idempotency_key
    limit 1;

    if found then
      return jsonb_build_object(
        'success', true,
        'bookingRequestId', v_existing_id,
        'duplicate', true
      );
    end if;
  end if;

  if p_client_fingerprint is null
     or p_client_fingerprint !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object(
      'success', false,
      'code', 'INGRESS_UNAVAILABLE',
      'message', 'Unable to verify the booking request source.'
    );
  end if;

  perform pg_advisory_xact_lock(42001, hashtext(p_client_fingerprint));

  v_phone := public.normalize_international_phone(p_phone);
  if v_phone is not null then
    perform pg_advisory_xact_lock(42002, hashtext(v_phone));
  end if;

  delete from public.booking_ingress_attempts
  where attempted_at < now() - interval '30 days';

  if nullif(btrim(coalesce(p_honeypot, '')), '') is not null
     or p_form_elapsed_ms is null
     or p_form_elapsed_ms < 2500
     or p_form_elapsed_ms > 86400000 then
    insert into public.booking_ingress_attempts (
      client_fingerprint,
      normalized_phone,
      idempotency_key,
      result_code,
      accepted
    ) values (
      p_client_fingerprint,
      v_phone,
      p_idempotency_key,
      'BOT_REJECTED',
      false
    );

    return jsonb_build_object(
      'success', false,
      'code', 'BOT_REJECTED',
      'message', 'Unable to submit this booking request.'
    );
  end if;

  select
    count(*) filter (where attempted_at >= now() - interval '15 minutes'),
    count(*) filter (where attempted_at >= now() - interval '24 hours')
  into v_fingerprint_15m, v_fingerprint_24h
  from public.booking_ingress_attempts
  where client_fingerprint = p_client_fingerprint;

  if v_phone is not null then
    select
      count(*) filter (where attempted_at >= now() - interval '24 hours'),
      count(*) filter (where attempted_at >= now() - interval '7 days')
    into v_phone_24h, v_phone_7d
    from public.booking_ingress_attempts
    where normalized_phone = v_phone;
  else
    v_phone_24h := 0;
    v_phone_7d := 0;
  end if;

  if v_fingerprint_15m >= 6
     or v_fingerprint_24h >= 20
     or v_phone_24h >= 5
     or v_phone_7d >= 12 then
    insert into public.booking_ingress_attempts (
      client_fingerprint,
      normalized_phone,
      idempotency_key,
      result_code,
      accepted
    ) values (
      p_client_fingerprint,
      v_phone,
      p_idempotency_key,
      'RATE_LIMITED',
      false
    );

    return jsonb_build_object(
      'success', false,
      'code', 'RATE_LIMITED',
      'message', 'Too many booking requests. Please try again later or contact us on WhatsApp.'
    );
  end if;

  v_result := public.submit_international_booking_request(
    p_full_name,
    p_phone,
    p_gender,
    p_category,
    p_location,
    p_other_location,
    p_swam_before,
    p_fear_of_water,
    p_training_type,
    p_requested_date,
    p_requested_time,
    p_terms_accepted,
    p_idempotency_key
  );

  v_code := case
    when coalesce((v_result->>'success')::boolean, false) then 'ACCEPTED'
    else coalesce(v_result->>'code', 'UNKNOWN_RESULT')
  end;

  insert into public.booking_ingress_attempts (
    client_fingerprint,
    normalized_phone,
    idempotency_key,
    result_code,
    accepted
  ) values (
    p_client_fingerprint,
    v_phone,
    p_idempotency_key,
    v_code,
    coalesce((v_result->>'success')::boolean, false)
  );

  return v_result;
end;
$$;

revoke all on function public.submit_booking_request_ingress(
  text, text, text, text, text, text, boolean, boolean, text, date, time,
  boolean, uuid, text, text, integer
) from public, anon, authenticated;

grant execute on function public.submit_booking_request_ingress(
  text, text, text, text, text, text, boolean, boolean, text, date, time,
  boolean, uuid, text, text, integer
) to service_role;

commit;
