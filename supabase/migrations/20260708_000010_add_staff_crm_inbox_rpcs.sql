begin;

create or replace function public.get_staff_crm_leads()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'name', coalesce(nullif(btrim(l.full_name), ''), nullif(btrim(l.name), ''), 'Unknown'),
          'phone', coalesce(l.normalized_phone, l.phone),
          'channel', l.source_channel::text,
          'stage', l.stage::text,
          'score', l.score,
          'language', l.language,
          'intent', coalesce(l.intent, l.service, 'Unclassified'),
          'fearOfWater', l.fear_of_water,
          'lastActivityAt', coalesce(l.updated_at, l.created_at),
          'nextFollowUpAt', l.next_follow_up_at,
          'humanRequired', l.human_required,
          'doNotContact', l.do_not_contact
        )
        order by coalesce(l.updated_at, l.created_at) desc
      )
      from (
        select *
        from public.leads
        order by coalesce(updated_at, created_at) desc
        limit 500
      ) l
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_crm_leads() from public, anon;
grant execute on function public.get_staff_crm_leads() to authenticated, service_role;

create or replace function public.get_staff_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'leadId', c.lead_id,
          'leadName', coalesce(nullif(btrim(l.full_name), ''), nullif(btrim(l.name), ''), 'Unknown'),
          'channel', c.channel::text,
          'mode', c.mode::text,
          'unread', c.unread_count,
          'lastMessage', coalesce(last_message.body, ''),
          'updatedAt', c.updated_at,
          'leadScore', l.score,
          'intent', coalesce(l.intent, l.service, 'Unclassified'),
          'humanRequired', l.human_required
        )
        order by c.updated_at desc
      )
      from (
        select * from public.conversations order by updated_at desc limit 500
      ) c
      join public.leads l on l.id = c.lead_id
      left join lateral (
        select m.body
        from public.messages m
        where m.conversation_id = c.id
        order by m.created_at desc, m.id desc
        limit 1
      ) last_message on true
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_inbox() from public, anon;
grant execute on function public.get_staff_inbox() to authenticated, service_role;

create or replace function public.get_staff_conversation_messages(p_conversation_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if not exists (select 1 from public.conversations where id = p_conversation_id) then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'conversationId', m.conversation_id,
          'direction', m.direction,
          'authorType', m.author_type,
          'body', m.body,
          'safetyClassification', m.safety_classification,
          'createdAt', m.created_at
        )
        order by m.created_at asc, m.id asc
      )
      from (
        select *
        from public.messages
        where conversation_id = p_conversation_id
        order by created_at desc, id desc
        limit 200
      ) m
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_conversation_messages(uuid) from public, anon;
grant execute on function public.get_staff_conversation_messages(uuid) to authenticated, service_role;

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
begin
  if not public.is_active_staff(array['super_admin','admin','reception','coach']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_mode not in ('ai_active','human_takeover','human_required','paused') then
    return jsonb_build_object('success', false, 'code', 'INVALID_MODE');
  end if;

  update public.conversations
  set mode = p_mode::public.conversation_mode,
      updated_at = now()
  where id = p_conversation_id
  returning * into v_conversation;

  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;

  update public.leads
  set human_required = case
        when p_mode in ('human_takeover','human_required') then true
        when p_mode = 'ai_active' then false
        else human_required
      end,
      updated_at = now()
  where id = v_conversation.lead_id;

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
    'conversation_mode_updated',
    'conversation',
    v_conversation.id,
    jsonb_build_object('mode', v_conversation.mode::text)
  );

  return jsonb_build_object(
    'success', true,
    'conversationId', v_conversation.id,
    'mode', v_conversation.mode::text
  );
end;
$$;

revoke all on function public.set_staff_conversation_mode(uuid, text) from public, anon;
grant execute on function public.set_staff_conversation_mode(uuid, text) to authenticated, service_role;

commit;
