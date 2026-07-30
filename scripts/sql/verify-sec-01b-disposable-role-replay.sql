\set ON_ERROR_STOP on

begin;

create temporary table sec01b_results (
  function_name text not null,
  actor text not null,
  response jsonb,
  sqlstate text,
  error_message text
) on commit drop;

create or replace function pg_temp.sec01b_execute(
  p_function_name text,
  p_actor text,
  p_db_role text,
  p_uid uuid,
  p_sql text
) returns void
language plpgsql
as $$
declare
  v_response jsonb;
  v_state text;
  v_message text;
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
  execute format('set local role %I', p_db_role);
  begin
    execute p_sql into v_response;
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate, v_message = message_text;
  end;
  reset role;
  insert into sec01b_results values (p_function_name, p_actor, v_response, v_state, v_message);
end;
$$;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nonstaff@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'inactive@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'content@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'coach@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reception@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@sec01b.invalid', '', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'super@sec01b.invalid', '', now(), now(), now());

insert into public.staff_profiles (id, display_name, role, active) values
  ('10000000-0000-0000-0000-000000000002', 'Inactive Staff', 'admin', false),
  ('10000000-0000-0000-0000-000000000003', 'Content Manager', 'content_manager', true),
  ('10000000-0000-0000-0000-000000000004', 'Coach', 'coach', true),
  ('10000000-0000-0000-0000-000000000005', 'Reception', 'reception', true),
  ('10000000-0000-0000-0000-000000000006', 'Admin', 'admin', true),
  ('10000000-0000-0000-0000-000000000007', 'Super Admin', 'super_admin', true);

insert into public.booking_requests (
  id, idempotency_key, full_name, phone, normalized_phone, gender, category, location,
  swam_before, fear_of_water, training_type, requested_date, requested_time, terms_accepted
) values (
  '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002',
  'Synthetic Booking', '0500000000', '971500000000', 'Male', 'Adult', 'Dubai', false, false,
  'Private', current_date + 7, time '10:00', true
);

insert into public.leads (id, full_name, name, stage, human_required, do_not_contact, source_channel)
values ('30000000-0000-0000-0000-000000000001', 'Synthetic Lead', 'Synthetic Lead', 'new', false, false, 'website');
insert into public.conversations (id, lead_id, channel, external_thread_id, mode)
values ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'website', 'sec01b-thread', 'ai_active');

-- ACL and role matrix. Allowed roles must pass the role gate and return NOT_FOUND.
do $$
declare
  r record;
  f record;
begin
  for r in select * from (values
    ('anon', null::uuid, 'anon'),
    ('authenticated_non_staff', '10000000-0000-0000-0000-000000000001'::uuid, 'authenticated'),
    ('inactive_staff', '10000000-0000-0000-0000-000000000002'::uuid, 'authenticated'),
    ('content_manager', '10000000-0000-0000-0000-000000000003'::uuid, 'authenticated'),
    ('coach', '10000000-0000-0000-0000-000000000004'::uuid, 'authenticated'),
    ('reception', '10000000-0000-0000-0000-000000000005'::uuid, 'authenticated'),
    ('admin', '10000000-0000-0000-0000-000000000006'::uuid, 'authenticated'),
    ('super_admin', '10000000-0000-0000-0000-000000000007'::uuid, 'authenticated'),
    ('service_role_without_staff_context', null::uuid, 'service_role')
  ) as x(actor, uid, db_role)
  loop
    for f in select * from (values
      ('booking', $call$select public.update_booking_request_status('ffffffff-ffff-ffff-ffff-ffffffffffff','pending')$call$),
      ('lead', $call$select public.update_staff_lead_workflow('ffffffff-ffff-ffff-ffff-ffffffffffff','new',false,false,null)$call$),
      ('conversation', $call$select public.set_staff_conversation_mode('ffffffff-ffff-ffff-ffff-ffffffffffff','ai_active')$call$)
    ) as y(function_name, call_sql)
    loop
      perform pg_temp.sec01b_execute(f.function_name, r.actor, r.db_role, r.uid, f.call_sql);
    end loop;
  end loop;
end
$$;

do $$
declare
  v_bad integer;
begin
  -- Denials: anon may be ACL 42501; all other denied contexts must be STAFF_ACCESS_DENIED/42501.
  select count(*) into v_bad from sec01b_results
  where actor in ('anon','authenticated_non_staff','inactive_staff','content_manager','service_role_without_staff_context')
    and not (sqlstate = '42501' and error_message is not null and error_message !~* '(select |insert |update |delete |stack|context:)');
  if v_bad <> 0 then raise exception 'SEC01B_COMMON_DENY_MATRIX_FAILED:%', v_bad; end if;

  select count(*) into v_bad from sec01b_results
  where actor = 'coach' and function_name in ('booking','conversation')
    and not (sqlstate = '42501' and error_message = 'STAFF_ACCESS_DENIED');
  if v_bad <> 0 then raise exception 'SEC01B_COACH_DENY_MATRIX_FAILED:%', v_bad; end if;

  select count(*) into v_bad from sec01b_results
  where (actor in ('reception','admin','super_admin') or (actor = 'coach' and function_name = 'lead'))
    and not (sqlstate is null and response->>'code' = 'NOT_FOUND' and response->>'success' = 'false');
  if v_bad <> 0 then raise exception 'SEC01B_ALLOW_MATRIX_FAILED:%', v_bad; end if;
end
$$;

-- Replay, audit, invalid input and NOT_FOUND contracts as admin.
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000006', true);
set local role authenticated;

