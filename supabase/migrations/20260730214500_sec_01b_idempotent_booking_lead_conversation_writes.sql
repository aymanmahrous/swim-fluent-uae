begin;

create or replace function public.update_booking_request_status(
  p_booking_request_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.booking_requests%rowtype;
  v_previous_status text;
begin
  if not public.is_active_staff(array['super_admin','admin','reception']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_status not in ('pending','contacted','confirmed','declined','cancelled') then
    return jsonb_build_object('success', false, 'code', 'INVALID_STATUS');
  end if;

  select * into v_row
  from public.booking_requests
  where id = p_booking_request_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  v_previous_status := v_row.status;
  if v_previous_status = p_status then
    return jsonb_build_object(
      'success', true,
      'bookingRequestId', v_row.id,
      'status', v_row.status,
      'changed', false
    );
  end if;

  update public.booking_requests
  set status = p_status,
      updated_at = now()
  where id = p_booking_request_id
  returning * into v_row;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(), 'user', 'booking_request_status_updated', 'booking_request', v_row.id,
    jsonb_build_object('previousStatus', v_previous_status, 'nextStatus', v_row.status)
  );

  return jsonb_build_object(
    'success', true,
    'bookingRequestId', v_row.id,
    'status', v_row.status,
    'changed', true
  );
end;
$$;

create or replace function public.set_staff_conversation_mode(
  p_conversation_id uuid,
  p_mode text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_conversation public.conversations%rowtype;
  v_previous_mode text;
begin
  if not public.is_active_staff(array['super_admin','admin','reception']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_mode not in ('ai_active','human_takeover','human_required','paused') then
    return jsonb_build_object('success', false, 'code', 'INVALID_MODE');
  end if;

  select * into v_conversation
  from public.conversations
  where id = p_conversation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  v_previous_mode := v_conversation.mode::text;
  if v_previous_mode = p_mode then
    return jsonb_build_object(
      'success', true,
      'conversationId', v_conversation.id,
      'mode', v_conversation.mode::text,
      'changed', false
    );
  end if;

  update public.conversations
  set mode = p_mode::public.conversation_mode,
      updated_at = now()
  where id = p_conversation_id
  returning * into v_conversation;

  update public.leads
  set human_required = case
        when p_mode in ('human_takeover','human_required') then true
        when p_mode = 'ai_active' then false
        else human_required
      end,
      updated_at = now()
  where id = v_conversation.lead_id;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(), 'user', 'conversation_mode_updated', 'conversation', v_conversation.id,
    jsonb_build_object('previousMode', v_previous_mode, 'nextMode', v_conversation.mode::text)
  );

  return jsonb_build_object(
    'success', true,
    'conversationId', v_conversation.id,
    'mode', v_conversation.mode::text,
    'changed', true
  );
end;
$$;

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
  v_active_job public.follow_up_jobs%rowtype;
  v_next_attempt integer;
  v_effective_follow_up_at timestamptz;
  v_stop_reason text;
  v_changed boolean;
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_stage not in ('new','contacted','qualified','booking_intent','booked','follow_up','lost','customer') then
    return jsonb_build_object('success', false, 'code', 'INVALID_STAGE');
  end if;

  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  select * into v_active_job
  from public.follow_up_jobs
  where lead_id = p_lead_id and status in ('queued','processing','retrying')
  order by attempt_number, id
  limit 1
  for update;

  v_previous_stage := v_lead.stage;
  v_previous_human_required := v_lead.human_required;
  v_previous_do_not_contact := v_lead.do_not_contact;
  v_previous_next_follow_up_at := v_lead.next_follow_up_at;

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

  v_changed := v_lead.stage::text is distinct from p_stage
    or v_lead.human_required is distinct from coalesce(p_human_required, false)
    or v_lead.do_not_contact is distinct from coalesce(p_do_not_contact, false)
    or v_lead.next_follow_up_at is distinct from v_effective_follow_up_at
    or (v_effective_follow_up_at is not null and (v_active_job.id is null or v_active_job.scheduled_for is distinct from v_effective_follow_up_at))
    or (v_effective_follow_up_at is null and v_active_job.id is not null);

  if not v_changed then
    return jsonb_build_object(
      'success', true, 'leadId', v_lead.id, 'stage', v_lead.stage::text,
      'humanRequired', v_lead.human_required, 'doNotContact', v_lead.do_not_contact,
      'nextFollowUpAt', v_lead.next_follow_up_at,
      'followUpAttempt', v_active_job.attempt_number,
      'updatedAt', v_lead.updated_at, 'changed', false
    );
  end if;

  if v_effective_follow_up_at is null then
    update public.follow_up_jobs
    set status = 'dead', stopped_reason = v_stop_reason
    where lead_id = p_lead_id and status in ('queued','processing','retrying');
  elsif v_active_job.id is not null then
    update public.follow_up_jobs
    set scheduled_for = v_effective_follow_up_at,
        status = 'queued',
        stopped_reason = null
    where id = v_active_job.id;
    v_next_attempt := v_active_job.attempt_number;
  else
    select coalesce(max(attempt_number), 0) + 1 into v_next_attempt
    from public.follow_up_jobs where lead_id = p_lead_id and status = 'completed';
    if v_next_attempt > 3 then
      return jsonb_build_object('success', false, 'code', 'FOLLOW_UP_LIMIT_REACHED');
    end if;
    insert into public.follow_up_jobs (
      lead_id, conversation_id, attempt_number, scheduled_for, status
    ) values (
      p_lead_id,
      (select c.id from public.conversations c where c.lead_id = p_lead_id order by c.updated_at desc, c.id desc limit 1),
      v_next_attempt, v_effective_follow_up_at, 'queued'
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

  if v_lead.do_not_contact then
    update public.conversations set mode = 'paused', updated_at = now()
    where lead_id = v_lead.id and mode in ('ai_active','human_required');
  elsif v_lead.human_required then
    update public.conversations set mode = 'human_required', updated_at = now()
    where lead_id = v_lead.id and mode = 'ai_active';
  else
    update public.conversations set mode = 'ai_active', updated_at = now()
    where lead_id = v_lead.id and mode = 'human_required';
  end if;

  insert into public.audit_logs (
    actor_id, actor_type, action, entity_type, entity_id, detail
  ) values (
    auth.uid(), 'user', 'lead_workflow_updated', 'lead', v_lead.id,
    jsonb_build_object(
      'previousStage', v_previous_stage::text, 'nextStage', v_lead.stage::text,
      'previousHumanRequired', v_previous_human_required, 'nextHumanRequired', v_lead.human_required,
      'previousDoNotContact', v_previous_do_not_contact, 'nextDoNotContact', v_lead.do_not_contact,
      'previousNextFollowUpAt', v_previous_next_follow_up_at, 'nextFollowUpAt', v_lead.next_follow_up_at,
      'followUpAttempt', v_next_attempt
    )
  );

  return jsonb_build_object(
    'success', true, 'leadId', v_lead.id, 'stage', v_lead.stage::text,
    'humanRequired', v_lead.human_required, 'doNotContact', v_lead.do_not_contact,
    'nextFollowUpAt', v_lead.next_follow_up_at, 'followUpAttempt', v_next_attempt,
    'updatedAt', v_lead.updated_at, 'changed', true
  );
end;
$$;

revoke all on function public.update_booking_request_status(uuid, text) from public, anon;
revoke all on function public.update_staff_lead_workflow(uuid, text, boolean, boolean, timestamptz) from public, anon;
revoke all on function public.set_staff_conversation_mode(uuid, text) from public, anon;
grant execute on function public.update_booking_request_status(uuid, text) to authenticated, service_role;
grant execute on function public.update_staff_lead_workflow(uuid, text, boolean, boolean, timestamptz) to authenticated, service_role;
grant execute on function public.set_staff_conversation_mode(uuid, text) to authenticated, service_role;

commit;
