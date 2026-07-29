begin;

-- The hardened ingress remains the only externally reachable booking write path.
revoke all on function public.submit_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid
) from public, anon, authenticated;
grant execute on function public.submit_booking_request(
  text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid
) to service_role;

-- Trigger execution does not require public RPC privileges.
revoke all on function public.enqueue_content_media_after_insert()
from public, anon, authenticated;
grant execute on function public.enqueue_content_media_after_insert()
to service_role;

commit;

-- Emergency rollback (only if the server ingress is unavailable):
-- grant execute on function public.submit_booking_request(
--   text, text, text, text, text, text, boolean, boolean, text, date, time, boolean, uuid
-- ) to anon;
-- Reopening the anonymous direct RPC restores availability but also restores the documented bypass.
