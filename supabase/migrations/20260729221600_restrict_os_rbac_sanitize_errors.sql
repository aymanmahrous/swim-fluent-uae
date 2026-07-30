begin;

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
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
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
  v_staff_role text;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  select sp.role::text
  into v_staff_role
  from public.staff_profiles sp
  where sp.id = auth.uid()
    and sp.active = true;

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
        'lastError', case
          when v_staff_role = 'coach' and j.last_error is not null then 'JOB_FAILED'
          else j.last_error
        end,
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

commit;
