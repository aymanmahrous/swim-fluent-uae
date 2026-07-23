alter table public.content_items
  add column if not exists generation_run_id uuid,
  add column if not exists generation_mode text not null default 'standard';

alter table public.content_items
  drop constraint if exists content_items_generation_mode_check,
  add constraint content_items_generation_mode_check
    check (generation_mode in ('standard', 'text_only_validation'));

create index if not exists content_items_generation_run_idx
  on public.content_items (generation_run_id)
  where generation_run_id is not null;

create table if not exists public.content_generation_requests (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  request_hash text not null,
  language text not null,
  planned_date date not null,
  status text not null default 'processing',
  response jsonb,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint content_generation_requests_idempotency_key_check
    check (idempotency_key ~ '^[A-Za-z0-9._:-]{16,128}$'),
  constraint content_generation_requests_request_hash_check
    check (request_hash ~ '^[0-9a-f]{64}$'),
  constraint content_generation_requests_language_check
    check (language in ('ar', 'en')),
  constraint content_generation_requests_status_check
    check (status in ('processing', 'completed', 'failed')),
  unique (actor_id, idempotency_key)
);

create unique index if not exists content_generation_requests_active_hash_unique_idx
  on public.content_generation_requests (actor_id, request_hash)
  where status = 'processing';

create index if not exists content_generation_requests_actor_created_idx
  on public.content_generation_requests (actor_id, created_at desc);

alter table public.content_generation_requests enable row level security;
revoke all on table public.content_generation_requests from public, anon, authenticated;

create or replace function public.reserve_staff_content_generation(
  p_idempotency_key text,
  p_request_hash text,
  p_language text,
  p_planned_date date
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_actor uuid := auth.uid();
  v_existing public.content_generation_requests%rowtype;
  v_run public.content_generation_requests%rowtype;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_idempotency_key !~ '^[A-Za-z0-9._:-]{16,128}$'
    or p_request_hash !~ '^[0-9a-f]{64}$'
    or p_language not in ('ar', 'en')
    or p_planned_date < (now() at time zone 'Asia/Dubai')::date
    or p_planned_date > (now() at time zone 'Asia/Dubai')::date + 2
  then
    return jsonb_build_object('allowed', false, 'code', 'INVALID_GENERATION_RESERVATION');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_actor::text || ':' || p_request_hash, 0));

  select * into v_existing
  from public.content_generation_requests
  where actor_id = v_actor
    and idempotency_key = p_idempotency_key;

  if v_existing.id is not null then
    return jsonb_build_object(
      'allowed', false,
      'code', case when v_existing.status = 'completed' then 'IDEMPOTENT_REPLAY' else 'IDEMPOTENCY_ALREADY_USED' end,
      'runId', v_existing.id,
      'status', v_existing.status,
      'response', v_existing.response
    );
  end if;

  if exists (
    select 1
    from public.content_generation_requests existing
    where existing.actor_id = v_actor
      and existing.request_hash = p_request_hash
      and existing.status = 'processing'
  ) then
    return jsonb_build_object('allowed', false, 'code', 'GENERATION_ALREADY_PROCESSING');
  end if;

  if exists (
    select 1
    from public.content_generation_requests existing
    where existing.actor_id = v_actor
      and existing.status = 'completed'
      and existing.completed_at >= now() - interval '24 hours'
  ) then
    return jsonb_build_object('allowed', false, 'code', 'DAILY_GENERATION_LIMIT');
  end if;

  insert into public.content_generation_requests (
    actor_id,
    idempotency_key,
    request_hash,
    language,
    planned_date
  ) values (
    v_actor,
    p_idempotency_key,
    p_request_hash,
    p_language,
    p_planned_date
  ) returning * into v_run;

  insert into public.audit_logs (
    actor_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    detail
  ) values (
    v_actor,
    'user',
    'content_generation_reserved',
    'content_generation_request',
    v_run.id,
    jsonb_build_object('language', p_language, 'plannedDate', p_planned_date)
  );

  return jsonb_build_object('allowed', true, 'code', 'RESERVED', 'runId', v_run.id);
end;
$function$;

