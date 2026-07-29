# PR #219 Merge and Production Release Gate Plan

Last verified: 2026-07-30 03:03 Asia/Dubai

Status: `PR_219_APPROVED_MERGE_AND_PRODUCTION_MIGRATION_REQUIRE_SEPARATE_RELEASE_GATE`

This document records readiness and execution order only. It does not authorize or claim a merge, Production deployment, or Supabase Production migration.

## Verified branch state

- Repository: `aymanmahrous/swim-fluent-uae`
- Draft PR: #219 `Restrict OS RBAC and sanitize coach errors`
- Head before this documentation commit: `57220971cb15276b3d71c29f483e66fbfa5a5491`
- Base/current `main`: `2f526ca16cf9cdaf2ab410cb3ae0ba8118f6f3bc`
- Compare result: `ahead`, ahead by 7, behind by 0.
- Mergeability: mergeable, no new base divergence or conflict observed.
- Technical approval: `PR_219_TECHNICALLY_APPROVED`.

## Approved scope

- Remove `content_manager` from `get_staff_command_center()`.
- Remove `content_manager` from `get_staff_operations_queue()`.
- Keep `coach` temporarily.
- Preserve `super_admin`, `admin`, and `reception`.
- Return `JOB_FAILED` instead of raw `last_error` to `coach`.
- Preserve existing privileged raw-error visibility for `super_admin`, `admin`, and `reception`.
- Preserve authenticated/service-role execute grants and anonymous denial.

## Merge gate — separate authorization required

1. Re-fetch PR #219 and compare its exact final head to current `main`.
2. Require behind-by `0`, no conflicts, no unreviewed file changes, and all required checks successful.
3. Confirm the final diff is limited to the approved migration, verification contracts, migration-runner compatibility updates, and durable release documentation.
4. Mark ready only under explicit merge authorization.
5. Squash merge using the reviewed exact head SHA.
6. Record merge commit and final CI receipts before opening the Production migration gate.

A merge does not authorize applying the Supabase migration.

## Production migration gate — separate authorization required

Migration: `20260729221600_restrict_os_rbac_sanitize_errors.sql`

Preflight:

1. Confirm the merged `main` contains the exact reviewed migration SHA/content.
2. Confirm current Production definitions and execute grants for both RPCs read-only.
3. Confirm `staff_profiles` role records and RLS remain unchanged; do not mutate Auth, RLS, data, or keys.
4. Re-run Security Advisors and record the pre-application snapshot.
5. Confirm an operator with approved Production access and a defined rollback window.

Application:

1. Apply only the named migration through the approved Supabase migration mechanism.
2. Do not use `db push`, migration repair, manual history editing, or unrelated SQL.
3. Stop immediately on any SQL error; do not partially improvise.

Post-application:

1. Verify function definitions, fixed search paths, and exact execute grants read-only.
2. Execute the runtime role matrix below using approved non-customer test identities or an equivalent transaction-safe role simulation.
3. Re-run the repository SQL verifier against Production read-only.
4. Re-run Security Advisors and compare only relevant findings.
5. Update `PROJECT_HANDOFF.md` and `STRATEGIC_EXECUTION_LEDGER.md` with migration and runtime receipts before claiming Production completion.

## Runtime role matrix after application

### `super_admin`

- `get_staff_command_center()` succeeds.
- `get_staff_operations_queue()` succeeds.
- Existing operational fields remain available.
- Raw `lastError` remains available only where currently authorized.

### `admin`

- Both RPCs succeed.
- Raw `lastError` remains available only where currently authorized.

### `reception`

- Both RPCs succeed.
- Raw `lastError` remains available only where currently authorized.

### `coach`

- Both RPCs succeed.
- A failed background job returns `lastError: "JOB_FAILED"`.
- No original error text, stack text, provider payload, URL, token-like value, SQL text, internal identifier, or secret-bearing substring is returned.

### `content_manager`

- Both RPCs fail with `STAFF_ACCESS_DENIED` / SQLSTATE `42501`.
- No partial payload is returned.

### `authenticated` user without active permitted staff profile

- Both RPCs fail with `STAFF_ACCESS_DENIED` / SQLSTATE `42501`.

### `anon`

- Execute remains unavailable for both RPCs.

### `service_role`

- Execute grant remains present for server-side operational compatibility.

## Rollback plan

Rollback is function-definition only and must not modify data, Auth, RLS, keys, or unrelated grants.

Trigger rollback if any of the following occurs:

- an allowed role cannot access a required RPC;
- `content_manager` still receives data;
- `coach` receives raw `last_error` content;
- anonymous execution becomes available;
- required service-role execution is lost;
- the function returns malformed or incompatible JSON;
- application runtime errors indicate a contract regression.

Rollback sequence:

1. Stop further runtime testing and record the failing role, RPC, response/error, timestamp, and migration receipt.
2. Recreate both functions from the immediately previous Production definitions preserved in:
   - `20260708_000014_add_staff_os_read_models.sql` for `get_staff_command_center()`;
   - `20260708_000015_add_staff_operations_media_read_models.sql` for `get_staff_operations_queue()`.
3. Restore the previous role allowlists exactly: `super_admin`, `admin`, `reception`, `coach`, `content_manager`.
4. Restore the previous operations response field `lastError = j.last_error`.
5. Preserve `SECURITY DEFINER`, fixed `search_path = public, pg_temp`, anonymous denial, and authenticated/service-role execute grants.
6. Run read-only privilege and function-definition verification.
7. Repeat the prior Production baseline smoke checks.
8. Record rollback SQL/hash, operator, timestamp, verification results, and unresolved cause.

Rollback does not erase the migration-history record. Any compensating rollback must be a new, narrowly scoped, approved migration; no manual migration-history repair is allowed.

## Current evidence

- CI #702: `SUCCESS`.
- Booking Phone Foundation #36: `SUCCESS`.
- Fresh Supabase Migration Compatibility #30: `SUCCESS`.
- Full-history disposable execution: `SUCCESS`.
- Stacked Phase A compatibility: `SUCCESS`.
- No Production mutation occurred.

## Protected exclusions

- No merge.
- No Production migration.
- No Supabase Production SQL or data mutation.
- No Auth, RLS, key, secret, environment, or Production deployment change.
- No customer/test booking, messaging, publishing, Analytics, Ads, billing, or spend.

## Next required decision

A future release gate must separately authorize:

1. the exact-head squash merge; and only after its receipts are complete,
2. the named Production migration and runtime role-matrix execution.
