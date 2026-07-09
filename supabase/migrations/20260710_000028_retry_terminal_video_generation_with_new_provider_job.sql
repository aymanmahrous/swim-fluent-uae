create or replace function public.fail_content_media_video_provider_job(
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
  v_provider text;
  v_provider_job_id text;
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

  v_provider := nullif(v_job.payload->>'provider', '');
  v_provider_job_id := nullif(v_job.payload->>'providerJobId', '');
  if v_provider is null or v_provider_job_id is null then
    raise exception 'CONTENT_MEDIA_VIDEO_PROVIDER_JOB_MISSING' using errcode = '22023';
  end if;

  update public.ai_media_jobs
  set status = 'failed',
      error = left(coalesce(nullif(btrim(p_error), ''), 'VIDEO_PROVIDER_FAILED'), 1000),
      updated_at = now()
  where provider = v_provider
    and provider_job_id = v_provider_job_id
    and status <> 'succeeded';

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
      payload = case
        when v_final_status = 'retrying'
          then payload - 'provider' - 'providerJobId'
        else payload
      end,
      next_retry_at = case when v_final_status = 'retrying' then now() + v_delay else null end,
      last_error = left(coalesce(nullif(btrim(p_error), ''), 'VIDEO_PROVIDER_FAILED'), 1000),
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  return jsonb_build_object(
    'success', true,
    'jobId', v_job.id,
    'status', v_job.status,
    'attemptCount', v_job.attempt_count,
    'nextRetryAt', v_job.next_retry_at,
    'failedProvider', v_provider,
    'failedProviderJobId', v_provider_job_id,
    'willCreateNewProviderJob', v_final_status = 'retrying',
    'error', v_job.last_error
  );
end;
$function$;

revoke all on function public.fail_content_media_video_provider_job(uuid, text) from public, anon, authenticated;
grant execute on function public.fail_content_media_video_provider_job(uuid, text) to service_role;
