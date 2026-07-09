alter table public.content_items
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists content_items_created_by_created_idx
  on public.content_items (created_by, created_at desc)
  where created_by is not null;

create unique index if not exists background_jobs_content_media_active_unique_idx
  on public.background_jobs ((payload->>'contentItemId'))
  where job_type = 'generate_content_media'
    and status in ('queued', 'processing', 'retrying');

create index if not exists background_jobs_content_media_due_idx
  on public.background_jobs (status, next_retry_at, created_at)
  where job_type = 'generate_content_media';

create unique index if not exists media_assets_autonomous_content_type_unique_idx
  on public.media_assets (content_item_id, asset_type)
  where content_item_id is not null
    and source = 'ai_generated'
    and metadata->>'autonomous' = 'true'
    and asset_type in ('image', 'video');

create or replace function public.prepare_content_item_for_media()
returns trigger
language plpgsql
security invoker
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  if new.content_slot = 'conversion_evening' then
    new.content_type := 'reel';
  elsif new.content_slot in ('trust_morning', 'education_midday') then
    new.content_type := 'image_post';
  end if;

  return new;
end;
$function$;

drop trigger if exists content_items_prepare_media_before_insert on public.content_items;
create trigger content_items_prepare_media_before_insert
before insert on public.content_items
for each row
execute function public.prepare_content_item_for_media();

create or replace function public.enqueue_content_media_after_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.status = 'needs_review'
    and new.visual_prompt is not null
    and btrim(new.visual_prompt) <> ''
    and new.content_type in ('image_post', 'reel')
  then
    begin
      insert into public.background_jobs (
        job_type,
        status,
        payload,
        next_retry_at
      ) values (
        'generate_content_media',
        'queued',
        jsonb_build_object('contentItemId', new.id),
        now()
      );
    exception when unique_violation then
      null;
    end;
  end if;

  return new;
end;
$function$;

drop trigger if exists content_items_enqueue_media_after_insert on public.content_items;
create trigger content_items_enqueue_media_after_insert
after insert on public.content_items
for each row
execute function public.enqueue_content_media_after_insert();

create or replace function public.claim_next_content_media_job()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_job public.background_jobs%rowtype;
  v_content public.content_items%rowtype;
  v_content_id uuid;
  v_asset_type text;
  v_existing_asset public.media_assets%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  loop
    select * into v_job
    from public.background_jobs
    where job_type = 'generate_content_media'
      and status in ('queued', 'retrying')
      and coalesce(next_retry_at, created_at) <= now()
    order by coalesce(next_retry_at, created_at), created_at, id
    for update skip locked
    limit 1;

    if v_job.id is null then
      return jsonb_build_object('claimed', false, 'code', 'NO_DUE_CONTENT_MEDIA_JOB');
    end if;

    begin
      v_content_id := nullif(v_job.payload->>'contentItemId', '')::uuid;
    exception when others then
      update public.background_jobs
      set status = 'dead',
          last_error = 'INVALID_CONTENT_MEDIA_JOB_PAYLOAD',
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      continue;
    end;

    select * into v_content
    from public.content_items
    where id = v_content_id;

    if v_content.id is null then
      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_ITEM_NOT_FOUND',
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      continue;
    end if;

    if v_content.created_by is null then
      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_OWNER_MISSING',
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      continue;
    end if;

    if v_content.visual_prompt is null or btrim(v_content.visual_prompt) = '' then
      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_VISUAL_PROMPT_MISSING',
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      continue;
    end if;

    v_asset_type := case
      when v_content.content_type = 'image_post' then 'image'
      when v_content.content_type = 'reel' then 'video'
      else null
    end;

    if v_asset_type is null then
      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_MEDIA_TYPE_UNSUPPORTED',
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      continue;
    end if;

    select * into v_existing_asset
    from public.media_assets
    where content_item_id = v_content.id
      and asset_type = v_asset_type
      and source = 'ai_generated'
      and metadata->>'autonomous' = 'true'
    order by created_at desc, id desc
    limit 1;

    if v_existing_asset.id is not null then
      update public.background_jobs
      set status = 'completed',
          result = jsonb_build_object(
            'mediaAssetId', v_existing_asset.id,
            'storagePath', v_existing_asset.storage_path,
            'alreadyGenerated', true
          ),
          last_error = null,
          updated_at = now()
      where id = v_job.id;
      v_job := null;
      v_existing_asset := null;
      continue;
    end if;

    update public.background_jobs
    set status = 'processing',
        attempt_count = attempt_count + 1,
        last_error = null,
        updated_at = now()
    where id = v_job.id
    returning * into v_job;

    return jsonb_build_object(
      'claimed', true,
      'jobId', v_job.id,
      'contentItemId', v_content.id,
      'requestedBy', v_content.created_by,
      'assetType', v_asset_type,
      'platform', v_content.platform,
      'contentType', v_content.content_type,
      'prompt', v_content.visual_prompt,
      'provider', nullif(v_job.payload->>'provider', ''),
      'providerJobId', nullif(v_job.payload->>'providerJobId', ''),
      'attemptCount', v_job.attempt_count,
      'aspectRatio', case when v_asset_type = 'video' then '9:16' else '4:5' end,
      'durationSeconds', case when v_asset_type = 'video' then 8 else null end
    );
  end loop;
