begin;

create table if not exists public.booking_ingress_attempts (
  id bigint generated always as identity primary key,
  client_fingerprint text not null,
  normalized_phone text,
  idempotency_key uuid,
  result_code text not null,
  accepted boolean not null default false,
  attempted_at timestamptz not null default now(),
  check (client_fingerprint ~ '^[0-9a-f]{64}$'),
  check (normalized_phone is null or normalized_phone ~ '^9715[0-9]{8}$')
);

alter table public.booking_ingress_attempts enable row level security;
revoke all on table public.booking_ingress_attempts from public, anon, authenticated;

create index if not exists idx_booking_ingress_fingerprint_attempted
on public.booking_ingress_attempts (client_fingerprint, attempted_at desc);

create index if not exists idx_booking_ingress_phone_attempted
on public.booking_ingress_attempts (normalized_phone, attempted_at desc)
where normalized_phone is not null;

create index if not exists idx_booking_ingress_attempted_at
on public.booking_ingress_attempts (attempted_at);

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

  v_phone := public.normalize_uae_phone(p_phone);
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

  v_result := public.submit_booking_request(
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
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid, text, text, integer
) from public, anon, authenticated;
grant execute on function public.submit_booking_request_ingress(
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid, text, text, integer
) to service_role;

-- Zero-downtime staging: the legacy public RPC remains callable until the OIDC-backed
-- Production route is deployed and verified. Migration 000024 removes public execution.

commit;
