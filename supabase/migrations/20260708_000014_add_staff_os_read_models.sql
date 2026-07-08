begin;

create or replace function public.get_staff_content_items()
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
          'id', c.id,
          'scheduledFor', c.scheduled_for,
          'platform', c.platform,
          'contentType', c.content_type,
          'topic', coalesce(c.topic, ''),
          'hook', coalesce(c.hook, ''),
          'caption', coalesce(c.caption, ''),
          'cta', coalesce(c.cta, ''),
          'hashtags', to_jsonb(c.hashtags),
          'visualPrompt', coalesce(c.visual_prompt, ''),
          'status', c.status::text,
          'providerExternalId', c.provider_external_id,
          'publishedAt', c.published_at,
          'createdAt', c.created_at,
          'updatedAt', c.updated_at
        )
        order by coalesce(c.scheduled_for, c.created_at) asc, c.id asc
      )
      from (
        select *
        from public.content_items
        order by coalesce(scheduled_for, created_at) desc, id desc
        limit 500
      ) c
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_content_items() from public, anon;
grant execute on function public.get_staff_content_items() to authenticated, service_role;

create or replace function public.get_staff_growth_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_views bigint;
  v_dms bigint;
  v_qualified bigint;
  v_booking_requests bigint;
  v_published bigint;
  v_content_items bigint;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select
    coalesce(sum(latest.views), 0),
    coalesce(sum(latest.dm_count), 0)
  into v_views, v_dms
  from (
    select distinct on (content_item_id)
      content_item_id,
      views,
      dm_count
    from public.content_metrics
    order by content_item_id, recorded_at desc, id desc
  ) latest;

  select count(*) into v_qualified
  from public.leads
  where stage in ('qualified','booking_intent','booked','customer');

  select count(*) into v_booking_requests
  from public.booking_requests;

  select count(*) into v_published
  from public.content_items
  where status = 'published';

  select count(*) into v_content_items
  from public.content_items;

  return jsonb_build_object(
    'views', v_views,
    'dms', v_dms,
    'qualifiedLeads', v_qualified,
    'bookingRequests', v_booking_requests,
    'publishedItems', v_published,
    'contentItems', v_content_items,
    'attributionReady', false,
    'note', 'Views and DMs use the latest recorded metric snapshot per content item. CRM stages and booking requests are real totals. Cross-entity attribution is not claimed until provider and campaign attribution links are populated.'
  );
end;
$$;

revoke all on function public.get_staff_growth_analytics() from public, anon;
grant execute on function public.get_staff_growth_analytics() to authenticated, service_role;

create or replace function public.get_staff_command_center()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_new_leads bigint;
  v_hot_leads bigint;
  v_human_replies bigint;
  v_follow_ups_due bigint;
  v_posts_scheduled bigint;
  v_priority jsonb;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select count(*) into v_new_leads
  from public.leads
  where stage in ('new','contacted');

  select count(*) into v_hot_leads
  from public.leads
  where score >= 80;

  select count(*) into v_human_replies
  from public.conversations
  where mode in ('human_takeover','human_required');

  select count(*) into v_follow_ups_due
  from public.leads
  where next_follow_up_at is not null
    and next_follow_up_at <= now()
    and do_not_contact = false;

  select count(*) into v_posts_scheduled
  from public.content_items
  where status = 'scheduled';

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.full_name,
        'intent', coalesce(p.intent, p.service, 'Unclassified'),
        'channel', p.source_channel::text,
        'score', p.score,
        'humanRequired', p.human_required,
        'nextFollowUpAt', p.next_follow_up_at
      )
      order by p.human_required desc, p.score desc, p.updated_at desc
    ),
    '[]'::jsonb
  ) into v_priority
  from (
    select *
    from public.leads
    where score >= 80 or human_required = true
    order by human_required desc, score desc, updated_at desc
    limit 20
  ) p;

  return jsonb_build_object(
    'metrics', jsonb_build_object(
      'newLeads', v_new_leads,
      'hotLeads', v_hot_leads,
      'humanReplies', v_human_replies,
      'followUpsDue', v_follow_ups_due,
      'postsScheduled', v_posts_scheduled
    ),
    'priorityQueue', v_priority,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.get_staff_command_center() from public, anon;
grant execute on function public.get_staff_command_center() to authenticated, service_role;

commit;