end;
$function$;

create or replace function public.record_content_media_video_provider_job(
  p_job_id uuid,
  p_provider text,
  p_provider_job_id text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_job public.background_jobs%rowtype;
  v_content public.content_items%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_provider, ''))) < 2
    or char_length(btrim(coalesce(p_provider_job_id, ''))) < 1 then
    raise exception 'INVALID_CONTENT_MEDIA_PROVIDER_JOB' using errcode = '22023';
  end if;

  select * into v_job
  from public.background_jobs
  where id = p_job_id
    and job_type = 'generate_content_media'
  for update;

  if v_job.id is null or v_job.status <> 'processing' then
    raise exception 'CONTENT_MEDIA_JOB_NOT_PROCESSING' using errcode = '22023';
  end if;

  select * into v_content
  from public.content_items
  where id = (v_job.payload->>'contentItemId')::uuid;

  if v_content.id is null or v_content.created_by is null or v_content.content_type <> 'reel' then
    raise exception 'CONTENT_MEDIA_VIDEO_CONTEXT_INVALID' using errcode = '22023';
  end if;

  update public.background_jobs
  set status = 'retrying',
      payload = payload || jsonb_build_object(
        'provider', btrim(p_provider),
        'providerJobId', btrim(p_provider_job_id)
      ),
      next_retry_at = now() + interval '15 seconds',
      last_error = null,
      updated_at = now()
  where id = v_job.id;

  insert into public.ai_media_jobs (
    content_item_id,
    requested_by,
    asset_type,
    provider,
    provider_job_id,
    status,
    prompt,
    source_asset_url,
    aspect_ratio,
    duration_seconds,
    storage_path,
    error,
    metadata
  ) values (
    v_content.id,
    v_content.created_by,
    'video',
    btrim(p_provider),
    btrim(p_provider_job_id),
    'queued',
    v_content.visual_prompt,
    null,
    '9:16',
    8,
    null,
    null,
    jsonb_build_object('autonomous', true, 'backgroundJobId', v_job.id)
  )
  on conflict (provider, provider_job_id) do update
  set status = case when public.ai_media_jobs.status = 'succeeded' then 'succeeded' else 'running' end,
      error = null,
      updated_at = now();

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'provider', btrim(p_provider),
    'providerJobId', btrim(p_provider_job_id),
    'status', 'retrying'
  );
end;
$function$;

create or replace function public.defer_content_media_job(
  p_job_id uuid,
  p_reason text,
  p_delay_seconds integer default 3600
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_job public.background_jobs%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if p_delay_seconds < 15 or p_delay_seconds > 86400 then
    raise exception 'INVALID_CONTENT_MEDIA_DEFER_DELAY' using errcode = '22023';
  end if;

  update public.background_jobs
  set status = 'queued',
      attempt_count = greatest(attempt_count - 1, 0),
      next_retry_at = now() + make_interval(secs => p_delay_seconds),
      last_error = left(coalesce(nullif(btrim(p_reason), ''), 'CONTENT_MEDIA_DEFERRED'), 1000),
      updated_at = now()
  where id = p_job_id
    and job_type = 'generate_content_media'
    and status = 'processing'
  returning * into v_job;

  if v_job.id is null then
    raise exception 'CONTENT_MEDIA_JOB_NOT_PROCESSING' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status,
    'nextRetryAt', v_job.next_retry_at,
    'reason', v_job.last_error
  );
end;
$function$;

create or replace function public.fail_content_media_job(
  p_job_id uuid,
  p_error text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_job public.background_jobs%rowtype;
  v_delay interval;
  v_final_status public.job_status;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  select * into v_job
  from public.background_jobs
  where id = p_job_id
    and job_type = 'generate_content_media'
  for update;

  if v_job.id is null or v_job.status <> 'processing' then
    raise exception 'CONTENT_MEDIA_JOB_NOT_PROCESSING' using errcode = '22023';
  end if;

  if v_job.attempt_count >= 5 then
    v_final_status := 'dead';
    v_delay := interval '0 seconds';
  else
    v_final_status := 'retrying';
    v_delay := case v_job.attempt_count
      when 1 then interval '5 minutes'
      when 2 then interval '15 minutes'
      when 3 then interval '1 hour'
      else interval '3 hours'
    end;
  end if;

  update public.background_jobs
  set status = v_final_status,
      next_retry_at = case when v_final_status = 'retrying' then now() + v_delay else null end,
      last_error = left(coalesce(nullif(btrim(p_error), ''), 'CONTENT_MEDIA_FAILED'), 1000),
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  if nullif(v_job.payload->>'provider', '') is not null
    and nullif(v_job.payload->>'providerJobId', '') is not null
    and v_final_status = 'dead'
  then
    update public.ai_media_jobs
    set status = 'failed',
        error = v_job.last_error,
        updated_at = now()
    where provider = v_job.payload->>'provider'
      and provider_job_id = v_job.payload->>'providerJobId'
      and status <> 'succeeded';
  end if;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status,
    'attemptCount', v_job.attempt_count,
    'nextRetryAt', v_job.next_retry_at,
    'error', v_job.last_error
  );
