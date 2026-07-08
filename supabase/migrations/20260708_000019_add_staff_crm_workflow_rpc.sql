begin;

create index if not exists idx_follow_up_jobs_lead_status
on public.follow_up_jobs (lead_id, status, scheduled_for);

create or replace function public.update_staff_lead_workflow(
  p_lead_id uuid,
  p_stage text,
  p_human_required boolean,
  p_do_not_contact boolean,
  p_next_follow_up_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead public.leads%rowtype;
  v_previous_stage public.lead_stage;
  v_previous_human_required boolean;
  v_previous_do_not_contact boolean;
  v_previous_next_follow_up_at timestamptz;
  v_active_attempt integer;
  v_next_attempt integer;
  v_effective_follow_up_at timestamptz;
  v_stop_reason text;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_stage not in ('new','contacted','qualified','booking_intent','booked','follow_up','lost','customer') then
    return jsonb_build_object('success', false, 'code', 'INVALID_STAGE');
  end if;

  perform 1
  from public.follow_up_jobs
  where lead_id = p_lead_id
    and status in ('queued','processing','retrying')
  order by id
  for update;

  select *
  into v_lead
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  v_previous_stage := v_lead.stage;
  v_previous_human_required := v_lead.human_required;
  v_previous_do_not_contact := v_lead.do_not_contact;
  v_previous_next_follow_up_at := v_lead.next_follow_up_at;

  select min(attempt_number)
  into v_active_attempt
  from public.follow_up_jobs
  where lead_id = p_lead_id
    and status in ('queued','processing','retrying');

  if p_do_not_contact then
    v_effective_follow_up_at := null;
    v_stop_reason := 'DO_NOT_CONTACT';
  elsif p_stage in ('booked','customer','lost') then
    v_effective_follow_up_at := null;
    v_stop_reason := 'TERMINAL_LEAD_STAGE';
  else
    v_effective_follow_up_at := p_next_follow_up_at;
    v_stop_reason := case when p_next_follow_up_at is null then 'FOLLOW_UP_CLEARED' else 'FOLLOW_UP_RESCHEDULED' end;
  end if;

  if v_effective_follow_up_at is not null and v_effective_follow_up_at <= now() then
    return jsonb_build_object('success', false, 'code', 'INVALID_FOLLOW_UP_TIME');
  end if;

  if v_effective_follow_up_at is not null and v_effective_follow_up_at > now() + interval '366 days' then
    return jsonb_build_object('success', false, 'code', 'FOLLOW_UP_TOO_FAR');
  end if;

  if v_effective_follow_up_at is not null then
    if v_active_attempt is not null then
      v_next_attempt := v_active_attempt;
    else
      select coalesce(max(attempt_number), 0) + 1
      into v_next_attempt
      from public.follow_up_jobs
      where lead_id = p_lead_id
        and status = 'completed';
    end if;

    if v_next_attempt > 3 then
      return jsonb_build_object('success', false, 'code', 'FOLLOW_UP_LIMIT_REACHED');
    end if;
  end if;

  update public.follow_up_jobs
  set status = 'dead',
      stopped_reason = v_stop_reason
  where lead_id = p_lead_id
    and status in ('queued','processing','retrying');

  if v_effective_follow_up_at is not null then
    insert into public.follow_up_jobs (
      lead_id,
      conversation_id,
      attempt_number,
      scheduled_for,
      status
    ) values (
      p_lead_id,
      (
        select c.id
        from public.conversations c
        where c.lead_id = p_lead_id
        order by c.updated_at desc, c.id desc
        limit 1
      ),
      v_next_attempt,
      v_effective_follow_up_at,
      'queued'
    );
  end if;

  update public.leads
  set stage = p_stage::public.lead_stage,
      human_required = coalesce(p_human_required, false),
      do_not_contact = coalesce(p_do_not_contact, false),
      next_follow_up_at = v_effective_follow_up_at,
      updated_at = now()
  where id = p_lead_id
  returning * into v_lead;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(),
    'user',
    'lead_workflow_updated',
    'lead',
    v_lead.id,
    jsonb_build_object(
      'previousStage', v_previous_stage::text,
      'nextStage', v_lead.stage::text,
      'previousHumanRequired', v_previous_human_required,
      'nextHumanRequired', v_lead.human_required,
      'previousDoNotContact', v_previous_do_not_contact,
      'nextDoNotContact', v_lead.do_not_contact,
      'previousNextFollowUpAt', v_previous_next_follow_up_at,
      'nextFollowUpAt', v_lead.next_follow_up_at,
      'followUpAttempt', v_next_attempt
    )
  );

  return jsonb_build_object(
    'success', true,
    'leadId', v_lead.id,
    'stage', v_lead.stage::text,
    'humanRequired', v_lead.human_required,
    'doNotContact', v_lead.do_not_contact,
    'nextFollowUpAt', v_lead.next_follow_up_at,
    'followUpAttempt', v_next_attempt,
    'updatedAt', v_lead.updated_at
  );
end;
$$;

revoke all on function public.update_staff_lead_workflow(uuid, text, boolean, boolean, timestamptz) from public, anon;
grant execute on function public.update_staff_lead_workflow(uuid, text, boolean, boolean, timestamptz) to authenticated, service_role;

commit;
