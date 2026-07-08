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

commit;
