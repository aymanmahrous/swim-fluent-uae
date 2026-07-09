create table if not exists public.content_publication_receipts (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok')),
  provider text not null,
  status text not null default 'reserved' check (
    status in ('reserved', 'container_created', 'published', 'ambiguous', 'failed')
  ),
  external_container_id text,
  external_post_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, platform)
);

alter table public.content_publication_receipts enable row level security;

revoke all on table public.content_publication_receipts from public, anon, authenticated;

create index if not exists content_publication_receipts_status_updated_idx
  on public.content_publication_receipts (status, updated_at desc);

create or replace function public.claim_publication_receipt(
  p_content_item_id uuid,
  p_platform text,
  p_provider text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_receipt public.content_publication_receipts%rowtype;
  v_content_platform text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if p_platform not in ('instagram', 'facebook', 'tiktok')
    or char_length(btrim(coalesce(p_provider, ''))) < 2 then
    raise exception 'INVALID_PUBLICATION_RECEIPT_INPUT' using errcode = '22023';
  end if;

  select platform into v_content_platform
  from public.content_items
  where id = p_content_item_id;

  if v_content_platform is null then
    raise exception 'CONTENT_ITEM_NOT_FOUND' using errcode = '22023';
  end if;

  if v_content_platform <> p_platform then
    raise exception 'CONTENT_PLATFORM_MISMATCH' using errcode = '22023';
  end if;

  insert into public.content_publication_receipts (
    content_item_id,
    platform,
    provider
  ) values (
    p_content_item_id,
    p_platform,
    btrim(p_provider)
  )
  on conflict (content_item_id, platform) do nothing;

  select * into v_receipt
  from public.content_publication_receipts
  where content_item_id = p_content_item_id
    and platform = p_platform
  for update;

  if v_receipt.provider <> btrim(p_provider) then
    raise exception 'PUBLICATION_PROVIDER_MISMATCH' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'id', v_receipt.id,
    'contentItemId', v_receipt.content_item_id,
    'platform', v_receipt.platform,
    'provider', v_receipt.provider,
    'status', v_receipt.status,
    'externalContainerId', v_receipt.external_container_id,
    'externalPostId', v_receipt.external_post_id,
    'lastError', v_receipt.last_error,
    'createdAt', v_receipt.created_at,
    'updatedAt', v_receipt.updated_at
  );
end;
$function$;

create or replace function public.record_publication_container(
  p_content_item_id uuid,
  p_platform text,
  p_provider text,
  p_external_container_id text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_receipt public.content_publication_receipts%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_external_container_id, ''))) < 1 then
    raise exception 'INVALID_EXTERNAL_CONTAINER_ID' using errcode = '22023';
  end if;

  update public.content_publication_receipts
  set status = case when status = 'published' then status else 'container_created' end,
      external_container_id = coalesce(external_container_id, btrim(p_external_container_id)),
      last_error = null,
      updated_at = now()
  where content_item_id = p_content_item_id
    and platform = p_platform
    and provider = btrim(p_provider)
    and status not in ('ambiguous', 'failed')
  returning * into v_receipt;

  if v_receipt.id is null then
    raise exception 'PUBLICATION_RECEIPT_NOT_WRITABLE' using errcode = '22023';
  end if;

  if v_receipt.external_container_id <> btrim(p_external_container_id) then
    raise exception 'PUBLICATION_CONTAINER_MISMATCH' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_receipt.status,
    'externalContainerId', v_receipt.external_container_id
  );
end;
$function$;

create or replace function public.mark_publication_receipt_ambiguous(
  p_content_item_id uuid,
  p_platform text,
  p_provider text,
  p_error text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_receipt public.content_publication_receipts%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  update public.content_publication_receipts
  set status = case when status = 'published' then status else 'ambiguous' end,
      last_error = left(coalesce(nullif(btrim(p_error), ''), 'META_PUBLISH_RESULT_AMBIGUOUS'), 1000),
      updated_at = now()
  where content_item_id = p_content_item_id
    and platform = p_platform
    and provider = btrim(p_provider)
  returning * into v_receipt;

  if v_receipt.id is null then
    raise exception 'PUBLICATION_RECEIPT_NOT_FOUND' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_receipt.status,
    'externalPostId', v_receipt.external_post_id,
    'lastError', v_receipt.last_error
  );
end;
$function$;

create or replace function public.complete_publication_receipt(
  p_content_item_id uuid,
  p_platform text,
  p_provider text,
  p_external_post_id text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_receipt public.content_publication_receipts%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_external_post_id, ''))) < 1 then
    raise exception 'INVALID_EXTERNAL_POST_ID' using errcode = '22023';
  end if;

  update public.content_publication_receipts
  set status = 'published',
      external_post_id = coalesce(external_post_id, btrim(p_external_post_id)),
      last_error = null,
      updated_at = now()
  where content_item_id = p_content_item_id
    and platform = p_platform
    and provider = btrim(p_provider)
    and status <> 'failed'
  returning * into v_receipt;

  if v_receipt.id is null then
    raise exception 'PUBLICATION_RECEIPT_NOT_WRITABLE' using errcode = '22023';
  end if;

  if v_receipt.external_post_id <> btrim(p_external_post_id) then
    raise exception 'PUBLICATION_POST_MISMATCH' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_receipt.status,
    'externalPostId', v_receipt.external_post_id
  );
end;
$function$;

revoke all on function public.claim_publication_receipt(uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_publication_receipt(uuid, text, text) to service_role;

revoke all on function public.record_publication_container(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.record_publication_container(uuid, text, text, text) to service_role;

revoke all on function public.mark_publication_receipt_ambiguous(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.mark_publication_receipt_ambiguous(uuid, text, text, text) to service_role;

revoke all on function public.complete_publication_receipt(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.complete_publication_receipt(uuid, text, text, text) to service_role;
