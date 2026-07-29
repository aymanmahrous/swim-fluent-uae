# Supabase Privileged Function and Booking Ingress Audit

Date: 2026-07-29 (Asia/Dubai)

Project: `nmzxrjdxvmmzzmajrskm`

Status: `READ_ONLY_AUDIT_COMPLETE_REMEDIATION_NOT_APPLIED`

## Scope and safety

This was a read-only authorization audit of `SECURITY DEFINER` functions, execute grants and the public booking path. No SQL, migration, policy, key, Auth setting, Production data or deployment was changed.

## Executive result

| Classification | Count | Meaning |
|---|---:|---|
| `AUTH_GUARD_PRESENT` | 23 | Authenticated-executable functions contain an explicit `is_active_staff`, `auth.uid()` or equivalent media authorization guard |
| `INTERNAL_ONLY` | 25 | No execute grant to `PUBLIC`, `anon` or `authenticated`; service/internal path only |
| `PUBLIC_OR_ANON_REVIEW` | 2 | Public or anonymous execute exists and needs an intentionality review |
| **Total** | **50** | All observed `SECURITY DEFINER` functions classified |

The broad advisor warning count therefore overstates the immediate risk: 48 of 50 functions are either explicitly guarded or not publicly executable. Two findings remain actionable.

## Finding 1 — public booking can bypass the hardened ingress

Priority: `HIGH_PRIORITY_DESIGN_GAP`

Evidence:

- `supabase/migrations/20260708_000023_harden_public_booking_ingress.sql` defines `submit_booking_request_ingress(...)` with fingerprint checks, honeypot validation, elapsed-time validation, advisory locks and database-backed rate limits.
- That migration revokes execute from `PUBLIC`, `anon` and `authenticated`, granting it only to `service_role`.
- `src/routes/api.booking-request.ts` does not call this hardened ingress. It sends public Supabase headers to `/rest/v1/rpc/submit_booking_request`.
- `submit_booking_request(...)` remains executable by `anon` in the live authorization snapshot.
- `scripts/verify-abuse-control-boundaries.mjs` verifies only that the process-local limiter runs before a string containing `submit_booking_request`; it does not require use of the service-only ingress.

Impact:

An external caller can address the public Supabase REST RPC directly and bypass the application proxy's process-local limiter as well as the newer database-backed fingerprint, honeypot and elapsed-time controls. The core booking validation still applies, but the intended anti-abuse boundary is not enforced on every public path.

Required remediation design:

1. Make the server route call `submit_booking_request_ingress(...)` using a server-only service credential and server-derived fingerprint.
2. Pass and validate honeypot and elapsed-time fields without trusting client-supplied fingerprint material.
3. Revoke execute on the direct `submit_booking_request(...)` function from `PUBLIC`, `anon` and `authenticated`; retain only the minimum internal role needed by the ingress.
4. Strengthen the verification script to require the ingress RPC and fail if the direct public RPC appears in the route.
5. Add Preview/local contract tests for valid, duplicate, bot, rate-limited and direct-RPC-denied cases.
6. Apply the migration only through the protected Supabase approval path, with rollback SQL and post-change advisor/permission checks.

Do not switch the route before its required server-only secret is configured in the approved environment. Doing so out of order would break booking.

## Finding 2 — trigger function has unnecessary execute grants

Priority: `HARDENING_REQUIRED`

Evidence:

- `public.enqueue_content_media_after_insert()` is a `SECURITY DEFINER` trigger function.
- The live snapshot shows execute granted to `PUBLIC`, `anon`, `authenticated` and `service_role`.
- `supabase/migrations/20260710_000027_content_media_worker_queue.sql` creates the trigger function but omits the explicit revoke used for the worker RPC functions later in the same migration.

Impact:

A trigger function is not normally invoked as an ordinary RPC, which lowers direct exploitability, but the grants are unnecessary and violate least privilege.

Required remediation design:

- Add an isolated migration revoking execute from `PUBLIC`, `anon` and `authenticated` on `public.enqueue_content_media_after_insert()`.
- Preserve the trigger itself and verify inserts still enqueue exactly once.
- Re-run function grants, tests and Supabase advisors after the protected migration.

## Baseline retained

- Security advisor: 61 items (`33 INFO`, `28 WARN`).
- Performance advisor: 15 items.
- All listed public tables had RLS enabled.
- `33` RLS-enabled/no-policy notices require access-model review; they are not automatically defects because denial by default may be intentional.
- Leaked-password protection is disabled and one extension-in-public warning remains for separate review.
- No bulk-fix action is authorized.

## Safe execution order

1. Review this audit PR independently from content and PWA work.
2. Prepare a separate Preview-first code-and-migration PR for Finding 1, including secret/config dependency checks and rollback.
3. Prepare the trigger-grant revoke either in the same tightly related security PR or a smaller follow-up migration, depending on review risk.
4. Run repository validation, booking contracts and migration lint locally/CI.
5. Obtain explicit protected approval before applying any migration or changing Production environment variables.
6. Verify live execute grants, advisor output and booking behavior after the approved deployment.

Final truthful state:

`SUPABASE_SECURITY_DEFINER_AUDIT_50_OF_50_CLASSIFIED_BOOKING_INGRESS_BYPASS_AND_TRIGGER_GRANT_REMEDIATION_PENDING_PRODUCTION_UNCHANGED`