do $$
declare
  a jsonb;
  b jsonb;
  v_count integer;
  v_detail jsonb;
begin
  a := public.update_booking_request_status('20000000-0000-0000-0000-000000000001','contacted');
  b := public.update_booking_request_status('20000000-0000-0000-0000-000000000001','contacted');
  if a->>'changed' <> 'true' or b->>'changed' <> 'false' or a->>'status' <> 'contacted' then
    raise exception 'SEC01B_BOOKING_REPLAY_RESPONSE_FAILED:%:%', a, b;
  end if;
  select count(*), max(detail) into v_count, v_detail from public.audit_logs
  where action='booking_request_status_updated' and entity_id='20000000-0000-0000-0000-000000000001';
  if v_count <> 1 or v_detail->>'previousStatus' <> 'pending' or v_detail->>'nextStatus' <> 'contacted' then
    raise exception 'SEC01B_BOOKING_AUDIT_FAILED:%:%', v_count, v_detail;
  end if;

  a := public.set_staff_conversation_mode('40000000-0000-0000-0000-000000000001','human_takeover');
  b := public.set_staff_conversation_mode('40000000-0000-0000-0000-000000000001','human_takeover');
  if a->>'changed' <> 'true' or b->>'changed' <> 'false' or a->>'mode' <> 'human_takeover' then
    raise exception 'SEC01B_CONVERSATION_REPLAY_RESPONSE_FAILED:%:%', a, b;
  end if;
  select count(*), max(detail) into v_count, v_detail from public.audit_logs
  where action='conversation_mode_updated' and entity_id='40000000-0000-0000-0000-000000000001';
  if v_count <> 1 or v_detail->>'previousMode' <> 'ai_active' or v_detail->>'nextMode' <> 'human_takeover' then
    raise exception 'SEC01B_CONVERSATION_AUDIT_FAILED:%:%', v_count, v_detail;
  end if;

  a := public.update_staff_lead_workflow(
    '30000000-0000-0000-0000-000000000001','qualified',false,false,now()+interval '2 days'
  );
  b := public.update_staff_lead_workflow(
    '30000000-0000-0000-0000-000000000001','qualified',false,false,now()+interval '2 days'
  );
  -- Timestamp calls above are not byte-identical; exercise exact replay with persisted effective value.
  b := public.update_staff_lead_workflow(
    '30000000-0000-0000-0000-000000000001','qualified',false,false,
    (select next_follow_up_at from public.leads where id='30000000-0000-0000-0000-000000000001')
  );
  if a->>'changed' <> 'true' or b->>'changed' <> 'false' then
    raise exception 'SEC01B_LEAD_REPLAY_RESPONSE_FAILED:%:%', a, b;
  end if;
  select count(*) into v_count from public.follow_up_jobs
  where lead_id='30000000-0000-0000-0000-000000000001' and status in ('queued','processing','retrying');
  if v_count <> 1 then raise exception 'SEC01B_LEAD_ACTIVE_JOB_DUPLICATED:%', v_count; end if;
  select count(*), max(detail) into v_count, v_detail from public.audit_logs
  where action='lead_workflow_updated' and entity_id='30000000-0000-0000-0000-000000000001';
  if v_count <> 2 then
    -- One audit for initial schedule plus one for the intentionally different first replay timestamp.
    raise exception 'SEC01B_LEAD_AUDIT_COUNT_FAILED:%', v_count;
  end if;
  if v_detail->>'nextStage' <> 'qualified' then raise exception 'SEC01B_LEAD_AUDIT_DETAIL_FAILED:%', v_detail; end if;

  if public.update_booking_request_status('20000000-0000-0000-0000-000000000001','bad')->>'code' <> 'INVALID_STATUS'
     or public.update_staff_lead_workflow('30000000-0000-0000-0000-000000000001','bad',false,false,null)->>'code' <> 'INVALID_STAGE'
     or public.set_staff_conversation_mode('40000000-0000-0000-0000-000000000001','bad')->>'code' <> 'INVALID_MODE' then
    raise exception 'SEC01B_INVALID_VALUE_CONTRACT_FAILED';
  end if;
  if public.update_booking_request_status('ffffffff-ffff-ffff-ffff-ffffffffffff','pending')->>'code' <> 'NOT_FOUND'
     or public.update_staff_lead_workflow('ffffffff-ffff-ffff-ffff-ffffffffffff','new',false,false,null)->>'code' <> 'NOT_FOUND'
     or public.set_staff_conversation_mode('ffffffff-ffff-ffff-ffff-ffffffffffff','ai_active')->>'code' <> 'NOT_FOUND' then
    raise exception 'SEC01B_NOT_FOUND_CONTRACT_FAILED';
  end if;
end
$$;

reset role;

select jsonb_pretty(jsonb_build_object(
  'status','SEC_01B_DISPOSABLE_ROLE_REPLAY_PASS',
  'roleResults',(select jsonb_agg(to_jsonb(r) order by function_name, actor) from sec01b_results r),
  'bookingAudit',(select jsonb_agg(to_jsonb(a)) from public.audit_logs a where action='booking_request_status_updated'),
  'conversationAudit',(select jsonb_agg(to_jsonb(a)) from public.audit_logs a where action='conversation_mode_updated'),
  'leadAudit',(select jsonb_agg(to_jsonb(a)) from public.audit_logs a where action='lead_workflow_updated'),
  'activeFollowUpJobs',(select count(*) from public.follow_up_jobs where lead_id='30000000-0000-0000-0000-000000000001' and status in ('queued','processing','retrying'))
)) as sec_01b_execution_evidence;

rollback;
