begin;

create or replace function public.claim_next_publish_job()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.background_jobs%rowtype;
  v_content public.content_items%rowtype;
  v_content_item_id text;
  v_media jsonb;
begin
  select *
  into v_job
  from public.background_jobs
  where job_type = 'publish_content'
    and status in ('queued','retrying')
    and coalesce(next_retry_at, created_at) <= now()
  order by coalesce(next_retry_at, created_at) asc, created_at asc, id asc
  for update skip locked
  limit 1;

  if not found then
    return jsonb_build_object('claimed', false, 'code', 'NO_JOB');
  end if;

  v_content_item_id := v_job.payload->>'contentItemId';

  select *
  into v_content
  from public.content_items
  where id::text = v_content_item_id
  for update;

  if not found then
    update public.background_jobs
    set status = 'dead', last_error = 'CONTENT_NOT_FOUND', updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('claimed', false, 'code', 'CONTENT_NOT_FOUND', 'jobId', v_job.id);
  end if;

  if v_content.status = 'published' then
    update public.background_jobs
    set status = 'completed',
        result = jsonb_build_object('alreadyPublished', true, 'contentItemId', v_content.id),
        last_error = null,
        updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('claimed', false, 'code', 'ALREADY_PUBLISHED', 'jobId', v_job.id);
  end if;

  if v_content.status <> 'scheduled' or v_content.scheduled_for is null then
    update public.background_jobs
    set status = 'dead', last_error = 'CONTENT_NOT_SCHEDULED', updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('claimed', false, 'code', 'CONTENT_NOT_SCHEDULED', 'jobId', v_job.id);
  end if;

  if v_content.scheduled_for > now() then
    update public.background_jobs
    set status = 'queued', next_retry_at = v_content.scheduled_for, updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('claimed', false, 'code', 'NOT_DUE', 'jobId', v_job.id);
  end if;

  update public.background_jobs
  set status = 'processing',
      attempt_count = attempt_count + 1,
      last_error = null,
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'assetType', m.asset_type,
        'storagePath', m.storage_path,
        'provider', m.provider
      )
      order by m.created_at asc, m.id asc
    ),
    '[]'::jsonb
  )
  into v_media
  from public.media_assets m
  where m.content_item_id = v_content.id;

  return jsonb_build_object(
    'claimed', true,
    'jobId', v_job.id,
    'attemptCount', v_job.attempt_count,
    'content', jsonb_build_object(
      'contentItemId', v_content.id,
      'platform', v_content.platform,
      'contentType', v_content.content_type,
      'caption', coalesce(v_content.caption, ''),
      'hashtags', to_jsonb(v_content.hashtags),
      'scheduledFor', v_content.scheduled_for,
      'media', v_media
    )
  );
end;
$$;

revoke all on function public.claim_next_publish_job() from public, anon, authenticated;
grant execute on function public.claim_next_publish_job() to service_role;

create or replace function public.defer_publish_job(
  p_job_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.background_jobs%rowtype;
begin
  select * into v_job
  from public.background_jobs
  where id = p_job_id and job_type = 'publish_content'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  if v_job.status <> 'processing' then
    return jsonb_build_object('success', false, 'code', 'INVALID_JOB_STATE', 'status', v_job.status::text);
  end if;

  update public.background_jobs
  set status = 'queued',
      attempt_count = greatest(attempt_count - 1, 0),
      next_retry_at = now() + interval '1 hour',
      last_error = left(coalesce(p_reason, 'DEFERRED'), 1000),
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status::text,
    'nextRetryAt', v_job.next_retry_at
  );
end;
$$;

revoke all on function public.defer_publish_job(uuid, text) from public, anon, authenticated;
grant execute on function public.defer_publish_job(uuid, text) to service_role;

