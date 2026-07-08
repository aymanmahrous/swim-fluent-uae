begin;

create or replace function public.update_staff_content_item(
  p_content_item_id uuid,
  p_topic text,
  p_hook text,
  p_caption text,
  p_cta text,
  p_hashtags text[],
  p_visual_prompt text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item public.content_items%rowtype;
  v_previous_status public.content_status;
  v_hashtag text;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  perform 1
  from public.background_jobs
  where job_type = 'publish_content'
    and payload->>'contentItemId' = p_content_item_id::text
    and status in ('queued','processing','retrying')
  order by id
  for update;

  select *
  into v_item
  from public.content_items
  where id = p_content_item_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  if v_item.status = 'published' then
    return jsonb_build_object('success', false, 'code', 'PUBLISHED_CONTENT_IMMUTABLE');
  end if;

  if coalesce(char_length(btrim(p_caption)), 0) < 2
     or char_length(btrim(p_caption)) > 5000 then
    return jsonb_build_object('success', false, 'code', 'INVALID_CAPTION');
  end if;

  if char_length(btrim(coalesce(p_topic, ''))) > 300
     or char_length(btrim(coalesce(p_hook, ''))) > 500
     or char_length(btrim(coalesce(p_cta, ''))) > 500
     or char_length(btrim(coalesce(p_visual_prompt, ''))) > 2000 then
    return jsonb_build_object('success', false, 'code', 'CONTENT_FIELD_TOO_LONG');
  end if;

  if coalesce(cardinality(p_hashtags), 0) > 30 then
    return jsonb_build_object('success', false, 'code', 'TOO_MANY_HASHTAGS');
  end if;

  foreach v_hashtag in array coalesce(p_hashtags, '{}'::text[])
  loop
    if coalesce(char_length(btrim(v_hashtag)), 0) < 1 or char_length(btrim(v_hashtag)) > 100 then
      return jsonb_build_object('success', false, 'code', 'INVALID_HASHTAG');
    end if;
  end loop;

  v_previous_status := v_item.status;

  update public.background_jobs
  set status = 'dead',
      last_error = 'CONTENT_EDITED_REVIEW_REQUIRED',
      updated_at = now()
  where job_type = 'publish_content'
    and payload->>'contentItemId' = v_item.id::text
    and status in ('queued','processing','retrying');

  update public.content_items
  set topic = nullif(btrim(coalesce(p_topic, '')), ''),
      hook = nullif(btrim(coalesce(p_hook, '')), ''),
      caption = btrim(p_caption),
      cta = nullif(btrim(coalesce(p_cta, '')), ''),
      hashtags = coalesce(
        array(
          select distinct btrim(value)
          from unnest(coalesce(p_hashtags, '{}'::text[])) value
          where btrim(value) <> ''
        ),
        '{}'::text[]
      ),
      visual_prompt = nullif(btrim(coalesce(p_visual_prompt, '')), ''),
      status = 'needs_review',
      scheduled_for = null,
      updated_at = now()
  where id = v_item.id
  returning * into v_item;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(),
    'user',
    'content_item_edited',
    'content_item',
    v_item.id,
    jsonb_build_object(
      'previousStatus', v_previous_status::text,
      'nextStatus', v_item.status::text,
      'scheduleCleared', v_previous_status = 'scheduled'
    )
  );

  return jsonb_build_object(
    'success', true,
    'contentItemId', v_item.id,
    'status', v_item.status::text,
    'scheduledFor', v_item.scheduled_for,
    'updatedAt', v_item.updated_at
  );
end;
$$;

revoke all on function public.update_staff_content_item(uuid, text, text, text, text, text[], text) from public, anon;
grant execute on function public.update_staff_content_item(uuid, text, text, text, text, text[], text) to authenticated, service_role;

commit;
