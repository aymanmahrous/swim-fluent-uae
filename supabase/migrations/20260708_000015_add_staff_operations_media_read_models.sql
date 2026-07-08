begin;

create or replace function public.get_staff_operations_queue()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_follow_ups jsonb;
  v_background_jobs jsonb;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', f.id,
        'leadId', f.lead_id,
        'leadName', coalesce(nullif(btrim(l.full_name), ''), nullif(btrim(l.name), ''), 'Unknown'),
        'conversationId', f.conversation_id,
        'attemptNumber', f.attempt_number,
        'scheduledFor', f.scheduled_for,
        'status', f.status::text,
        'stoppedReason', f.stopped_reason,
        'createdAt', f.created_at
      )
      order by f.scheduled_for asc, f.id asc
    ),
    '[]'::jsonb
  ) into v_follow_ups
  from (
    select *
    from public.follow_up_jobs
    order by scheduled_for desc, id desc
    limit 250
  ) f
  join public.leads l on l.id = f.lead_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', j.id,
        'jobType', j.job_type,
        'status', j.status::text,
        'attemptCount', j.attempt_count,
        'nextRetryAt', j.next_retry_at,
        'lastError', j.last_error,
        'createdAt', j.created_at,
        'updatedAt', j.updated_at
      )
      order by j.created_at desc, j.id desc
    ),
    '[]'::jsonb
  ) into v_background_jobs
  from (
    select *
    from public.background_jobs
    order by created_at desc, id desc
    limit 250
  ) j;

  return jsonb_build_object(
    'followUps', v_follow_ups,
    'backgroundJobs', v_background_jobs,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.get_staff_operations_queue() from public, anon;
grant execute on function public.get_staff_operations_queue() to authenticated, service_role;

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
