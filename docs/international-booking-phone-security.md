# International booking phone security boundary

- The browser is not trusted as the only validator.
- `/api/booking-request` validates the selected country and phone with full libphonenumber metadata.
- The API sends the canonical international display value to `submit_booking_request_ingress` through the existing server-only Supabase secret-key client.
- The API derives a SHA-256 request fingerprint without logging the full phone number.
- Honeypot and form-elapsed checks remain active.
- Phone and fingerprint advisory locks remain active.
- Phone-based rate limits use canonical E.164 digits.
- Idempotency remains UUID based.
- Active-slot duplicate protection remains based on canonical `normalized_phone`, date, and time.
- Anonymous table access is not added. Direct anonymous execution of the inner booking RPC is removed by the review migration.
- RLS is not disabled or widened.
- No customer data is included in tests.
