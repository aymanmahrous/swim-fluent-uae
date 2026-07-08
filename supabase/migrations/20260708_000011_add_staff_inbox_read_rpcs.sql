begin;

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
        select *
        from public.conversations
        order by updated_at desc
        limit 500
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

commit;
