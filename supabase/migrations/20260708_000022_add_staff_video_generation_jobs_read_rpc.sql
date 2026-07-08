begin;

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

commit;