create or replace function public.fail_staff_content_generation(
  p_run_id uuid,
  p_failure_code text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_actor uuid := auth.uid();
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  update public.content_generation_requests
  set status = 'failed',
      failure_code = left(btrim(coalesce(p_failure_code, 'GENERATION_FAILED')), 120),
      updated_at = now()
  where id = p_run_id
    and actor_id = v_actor
    and status = 'processing';

  return jsonb_build_object('success', found);
end;
$function$;

create or replace function public.create_staff_generated_content_batch_guarded(
  p_run_id uuid,
  p_items jsonb,
  p_provider_external_id text,
  p_generation_mode text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_actor uuid := auth.uid();
  v_request public.content_generation_requests%rowtype;
  v_item jsonb;
  v_content public.content_items%rowtype;
  v_ids uuid[] := '{}'::uuid[];
  v_count integer;
  v_platform text;
  v_content_type text;
  v_caption text;
  v_language text;
  v_pillar text;
  v_slot text;
  v_fingerprint text;
  v_planned_for_text text;
  v_planned_for timestamptz;
  v_response jsonb;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_generation_mode <> 'text_only_validation' then
    raise exception 'INVALID_GENERATION_MODE' using errcode = '22023';
  end if;

  select * into v_request
  from public.content_generation_requests
  where id = p_run_id
    and actor_id = v_actor
  for update;

  if v_request.id is null or v_request.status <> 'processing' then
    raise exception 'GENERATION_RUN_NOT_ACTIVE' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) <> 3 then
    raise exception 'INVALID_PHASE3_BATCH_SIZE' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_items);

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_platform := v_item->>'platform';
    v_content_type := btrim(coalesce(v_item->>'contentType', ''));
    v_caption := btrim(coalesce(v_item->>'caption', ''));
    v_language := btrim(coalesce(v_item->>'language', ''));
    v_pillar := btrim(coalesce(v_item->>'contentPillar', ''));
    v_slot := btrim(coalesce(v_item->>'contentSlot', ''));
    v_fingerprint := lower(btrim(coalesce(v_item->>'contentFingerprint', '')));
    v_planned_for_text := btrim(coalesce(v_item->>'plannedFor', ''));

    if v_platform not in ('instagram','facebook','tiktok')
      or char_length(v_content_type) < 2
      or char_length(v_caption) < 2
      or v_language <> v_request.language
      or v_pillar not in ('water_fear','parent_concerns','confidence','swimming_education','coach_authority','real_progress','safety_awareness','aqua_training','behind_the_scenes','offer_booking')
      or v_slot not in ('trust_morning','education_midday','conversion_evening')
      or v_fingerprint !~ '^[0-9a-f]{64}$'
    then
      raise exception 'INVALID_GENERATED_CONTENT' using errcode = '22023';
    end if;

    begin
      v_planned_for := v_planned_for_text::timestamptz;
    exception when others then
      raise exception 'INVALID_PLANNED_TIME' using errcode = '22023';
    end;

    if (v_planned_for at time zone 'Asia/Dubai')::date <> v_request.planned_date
      or v_planned_for <= now()
      or exists (select 1 from public.content_items existing where existing.planned_for = v_planned_for)
      or exists (
        select 1 from public.content_items existing
        where existing.content_fingerprint = v_fingerprint
          and existing.created_at >= now() - interval '90 days'
      )
    then
      raise exception 'CONTENT_SAFETY_CONFLICT' using errcode = '23505';
    end if;

    insert into public.content_items (
      planned_for, platform, content_type, topic, hook, caption, cta, hashtags,
      visual_prompt, status, provider_external_id, language, content_pillar,
      content_slot, content_fingerprint, generation_run_id, generation_mode
    ) values (
      v_planned_for,
      v_platform,
      v_content_type,
      nullif(btrim(coalesce(v_item->>'topic', '')), ''),
      nullif(btrim(coalesce(v_item->>'hook', '')), ''),
      v_caption,
      nullif(btrim(coalesce(v_item->>'cta', '')), ''),
      coalesce(array(select jsonb_array_elements_text(coalesce(v_item->'hashtags', '[]'::jsonb))), '{}'::text[]),
      nullif(btrim(coalesce(v_item->>'visualPrompt', '')), ''),
      'needs_review',
      nullif(btrim(coalesce(p_provider_external_id, '')), ''),
      v_language,
      v_pillar,
      v_slot,
      v_fingerprint,
      p_run_id,
      p_generation_mode
    ) returning * into v_content;

    v_ids := array_append(v_ids, v_content.id);
  end loop;

  v_response := jsonb_build_object(
    'success', true,
    'runId', p_run_id,
    'contentItemIds', to_jsonb(v_ids),
    'count', cardinality(v_ids),
    'status', 'needs_review',
    'generationMode', p_generation_mode
  );

  update public.content_generation_requests
  set status = 'completed',
      response = v_response,
      completed_at = now(),
      updated_at = now()
  where id = p_run_id;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    v_actor,
    'user',
    'content_brain_guarded_batch_saved_for_review',
    'content_generation_request',
    p_run_id,
    jsonb_build_object(
      'contentItemIds', to_jsonb(v_ids),
      'count', cardinality(v_ids),
      'dailyCadence', 3,
      'generationMode', p_generation_mode,
      'providerExternalId', nullif(btrim(coalesce(p_provider_external_id, '')), '')
    )
  );

  return v_response;
end;
$function$;

create or replace function public.enqueue_content_media_after_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.generation_mode <> 'text_only_validation'
    and new.status = 'needs_review'
    and new.visual_prompt is not null
    and btrim(new.visual_prompt) <> ''
    and new.content_type in ('image_post', 'reel')
  then
    begin
      insert into public.background_jobs (job_type, status, payload, next_retry_at)
      values ('generate_content_media', 'queued', jsonb_build_object('contentItemId', new.id), now());
    exception when unique_violation then
      null;
    end;
  end if;

  return new;
end;
$function$;

revoke all on function public.reserve_staff_content_generation(text, text, text, date) from public, anon;
grant execute on function public.reserve_staff_content_generation(text, text, text, date) to authenticated;

revoke all on function public.fail_staff_content_generation(uuid, text) from public, anon;
grant execute on function public.fail_staff_content_generation(uuid, text) to authenticated;

revoke all on function public.create_staff_generated_content_batch_guarded(uuid, jsonb, text, text) from public, anon;
grant execute on function public.create_staff_generated_content_batch_guarded(uuid, jsonb, text, text) to authenticated;
