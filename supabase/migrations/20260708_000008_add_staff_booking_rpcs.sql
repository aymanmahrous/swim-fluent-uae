begin;

create or replace function public.get_staff_bookings()
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
      select jsonb_agg(to_jsonb(b) order by b.created_at desc)
      from (
        select
          id,
          full_name,
          phone,
          normalized_phone,
          gender,
          category,
          location,
          other_location,
          swam_before,
          fear_of_water,
          training_type,
          requested_date,
          requested_time,
          status,
          created_at,
          updated_at
        from public.booking_requests
        order by created_at desc
        limit 500
      ) b
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_staff_bookings() from public, anon;
grant execute on function public.get_staff_bookings() to authenticated, service_role;

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
begin
  if not public.is_active_staff(array['super_admin','admin','reception']) then
    raise exception 'STAFF_ACCESS_DENIED' using errcode = '42501';
  end if;

  if p_status not in ('pending','contacted','confirmed','declined','cancelled') then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_STATUS',
      'message', 'Unsupported booking status.'
    );
  end if;

  update public.booking_requests
  set status = p_status,
      updated_at = now()
  where id = p_booking_request_id
  returning * into v_row;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'message', 'Booking request was not found.'
    );
  end if;

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
    'booking_request_status_updated',
    'booking_request',
    v_row.id,
    jsonb_build_object('status', v_row.status)
  );

  return jsonb_build_object(
    'success', true,
    'bookingRequestId', v_row.id,
    'status', v_row.status
  );
end;
$$;

revoke all on function public.update_booking_request_status(uuid, text) from public, anon;
grant execute on function public.update_booking_request_status(uuid, text) to authenticated, service_role;

commit;
