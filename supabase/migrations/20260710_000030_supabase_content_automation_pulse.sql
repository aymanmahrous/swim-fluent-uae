create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.content_automation_scheduler_auth (
  id text primary key,
  token_hash text not null,
  endpoint_url text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_automation_scheduler_auth_id_check check (id = 'primary'),
  constraint content_automation_scheduler_auth_token_hash_check check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint content_automation_scheduler_auth_endpoint_check check (endpoint_url ~ '^https://[A-Za-z0-9.-]+/api/cron/content-automation$')
);

alter table public.content_automation_scheduler_auth enable row level security;
revoke all on table public.content_automation_scheduler_auth from public, anon, authenticated;

create index if not exists content_automation_scheduler_auth_active_idx
  on public.content_automation_scheduler_auth (active, updated_at desc);

do $scheduler_secret$
declare
  v_token text;
  v_secret_name constant text := 'relax_fix_content_automation_scheduler_token';
begin
  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where name = v_secret_name
  order by created_at desc
  limit 1;

  if v_token is null then
    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    perform vault.create_secret(
      v_token,
      v_secret_name,
      'Server-side token for the Relax Fix content automation Supabase Cron pulse.'
    );
  end if;

  insert into public.content_automation_scheduler_auth (
    id,
    token_hash,
    endpoint_url,
    active
  ) values (
    'primary',
    encode(extensions.digest(v_token, 'sha256'), 'hex'),
    'https://swim-fluent-uae-w532.vercel.app/api/cron/content-automation',
    false
  )
  on conflict (id) do update
  set token_hash = excluded.token_hash,
      endpoint_url = excluded.endpoint_url,
      updated_at = now();
end;
$scheduler_secret$;

create or replace function public.verify_content_automation_scheduler_token(
  p_token text
)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'extensions', 'pg_temp'
as $function$
declare
  v_token text;
  v_auth public.content_automation_scheduler_auth%rowtype;
  v_hash text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  v_token := btrim(coalesce(p_token, ''));
  if char_length(v_token) < 32 or char_length(v_token) > 256 then
    return jsonb_build_object('valid', false, 'code', 'INVALID_SCHEDULER_TOKEN');
  end if;

  select * into v_auth
  from public.content_automation_scheduler_auth
  where id = 'primary';

  if v_auth.id is null then
    return jsonb_build_object('valid', false, 'code', 'SCHEDULER_AUTH_NOT_CONFIGURED');
  end if;

  v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');
  return jsonb_build_object(
    'valid', v_auth.active and v_hash = v_auth.token_hash,
    'code', case
      when not v_auth.active then 'SCHEDULER_PULSE_INACTIVE'
      when v_hash = v_auth.token_hash then 'SCHEDULER_TOKEN_VALID'
      else 'SCHEDULER_TOKEN_INVALID'
    end
  );
end;
$function$;

create or replace function public.dispatch_content_automation_pulse()
returns bigint
language plpgsql
security definer
set search_path to 'public', 'net', 'vault', 'pg_temp'
as $function$
declare
  v_auth public.content_automation_scheduler_auth%rowtype;
  v_token text;
  v_request_id bigint;
begin
  select * into v_auth
  from public.content_automation_scheduler_auth
  where id = 'primary'
    and active is true;

  if v_auth.id is null then
    return null;
  end if;

  select decrypted_secret into v_token
  from vault.decrypted_secrets
  where name = 'relax_fix_content_automation_scheduler_token'
  order by created_at desc
  limit 1;

  if v_token is null then
    raise exception 'SCHEDULER_VAULT_TOKEN_MISSING' using errcode = '22023';
  end if;

  select net.http_get(
    url := v_auth.endpoint_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_token,
      'Accept', 'application/json',
      'X-Relax-Fix-Scheduler', 'supabase_cron'
    ),
    timeout_milliseconds := 55000
  ) into v_request_id;

  return v_request_id;
end;
$function$;

create or replace function public.set_content_automation_pulse_active(
  p_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_auth public.content_automation_scheduler_auth%rowtype;
  v_job_id bigint;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  update public.content_automation_scheduler_auth
  set active = p_active,
      updated_at = now()
  where id = 'primary'
  returning * into v_auth;

  if v_auth.id is null then
    raise exception 'SCHEDULER_AUTH_NOT_CONFIGURED' using errcode = '22023';
  end if;

  select jobid into v_job_id
  from cron.job
  where jobname = 'relax-fix-content-automation-pulse'
  limit 1;

  if v_job_id is not null then
    perform cron.alter_job(v_job_id, active := p_active);
  end if;

  return jsonb_build_object(
    'success', true,
    'active', v_auth.active,
    'cronJobId', v_job_id,
    'endpointUrl', v_auth.endpoint_url
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
  if v_source not in ('vercel_cron', 'supabase_cron', 'internal_manual') then
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

revoke all on function public.verify_content_automation_scheduler_token(text) from public, anon, authenticated;
grant execute on function public.verify_content_automation_scheduler_token(text) to service_role;

revoke all on function public.dispatch_content_automation_pulse() from public, anon, authenticated;

revoke all on function public.set_content_automation_pulse_active(boolean) from public, anon, authenticated;
grant execute on function public.set_content_automation_pulse_active(boolean) to service_role;

select cron.schedule(
  'relax-fix-content-automation-pulse',
  '*/5 * * * *',
  'select public.dispatch_content_automation_pulse();'
);

select cron.alter_job(
  (select jobid from cron.job where jobname = 'relax-fix-content-automation-pulse' limit 1),
  active := false
);
