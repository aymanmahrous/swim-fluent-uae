begin;

create index if not exists idx_background_jobs_publish_content_item
on public.background_jobs ((payload->>'contentItemId'))
where job_type = 'publish_content';

create or replace function public.transition_staff_content_item(
  p_content_item_id uuid,
  p_action text,
  p_scheduled_for timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item public.content_items%rowtype;
  v_previous_status public.content_status;
  v_previous_scheduled_for timestamptz;
begin
  if not public.is_active_staff(array['super_admin','admin','content_manager']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select *
  into v_item
  from public.content_items
  where id = p_content_item_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  v_previous_status := v_item.status;
  v_previous_scheduled_for := v_item.scheduled_for;

  case p_action
    when 'approve' then
      if v_item.status not in ('draft','generated','needs_review','approved') then
        return jsonb_build_object('success', false, 'code', 'INVALID_TRANSITION', 'status', v_item.status::text);
      end if;

      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_NOT_SCHEDULED',
          updated_at = now()
      where job_type = 'publish_content'
        and payload->>'contentItemId' = v_item.id::text
        and status in ('queued','processing','retrying');

      update public.content_items
      set status = 'approved', scheduled_for = null, updated_at = now()
      where id = v_item.id
      returning * into v_item;

    when 'return_to_review' then
      if v_item.status not in ('draft','generated','needs_review','approved','scheduled','failed') then
        return jsonb_build_object('success', false, 'code', 'INVALID_TRANSITION', 'status', v_item.status::text);
      end if;

      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_RETURNED_TO_REVIEW',
          updated_at = now()
      where job_type = 'publish_content'
        and payload->>'contentItemId' = v_item.id::text
        and status in ('queued','processing','retrying');

      update public.content_items
      set status = 'needs_review', scheduled_for = null, updated_at = now()
      where id = v_item.id
      returning * into v_item;

    when 'schedule' then
      if v_item.status not in ('approved','scheduled') then
        return jsonb_build_object('success', false, 'code', 'APPROVAL_REQUIRED', 'status', v_item.status::text);
      end if;

      if p_scheduled_for is null or p_scheduled_for <= now() then
        return jsonb_build_object('success', false, 'code', 'INVALID_SCHEDULE_TIME');
      end if;

      if p_scheduled_for > now() + interval '366 days' then
        return jsonb_build_object('success', false, 'code', 'SCHEDULE_TOO_FAR');
      end if;

      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_RESCHEDULED',
          updated_at = now()
      where job_type = 'publish_content'
        and payload->>'contentItemId' = v_item.id::text
        and status in ('queued','processing','retrying');

      update public.content_items
      set status = 'scheduled', scheduled_for = p_scheduled_for, updated_at = now()
      where id = v_item.id
      returning * into v_item;

      insert into public.background_jobs (
        job_type,
        status,
        payload,
        next_retry_at
      ) values (
        'publish_content',
        'queued',
        jsonb_build_object('contentItemId', v_item.id),
        p_scheduled_for
      );

    when 'unschedule' then
      if v_item.status <> 'scheduled' then
        return jsonb_build_object('success', false, 'code', 'INVALID_TRANSITION', 'status', v_item.status::text);
      end if;

      update public.background_jobs
      set status = 'dead',
          last_error = 'CONTENT_UNSCHEDULED',
          updated_at = now()
      where job_type = 'publish_content'
        and payload->>'contentItemId' = v_item.id::text
        and status in ('queued','processing','retrying');

      update public.content_items
      set status = 'approved', scheduled_for = null, updated_at = now()
      where id = v_item.id
      returning * into v_item;

    else
      return jsonb_build_object('success', false, 'code', 'INVALID_ACTION');
  end case;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(),
    'user',
    'content_item_transitioned',
    'content_item',
    v_item.id,
    jsonb_build_object(
      'requestedAction', p_action,
      'previousStatus', v_previous_status::text,
      'nextStatus', v_item.status::text,
      'previousScheduledFor', v_previous_scheduled_for,
      'nextScheduledFor', v_item.scheduled_for
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

revoke all on function public.transition_staff_content_item(uuid, text, timestamptz) from public, anon;
grant execute on function public.transition_staff_content_item(uuid, text, timestamptz) to authenticated, service_role;

commit;
