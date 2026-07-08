begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'relax-fix-media',
  'relax-fix-media',
  true,
  104857600,
  array['image/png','image/jpeg','image/webp','video/mp4']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

drop policy if exists "Active staff can upload own media folder" on storage.objects;
create policy "Active staff can upload own media folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'relax-fix-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.staff_profiles sp
    where sp.id = auth.uid()
      and sp.active = true
      and sp.role in ('super_admin','admin','content_manager')
  )
);

create table if not exists public.ai_media_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id) on delete restrict,
  content_item_id uuid references public.content_items(id) on delete set null,
  asset_type text not null check (asset_type in ('video')),
  provider text not null,
  provider_job_id text not null,
  status text not null check (status in ('queued','running','succeeded','failed')),
  prompt text not null,
  source_asset_url text,
  aspect_ratio text,
  duration_seconds integer check (duration_seconds is null or duration_seconds between 2 and 15),
  storage_path text,
  error text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_job_id)
);

alter table public.ai_media_jobs enable row level security;
revoke all on table public.ai_media_jobs from public, anon, authenticated;

create index if not exists idx_ai_media_jobs_requested_by_created
on public.ai_media_jobs (requested_by, created_at desc);

create index if not exists idx_ai_media_jobs_status_updated
on public.ai_media_jobs (status, updated_at);

create or replace function public.create_staff_media_asset_record(
  p_content_item_id uuid,
  p_asset_type text,
  p_storage_path text,
  p_provider text,
  p_provider_job_id text,
  p_prompt text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, storage, pg_temp
as $$
declare
  v_asset public.media_assets%rowtype;
  v_prefix text := auth.uid()::text || '/';
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_asset_type not in ('image','video') then
    return jsonb_build_object('success', false, 'code', 'INVALID_ASSET_TYPE');
  end if;

  if nullif(btrim(coalesce(p_storage_path, '')), '') is null
     or left(p_storage_path, char_length(v_prefix)) <> v_prefix then
    return jsonb_build_object('success', false, 'code', 'INVALID_STORAGE_PATH');
  end if;

  if not exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'relax-fix-media'
      and o.name = p_storage_path
  ) then
    return jsonb_build_object('success', false, 'code', 'STORAGE_OBJECT_NOT_FOUND');
  end if;

  if p_content_item_id is not null
     and not exists (select 1 from public.content_items where id = p_content_item_id) then
    return jsonb_build_object('success', false, 'code', 'CONTENT_ITEM_NOT_FOUND');
  end if;

  insert into public.media_assets (
    content_item_id,
    asset_type,
    source,
    storage_path,
    provider,
    provider_job_id,
    prompt,
    metadata
  ) values (
    p_content_item_id,
    p_asset_type,
    'ai_generated',
    p_storage_path,
    nullif(btrim(coalesce(p_provider, '')), ''),
    nullif(btrim(coalesce(p_provider_job_id, '')), ''),
    nullif(btrim(coalesce(p_prompt, '')), ''),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_asset;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(),
    'user',
    'ai_media_asset_persisted',
    'media_asset',
    v_asset.id,
    jsonb_build_object(
      'assetType', v_asset.asset_type,
      'provider', v_asset.provider,
      'storagePath', v_asset.storage_path,
      'contentItemId', v_asset.content_item_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'mediaAssetId', v_asset.id,
    'assetType', v_asset.asset_type,
    'storagePath', v_asset.storage_path,
    'createdAt', v_asset.created_at
  );
end;
$$;

revoke all on function public.create_staff_media_asset_record(uuid, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.create_staff_media_asset_record(uuid, text, text, text, text, text, jsonb) to authenticated, service_role;

create or replace function public.create_staff_video_generation_job(
  p_content_item_id uuid,
  p_provider text,
  p_provider_job_id text,
  p_prompt text,
  p_source_asset_url text,
  p_aspect_ratio text,
  p_duration_seconds integer,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.ai_media_jobs%rowtype;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_provider, '')), '') is null
     or nullif(btrim(coalesce(p_provider_job_id, '')), '') is null
     or coalesce(char_length(btrim(p_prompt)), 0) < 2 then
    return jsonb_build_object('success', false, 'code', 'INVALID_JOB_INPUT');
  end if;

  if p_duration_seconds is not null and p_duration_seconds not between 2 and 15 then
    return jsonb_build_object('success', false, 'code', 'INVALID_DURATION');
  end if;

  if p_content_item_id is not null
     and not exists (select 1 from public.content_items where id = p_content_item_id) then
    return jsonb_build_object('success', false, 'code', 'CONTENT_ITEM_NOT_FOUND');
  end if;

  insert into public.ai_media_jobs (
    requested_by,
    content_item_id,
    asset_type,
    provider,
    provider_job_id,
    status,
    prompt,
    source_asset_url,
    aspect_ratio,
    duration_seconds,
    metadata
  ) values (
    auth.uid(),
    p_content_item_id,
    'video',
    btrim(p_provider),
    btrim(p_provider_job_id),
    'queued',
    btrim(p_prompt),
    nullif(btrim(coalesce(p_source_asset_url, '')), ''),
    nullif(btrim(coalesce(p_aspect_ratio, '')), ''),
    p_duration_seconds,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (provider, provider_job_id) do update set
    updated_at = now()
  returning * into v_job;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'providerJobId', v_job.provider_job_id,
    'status', v_job.status,
    'createdAt', v_job.created_at
  );
