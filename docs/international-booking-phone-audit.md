# International booking phone audit

## Current flow found

- `src/components/public-home.tsx` collected one free-form telephone string and only required it to be non-empty before advancing.
- `src/platform/booking-request.ts` forwarded the raw phone to `/api/booking-request`.
- `src/routes/api.booking-request.ts` proxied the payload directly to the anonymous `submit_booking_request` RPC.
- `submit_booking_request` stripped formatting, removed selected UAE prefixes, always prepended `971`, and accepted only `^9715[0-9]{8}$`.
- `submit_booking_request_ingress` used the normalized phone for advisory locking and phone-based rate limits, but referenced an absent `normalize_uae_phone` helper in the inspected Production schema.
- `booking_ingress_attempts_normalized_phone_check` allowed only UAE mobile canonical values.
- Duplicate active-slot protection uses `normalized_phone`, date, and time. Idempotency uses a unique UUID key.
- Staff booking RPC already returns `normalized_phone`, but the Staff page displayed only the raw `phone` field.
- The customer WhatsApp message uses the booking object's phone display value.

## Scope decision

The implementation keeps UAE as the UI default, validates international numbers with `libphonenumber-js/max` in both the browser and server route, passes only a verified canonical international value into the protected ingress RPC, stores E.164 digits in `normalized_phone`, and preserves all existing booking, scheduling, idempotency, bot, and rate-limit behavior.

The migration is included for review only and has not been applied to Production.
