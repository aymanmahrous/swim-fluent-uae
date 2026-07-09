create table if not exists public.automation_leases (
  name text primary key,
  lease_token uuid,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  constraint automation_leases_name_check check (name ~ '^[a-z0-9_-]{2,100}$')
);

create table if not exists public.content_automation_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null default 'running' check (status in ('running', 'completed', 'partial', 'failed')),
  media_attempts integer not null default 0 check (media_attempts >= 0),
  media_processed integer not null default 0 check (media_processed >= 0),
  publish_attempts integer not null default 0 check (publish_attempts >= 0),
  publish_processed integer not null default 0 check (publish_processed >= 0),
  summary jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.automation_leases enable row level security;
alter table public.content_automation_runs enable row level security;

revoke all on table public.automation_leases from public, anon, authenticated;
revoke all on table public.content_automation_runs from public, anon, authenticated;

create index if not exists content_automation_runs_started_idx
  on public.content_automation_runs (started_at desc, id desc);

create index if not exists content_automation_runs_status_started_idx
  on public.content_automation_runs (status, started_at desc);

create or replace function public.claim_content_automation_lease(
  p_lease_name text,
  p_lease_seconds integer default 240
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_name text;
  v_lease public.automation_leases%rowtype;
  v_token uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  v_name := btrim(coalesce(p_lease_name, ''));
  if v_name !~ '^[a-z0-9_-]{2,100}$' then
    raise exception 'INVALID_AUTOMATION_LEASE_NAME' using errcode = '22023';
  end if;

  if p_lease_seconds < 30 or p_lease_seconds > 900 then
    raise exception 'INVALID_AUTOMATION_LEASE_DURATION' using errcode = '22023';
  end if;

  insert into public.automation_leases (name, lease_token, locked_until)
  values (v_name, null, null)
  on conflict (name) do nothing;

  select * into v_lease
  from public.automation_leases
  where name = v_name
  for update;

  if v_lease.lease_token is not null
    and v_lease.locked_until is not null
    and v_lease.locked_until > now()
  then
    return jsonb_build_object(
      'claimed', false,
      'code', 'AUTOMATION_LEASE_HELD',
      'leaseName', v_lease.name,
      'lockedUntil', v_lease.locked_until
    );
  end if;

  v_token := gen_random_uuid();
  update public.automation_leases
  set lease_token = v_token,
      locked_until = now() + make_interval(secs => p_lease_seconds),
      updated_at = now()
  where name = v_name
  returning * into v_lease;

  return jsonb_build_object(
    'claimed', true,
    'leaseName', v_lease.name,
    'leaseToken', v_lease.lease_token,
    'lockedUntil', v_lease.locked_until
  );
end;
$function$;

create or replace function public.release_content_automation_lease(
  p_lease_name text,
  p_lease_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_released boolean;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  update public.automation_leases
  set lease_token = null,
      locked_until = null,
      updated_at = now()
  where name = btrim(coalesce(p_lease_name, ''))
    and lease_token = p_lease_token;

  v_released := found;
  return jsonb_build_object(
    'success', v_released,
    'code', case when v_released then 'AUTOMATION_LEASE_RELEASED' else 'AUTOMATION_LEASE_NOT_OWNED' end
  );
end;
$function$;

create or replace function public.start_content_automation_run(
  p_source text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_run public.content_automation_runs%rowtype;
  v_source text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  v_source := btrim(coalesce(p_source, ''));
  if v_source not in ('vercel_cron', 'internal_manual') then
    raise exception 'INVALID_AUTOMATION_RUN_SOURCE' using errcode = '22023';
  end if;

  insert into public.content_automation_runs (source, status)
  values (v_source, 'running')
  returning * into v_run;

  return jsonb_build_object(
    'success', true,
    'runId', v_run.id,
    'source', v_run.source,
    'status', v_run.status,
    'startedAt', v_run.started_at
  );
end;
$function$;

create or replace function public.complete_content_automation_run(
  p_run_id uuid,
  p_status text,
  p_media_attempts integer,
  p_media_processed integer,
  p_publish_attempts integer,
  p_publish_processed integer,
  p_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_run public.content_automation_runs%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if p_status not in ('completed', 'partial')
    or p_media_attempts < 0
    or p_media_processed < 0
    or p_publish_attempts < 0
    or p_publish_processed < 0
    or p_media_processed > p_media_attempts
    or p_publish_processed > p_publish_attempts
  then
    raise exception 'INVALID_AUTOMATION_RUN_COMPLETION' using errcode = '22023';
  end if;

  update public.content_automation_runs
  set status = p_status,
      media_attempts = p_media_attempts,
      media_processed = p_media_processed,
      publish_attempts = p_publish_attempts,
      publish_processed = p_publish_processed,
      summary = coalesce(p_summary, '{}'::jsonb),
      error = null,
      finished_at = now(),
      updated_at = now()
  where id = p_run_id
    and status = 'running'
  returning * into v_run;

  if v_run.id is null then
    raise exception 'AUTOMATION_RUN_NOT_RUNNING' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'runId', v_run.id,
    'status', v_run.status,
    'mediaAttempts', v_run.media_attempts,
    'mediaProcessed', v_run.media_processed,
    'publishAttempts', v_run.publish_attempts,
    'publishProcessed', v_run.publish_processed,
    'startedAt', v_run.started_at,
    'finishedAt', v_run.finished_at
  );
end;
$function$;

create or replace function public.fail_content_automation_run(
  p_run_id uuid,
  p_error text,
  p_summary jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_run public.content_automation_runs%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  update public.content_automation_runs
  set status = 'failed',
      summary = coalesce(p_summary, '{}'::jsonb),
      error = left(coalesce(nullif(btrim(p_error), ''), 'CONTENT_AUTOMATION_FAILED'), 1000),
      finished_at = now(),
      updated_at = now()
  where id = p_run_id
    and status = 'running'
  returning * into v_run;

  if v_run.id is null then
    raise exception 'AUTOMATION_RUN_NOT_RUNNING' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'runId', v_run.id,
    'status', v_run.status,
    'error', v_run.error,
    'startedAt', v_run.started_at,
    'finishedAt', v_run.finished_at
  );
end;
$function$;

create or replace function public.get_staff_content_automation_status()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'queue', jsonb_build_object(
      'mediaQueued', (select count(*) from public.background_jobs where job_type = 'generate_content_media' and status = 'queued'),
      'mediaProcessing', (select count(*) from public.background_jobs where job_type = 'generate_content_media' and status = 'processing'),
      'mediaRetrying', (select count(*) from public.background_jobs where job_type = 'generate_content_media' and status = 'retrying'),
      'mediaDead', (select count(*) from public.background_jobs where job_type = 'generate_content_media' and status = 'dead'),
      'publishQueued', (select count(*) from public.background_jobs where job_type = 'publish_content' and status = 'queued'),
      'publishProcessing', (select count(*) from public.background_jobs where job_type = 'publish_content' and status = 'processing'),
      'publishRetrying', (select count(*) from public.background_jobs where job_type = 'publish_content' and status = 'retrying'),
      'publishDead', (select count(*) from public.background_jobs where job_type = 'publish_content' and status = 'dead'),
      'ambiguousPublications', (select count(*) from public.content_publication_receipts where status = 'ambiguous')
    ),
    'latestRuns', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'source', r.source,
            'status', r.status,
            'mediaAttempts', r.media_attempts,
            'mediaProcessed', r.media_processed,
            'publishAttempts', r.publish_attempts,
            'publishProcessed', r.publish_processed,
            'summary', r.summary,
            'error', r.error,
            'startedAt', r.started_at,
            'finishedAt', r.finished_at
          )
          order by r.started_at desc, r.id desc
        )
        from (
          select *
          from public.content_automation_runs
          order by started_at desc, id desc
          limit 20
        ) r
      ),
      '[]'::jsonb
    )
  );
end;
$function$;

revoke all on function public.claim_content_automation_lease(text, integer) from public, anon, authenticated;
grant execute on function public.claim_content_automation_lease(text, integer) to service_role;

revoke all on function public.release_content_automation_lease(text, uuid) from public, anon, authenticated;
grant execute on function public.release_content_automation_lease(text, uuid) to service_role;

revoke all on function public.start_content_automation_run(text) from public, anon, authenticated;
grant execute on function public.start_content_automation_run(text) to service_role;

revoke all on function public.complete_content_automation_run(uuid, text, integer, integer, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.complete_content_automation_run(uuid, text, integer, integer, integer, integer, jsonb) to service_role;

revoke all on function public.fail_content_automation_run(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.fail_content_automation_run(uuid, text, jsonb) to service_role;

revoke all on function public.get_staff_content_automation_status() from public, anon;
grant execute on function public.get_staff_content_automation_status() to authenticated;