create or replace function public.fail_publish_job(
  p_job_id uuid,
  p_error text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.background_jobs%rowtype;
  v_next_retry_at timestamptz;
  v_next_status public.job_status;
begin
  select * into v_job
  from public.background_jobs
  where id = p_job_id and job_type = 'publish_content'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  if v_job.status <> 'processing' then
    return jsonb_build_object('success', false, 'code', 'INVALID_JOB_STATE', 'status', v_job.status::text);
  end if;

  if v_job.attempt_count >= 5 then
    v_next_status := 'dead';
    v_next_retry_at := null;
  else
    v_next_status := 'retrying';
    v_next_retry_at := now() + case v_job.attempt_count
      when 1 then interval '5 minutes'
      when 2 then interval '15 minutes'
      when 3 then interval '1 hour'
      else interval '3 hours'
    end;
  end if;

  update public.background_jobs
  set status = v_next_status,
      next_retry_at = v_next_retry_at,
      last_error = left(coalesce(p_error, 'PUBLISH_FAILED'), 1000),
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status::text,
    'attemptCount', v_job.attempt_count,
    'nextRetryAt', v_job.next_retry_at
  );
end;
$$;

revoke all on function public.fail_publish_job(uuid, text) from public, anon, authenticated;
grant execute on function public.fail_publish_job(uuid, text) to service_role;

create or replace function public.complete_publish_job(
  p_job_id uuid,
  p_provider_external_id text,
  p_published_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.background_jobs%rowtype;
  v_content public.content_items%rowtype;
  v_content_item_id text;
begin
  select * into v_job
  from public.background_jobs
  where id = p_job_id and job_type = 'publish_content'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  if v_job.status = 'completed' then
    return jsonb_build_object('success', true, 'code', 'ALREADY_COMPLETED', 'jobId', v_job.id);
  end if;

  if v_job.status <> 'processing' then
    return jsonb_build_object('success', false, 'code', 'INVALID_JOB_STATE', 'status', v_job.status::text);
  end if;

  if nullif(btrim(coalesce(p_provider_external_id, '')), '') is null or p_published_at is null then
    return jsonb_build_object('success', false, 'code', 'INVALID_PROVIDER_RESULT');
  end if;

  v_content_item_id := v_job.payload->>'contentItemId';
  select * into v_content
  from public.content_items
  where id::text = v_content_item_id
  for update;

  if not found then
    update public.background_jobs
    set status = 'dead', last_error = 'CONTENT_NOT_FOUND', updated_at = now()
    where id = v_job.id;
    return jsonb_build_object('success', false, 'code', 'CONTENT_NOT_FOUND');
  end if;

  if v_content.status <> 'published' then
    if v_content.status <> 'scheduled' then
      return jsonb_build_object('success', false, 'code', 'CONTENT_NOT_SCHEDULED', 'status', v_content.status::text);
    end if;

    update public.content_items
    set status = 'published',
        provider_external_id = btrim(p_provider_external_id),
        published_at = p_published_at,
        updated_at = now()
    where id = v_content.id
    returning * into v_content;
  end if;

  update public.background_jobs
  set status = 'completed',
      result = jsonb_build_object(
        'contentItemId', v_content.id,
        'providerExternalId', v_content.provider_external_id,
        'publishedAt', v_content.published_at
      ),
      next_retry_at = null,
      last_error = null,
      updated_at = now()
  where id = v_job.id;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    null,
    'provider',
    'content_published',
    'content_item',
    v_content.id,
    jsonb_build_object(
      'jobId', v_job.id,
      'platform', v_content.platform,
      'providerExternalId', v_content.provider_external_id,
      'publishedAt', v_content.published_at
    )
  );

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'contentItemId', v_content.id,
    'status', v_content.status::text,
    'providerExternalId', v_content.provider_external_id,
    'publishedAt', v_content.published_at
  );
end;
$$;

revoke all on function public.complete_publish_job(uuid, text, timestamptz) from public, anon, authenticated;
grant execute on function public.complete_publish_job(uuid, text, timestamptz) to service_role;

commit;
