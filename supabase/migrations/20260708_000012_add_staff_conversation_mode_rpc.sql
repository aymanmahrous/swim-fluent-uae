begin;

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