end;
$function$;

create or replace function public.complete_content_media_job(
  p_job_id uuid,
  p_storage_path text,
  p_provider text,
  p_provider_job_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_job public.background_jobs%rowtype;
  v_content public.content_items%rowtype;
  v_asset_type text;
  v_asset public.media_assets%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_storage_path, ''))) < 3
    or char_length(btrim(coalesce(p_provider, ''))) < 2 then
    raise exception 'INVALID_CONTENT_MEDIA_COMPLETION' using errcode = '22023';
  end if;

  select * into v_job
  from public.background_jobs
  where id = p_job_id
    and job_type = 'generate_content_media'
  for update;

  if v_job.id is null or v_job.status <> 'processing' then
    raise exception 'CONTENT_MEDIA_JOB_NOT_PROCESSING' using errcode = '22023';
  end if;

  select * into v_content
  from public.content_items
  where id = (v_job.payload->>'contentItemId')::uuid;

  if v_content.id is null or v_content.created_by is null then
    raise exception 'CONTENT_MEDIA_CONTEXT_INVALID' using errcode = '22023';
  end if;

  v_asset_type := case
    when v_content.content_type = 'image_post' then 'image'
    when v_content.content_type = 'reel' then 'video'
    else null
  end;

  if v_asset_type is null then
    raise exception 'CONTENT_MEDIA_TYPE_UNSUPPORTED' using errcode = '22023';
  end if;

  select * into v_asset
  from public.media_assets
  where content_item_id = v_content.id
    and asset_type = v_asset_type
    and source = 'ai_generated'
    and metadata->>'autonomous' = 'true'
  order by created_at desc, id desc
  limit 1;

  if v_asset.id is null then
    insert into public.media_assets (
      content_item_id,
      asset_type,
      source,
      storage_path,
      provider,
      provider_job_id,
      prompt,
      metadata,
      created_by
    ) values (
      v_content.id,
      v_asset_type,
      'ai_generated',
      btrim(p_storage_path),
      btrim(p_provider),
      nullif(btrim(coalesce(p_provider_job_id, '')), ''),
      v_content.visual_prompt,
      coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
        'autonomous', true,
        'backgroundJobId', v_job.id
      ),
      v_content.created_by
    )
    returning * into v_asset;
  end if;

  if nullif(btrim(coalesce(p_provider_job_id, '')), '') is not null then
    update public.ai_media_jobs
    set status = 'succeeded',
        storage_path = v_asset.storage_path,
        error = null,
        metadata = metadata || coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
          'autonomous', true,
          'backgroundJobId', v_job.id,
          'mediaAssetId', v_asset.id
        ),
        updated_at = now()
    where provider = btrim(p_provider)
      and provider_job_id = btrim(p_provider_job_id);
  end if;

  update public.background_jobs
  set status = 'completed',
      result = jsonb_build_object(
        'mediaAssetId', v_asset.id,
        'storagePath', v_asset.storage_path,
        'assetType', v_asset.asset_type,
        'provider', v_asset.provider
      ),
      next_retry_at = null,
      last_error = null,
      updated_at = now()
  where id = v_job.id;

  insert into public.audit_logs (
    actor_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    detail
  ) values (
    v_content.created_by,
    'system',
    'content_media_generated',
    'content_item',
    v_content.id,
    jsonb_build_object(
      'backgroundJobId', v_job.id,
      'mediaAssetId', v_asset.id,
      'assetType', v_asset.asset_type,
      'provider', v_asset.provider
    )
  );

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', 'completed',
    'mediaAssetId', v_asset.id,
    'storagePath', v_asset.storage_path,
    'assetType', v_asset.asset_type,
    'provider', v_asset.provider
  );
end;
$function$;

revoke all on function public.claim_next_content_media_job() from public, anon, authenticated;
grant execute on function public.claim_next_content_media_job() to service_role;

revoke all on function public.record_content_media_video_provider_job(uuid, text, text) from public, anon, authenticated;
grant execute on function public.record_content_media_video_provider_job(uuid, text, text) to service_role;

revoke all on function public.defer_content_media_job(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.defer_content_media_job(uuid, text, integer) to service_role;

revoke all on function public.fail_content_media_job(uuid, text) from public, anon, authenticated;
grant execute on function public.fail_content_media_job(uuid, text) to service_role;

revoke all on function public.complete_content_media_job(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.complete_content_media_job(uuid, text, text, text, jsonb) to service_role;
