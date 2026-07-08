begin;

revoke all on function public.submit_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid
) from public, anon, authenticated;

grant execute on function public.submit_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid
) to service_role;

commit;
