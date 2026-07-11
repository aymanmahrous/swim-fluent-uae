# Rollback: international booking phones

This migration must not be reversed by deleting or rewriting booking data.

## Before any international booking has been accepted

1. Revert the application deployment to the previous commit.
2. Apply a new forward migration that restores the previous UAE-only `submit_booking_request` and `submit_booking_request_ingress` definitions from migrations `20260708_000006` and `20260708_000023`.
3. Restore the previous `booking_ingress_attempts_normalized_phone_check` only after confirming every stored value matches `^9715[0-9]{8}$`.
4. Restore the previous function grants only if the direct anonymous RPC is intentionally required. The safer API ingress path should normally remain in place.

## After any international booking has been accepted

Do not restore an UAE-only constraint and do not rewrite `normalized_phone`. Roll back only the UI/API feature while retaining the broadened E.164 structural constraints and canonical data. A follow-up forward migration must preserve all international rows.

## Safety checks

Before rollback, query counts only:

```sql
select count(*)
from public.booking_requests
where normalized_phone !~ '^9715[0-9]{8}$';

select count(*)
from public.booking_ingress_attempts
where normalized_phone is not null
  and normalized_phone !~ '^9715[0-9]{8}$';
```

A non-zero result blocks restoration of UAE-only constraints. No rollback step may delete or rewrite customer bookings.
