begin;

create or replace function public.create_staff_generated_content_batch(
  p_items jsonb,
  p_provider_external_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_content public.content_items%rowtype;
  v_ids uuid[] := '{}'::uuid[];
  v_count integer;
  v_platform text;
  v_content_type text;
  v_caption text;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    return jsonb_build_object('success', false, 'code', 'INVALID_ITEMS');
  end if;

  v_count := jsonb_array_length(p_items);
  if v_count < 1 or v_count > 60 then
    return jsonb_build_object('success', false, 'code', 'INVALID_BATCH_SIZE');
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_platform := v_item->>'platform';
    v_content_type := btrim(coalesce(v_item->>'contentType', ''));
    v_caption := btrim(coalesce(v_item->>'caption', ''));

    if v_platform not in ('instagram','facebook','tiktok') then
      raise exception 'INVALID_PLATFORM' using errcode = '22023';
    end if;

    if char_length(v_content_type) < 2 or char_length(v_caption) < 2 then
      raise exception 'INVALID_CONTENT' using errcode = '22023';
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
      v_platform,
      v_content_type,
      nullif(btrim(coalesce(v_item->>'topic', '')), ''),
      nullif(btrim(coalesce(v_item->>'hook', '')), ''),
      v_caption,
      nullif(btrim(coalesce(v_item->>'cta', '')), ''),
      coalesce(
        array(select jsonb_array_elements_text(coalesce(v_item->'hashtags', '[]'::jsonb))),
        '{}'::text[]
      ),
      nullif(btrim(coalesce(v_item->>'visualPrompt', '')), ''),
      'needs_review',
      nullif(btrim(coalesce(p_provider_external_id, '')), '')
    )
    returning * into v_content;

    v_ids := array_append(v_ids, v_content.id);
  end loop;

  insert into public.audit_logs (
    actor_id,
    actor_type,
    action,
    entity_type,
    detail
  ) values (
    auth.uid(),
    'user',
    'generated_content_batch_saved_for_review',
    'content_batch',
    jsonb_build_object(
      'contentItemIds', to_jsonb(v_ids),
      'count', cardinality(v_ids),
      'providerExternalId', nullif(btrim(coalesce(p_provider_external_id, '')), '')
    )
  );

  return jsonb_build_object(
    'success', true,
    'contentItemIds', to_jsonb(v_ids),
    'count', cardinality(v_ids),
    'status', 'needs_review'
  );
end;
$$;

revoke all on function public.create_staff_generated_content_batch(jsonb, text) from public, anon;
grant execute on function public.create_staff_generated_content_batch(jsonb, text) to authenticated, service_role;

commit;