end;
$$;

revoke all on function public.create_staff_video_generation_job(uuid, text, text, text, text, text, integer, jsonb) from public, anon;
grant execute on function public.create_staff_video_generation_job(uuid, text, text, text, text, text, integer, jsonb) to authenticated, service_role;

create or replace function public.get_staff_video_generation_job(p_job_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_job public.ai_media_jobs%rowtype;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select * into v_job
  from public.ai_media_jobs
  where id = p_job_id
    and asset_type = 'video';

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'contentItemId', v_job.content_item_id,
    'provider', v_job.provider,
    'providerJobId', v_job.provider_job_id,
    'status', v_job.status,
    'prompt', v_job.prompt,
    'sourceAssetUrl', v_job.source_asset_url,
    'aspectRatio', v_job.aspect_ratio,
    'durationSeconds', v_job.duration_seconds,
    'storagePath', v_job.storage_path,
    'error', v_job.error,
    'metadata', v_job.metadata,
    'createdAt', v_job.created_at,
    'updatedAt', v_job.updated_at
  );
end;
$$;

revoke all on function public.get_staff_video_generation_job(uuid) from public, anon;
grant execute on function public.get_staff_video_generation_job(uuid) to authenticated, service_role;

create or replace function public.update_staff_video_generation_job(
  p_job_id uuid,
  p_status text,
  p_storage_path text default null,
  p_error text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, storage, pg_temp
as $$
declare
  v_job public.ai_media_jobs%rowtype;
  v_asset public.media_assets%rowtype;
  v_prefix text := auth.uid()::text || '/';
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_status not in ('queued','running','succeeded','failed') then
    return jsonb_build_object('success', false, 'code', 'INVALID_STATUS');
  end if;

  select * into v_job
  from public.ai_media_jobs
  where id = p_job_id
    and asset_type = 'video'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  if v_job.status = 'succeeded' then
    return jsonb_build_object(
      'success', true,
      'code', 'ALREADY_SUCCEEDED',
      'jobId', v_job.id,
      'status', v_job.status,
      'storagePath', v_job.storage_path
    );
  end if;

  if p_status = 'succeeded' then
    if nullif(btrim(coalesce(p_storage_path, '')), '') is null
       or left(p_storage_path, char_length(v_prefix)) <> v_prefix then
      return jsonb_build_object('success', false, 'code', 'INVALID_STORAGE_PATH');
    end if;

    if not exists (
      select 1
      from storage.objects o
      where o.bucket_id = 'relax-fix-media'
        and o.name = p_storage_path
    ) then
      return jsonb_build_object('success', false, 'code', 'STORAGE_OBJECT_NOT_FOUND');
    end if;
  end if;

  update public.ai_media_jobs
  set status = p_status,
      storage_path = case when p_status = 'succeeded' then p_storage_path else storage_path end,
      error = case when p_status = 'failed' then left(coalesce(p_error, 'VIDEO_GENERATION_FAILED'), 1000) else null end,
      metadata = metadata || coalesce(p_metadata, '{}'::jsonb),
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  if p_status = 'succeeded' then
    insert into public.media_assets (
      content_item_id,
      asset_type,
      source,
      storage_path,
      provider,
      provider_job_id,
      prompt,
      metadata
    ) values (
      v_job.content_item_id,
      'video',
      'ai_generated',
      v_job.storage_path,
      v_job.provider,
      v_job.provider_job_id,
      v_job.prompt,
      v_job.metadata
    )
    returning * into v_asset;

    insert into public.audit_logs (
      actor_id, actor_type, action, entity_type, entity_id, detail
    ) values (
      auth.uid(),
      'user',
      'ai_video_generation_persisted',
      'media_asset',
      v_asset.id,
      jsonb_build_object(
        'jobId', v_job.id,
        'providerJobId', v_job.provider_job_id,
        'storagePath', v_job.storage_path,
        'contentItemId', v_job.content_item_id
      )
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status,
    'storagePath', v_job.storage_path,
    'error', v_job.error,
    'updatedAt', v_job.updated_at
  );
end;
$$;

revoke all on function public.update_staff_video_generation_job(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.update_staff_video_generation_job(uuid, text, text, text, jsonb) to authenticated, service_role;

commit;
