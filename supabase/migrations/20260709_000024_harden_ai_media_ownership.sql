begin;

alter table public.media_assets
add column if not exists created_by uuid references auth.users(id) on delete restrict;

update public.media_assets m
set created_by = (
  select a.actor_id
  from public.audit_logs a
  where a.entity_type = 'media_asset'
    and a.entity_id = m.id
    and a.actor_type = 'user'
    and a.actor_id is not null
  order by a.created_at asc
  limit 1
)
where m.created_by is null
  and exists (
    select 1
    from public.audit_logs a
    where a.entity_type = 'media_asset'
      and a.entity_id = m.id
      and a.actor_type = 'user'
      and a.actor_id is not null
  );

create index if not exists idx_media_assets_created_by_created
on public.media_assets (created_by, created_at desc);

alter table public.media_assets enable row level security;
revoke all on table public.media_assets from public, anon, authenticated;

update storage.buckets
set public = false,
    updated_at = now()
where id = 'relax-fix-media';

drop policy if exists "Active staff can upload own media folder" on storage.objects;
create policy "Active staff can upload own media folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'relax-fix-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.can_manage_relax_fix_media()
);

drop policy if exists "Active staff can read own media folder" on storage.objects;
create policy "Active staff can read own media folder"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'relax-fix-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.can_manage_relax_fix_media()
);

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
    created_by,
    content_item_id,
    asset_type,
    source,
    storage_path,
    provider,
    provider_job_id,
    prompt,
    metadata
  ) values (
    auth.uid(),
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
    'createdBy', v_asset.created_by,
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
  on conflict (provider, provider_job_id) do nothing
  returning * into v_job;

  if not found then
    select * into v_job
    from public.ai_media_jobs
    where provider = btrim(p_provider)
      and provider_job_id = btrim(p_provider_job_id)
      and requested_by = auth.uid();

    if not found then
      return jsonb_build_object('success', false, 'code', 'JOB_OWNERSHIP_CONFLICT');
    end if;
  end if;

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
    and asset_type = 'video'
    and requested_by = auth.uid();

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

create or replace function public.get_staff_video_generation_jobs()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'jobId', j.id,
          'contentItemId', j.content_item_id,
          'provider', j.provider,
          'providerJobId', j.provider_job_id,
          'status', j.status,
          'prompt', j.prompt,
          'sourceAssetUrl', j.source_asset_url,
          'aspectRatio', j.aspect_ratio,
          'durationSeconds', j.duration_seconds,
          'storagePath', j.storage_path,
          'error', j.error,
          'metadata', j.metadata,
          'createdAt', j.created_at,
          'updatedAt', j.updated_at
        )
        order by j.created_at desc, j.id desc
      )
      from (
        select *
        from public.ai_media_jobs
        where asset_type = 'video'
          and requested_by = auth.uid()
        order by created_at desc, id desc
        limit 100
      ) j
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_video_generation_jobs() from public, anon;
grant execute on function public.get_staff_video_generation_jobs() to authenticated, service_role;

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
    and requested_by = auth.uid()
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
    and requested_by = auth.uid()
  returning * into v_job;

  if p_status = 'succeeded' then
    insert into public.media_assets (
      created_by,
      content_item_id,
      asset_type,
      source,
      storage_path,
      provider,
      provider_job_id,
      prompt,
      metadata
    ) values (
      v_job.requested_by,
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

create or replace function public.get_staff_media_assets()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'createdBy', m.created_by,
          'contentItemId', m.content_item_id,
          'assetType', m.asset_type,
          'source', m.source,
          'storagePath', m.storage_path,
          'provider', m.provider,
          'providerJobId', m.provider_job_id,
          'prompt', m.prompt,
          'metadata', m.metadata,
          'createdAt', m.created_at
        )
        order by m.created_at desc, m.id desc
      )
      from (
        select *
        from public.media_assets
        where created_by = auth.uid()
        order by created_at desc, id desc
        limit 500
      ) m
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_media_assets() from public, anon;
grant execute on function public.get_staff_media_assets() to authenticated, service_role;

commit;
