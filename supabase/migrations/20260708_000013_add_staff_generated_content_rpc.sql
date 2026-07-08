begin;

create or replace function public.create_staff_generated_content_item(
  p_platform text,
  p_content_type text,
  p_topic text,
  p_hook text,
  p_caption text,
  p_cta text,
  p_hashtags text[],
  p_visual_prompt text,
  p_provider_external_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item public.content_items%rowtype;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_platform not in ('instagram','facebook','tiktok') then
    return jsonb_build_object('success', false, 'code', 'INVALID_PLATFORM');
  end if;

  if coalesce(char_length(btrim(p_content_type)), 0) < 2
     or coalesce(char_length(btrim(p_caption)), 0) < 2 then
    return jsonb_build_object('success', false, 'code', 'INVALID_CONTENT');
  end if;

  insert into public.content_items (
    platform,
    content_type,
    topic,
    hook,
    caption,
    cta,
    hashtags,
    visual_prompt,
    status,
    provider_external_id
  ) values (
    p_platform,
    btrim(p_content_type),
    nullif(btrim(p_topic), ''),
    nullif(btrim(p_hook), ''),
    btrim(p_caption),
    nullif(btrim(p_cta), ''),
    coalesce(p_hashtags, '{}'::text[]),
    nullif(btrim(p_visual_prompt), ''),
    'needs_review',
    nullif(btrim(p_provider_external_id), '')
  )
  returning * into v_item;

  insert into public.audit_logs (
    actor_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    detail
  ) values (
    auth.uid(),
    'user',
    'generated_content_saved_for_review',
    'content_item',
    v_item.id,
    jsonb_build_object(
      'platform', v_item.platform,
      'status', v_item.status::text,
      'providerExternalId', v_item.provider_external_id
    )
  );

  return jsonb_build_object(
    'success', true,
    'contentItemId', v_item.id,
    'status', v_item.status::text
  );
end;
$$;

revoke all on function public.create_staff_generated_content_item(text, text, text, text, text, text, text[], text, text) from public, anon;
grant execute on function public.create_staff_generated_content_item(text, text, text, text, text, text, text[], text, text) to authenticated, service_role;

commit;
