# Supabase RBAC Advisor Checkpoint — 2026-07-30

Status: `REVIEW_READY_PROTECTED_RBAC_DECISION_REQUIRED`

## Scope

Read-only verification of the canonical Supabase project `nmzxrjdxvmmzzmajrskm`, limited to the two previously identified least-privilege candidates:

- `public.get_staff_command_center()`
- `public.get_staff_operations_queue()`

No SQL, migration, Auth configuration, grants, policies, data, secrets, environment variables, Production deployment, publishing, messaging, Analytics, Ads, billing or spend was changed.

## Verified Production contract

Both functions:

- are `SECURITY DEFINER` with fixed `search_path = public, pg_temp`;
- are executable by `authenticated`;
- are not executable by `anon` or `PUBLIC`;
- call `public.is_active_staff(...)` before reading data;
- currently allow `super_admin`, `admin`, `reception`, `coach`, and `content_manager`.

### `get_staff_command_center()` exposure

The response includes aggregated lead metrics and up to 20 priority lead records containing:

- lead ID;
- full name;
- intent/service classification;
- source channel;
- score;
- human-required state;
- next follow-up timestamp.

### `get_staff_operations_queue()` exposure

The response includes up to 250 follow-up jobs and up to 250 background jobs. Returned fields include:

- lead ID and lead name;
- conversation ID;
- attempt number and schedule;
- stop reason;
- job type/status/retry timing;
- raw `last_error` text.

## Application call-path verification

The application API routes resolve a staff session and forward the signed-in access token to these RPCs. The route layer checks authentication but does not narrow roles; authorization is therefore determined by each RPC's staff-role allowlist.

## Advisor snapshot

The current Supabase Security Advisor state remains consistent with the existing Phase 3 boundary:

- the reviewed authenticated `SECURITY DEFINER` functions remain reported as warnings because signed-in users can execute them;
- `pg_net` remains installed in `public`;
- multiple RLS-enabled tables have no policies and are reported as informational notices;
- leaked-password protection remains disabled and requires a protected Auth decision.

These notices must not be bulk-fixed. The exact 23 authenticated privileged-function contracts are already guarded by repository CI, and the booking/anonymous execution boundary remains closed.

## Decision required

A product/RBAC decision is required before changing either function because narrowing the allowlist can remove existing staff workflows.

Recommended least-privilege default:

1. Remove `content_manager` from both functions because both expose lead/customer operational data outside content-production scope.
2. Keep `coach` temporarily until the owner confirms whether coaches must see priority leads, follow-up jobs, conversation identifiers and operational errors.
3. Preserve `super_admin`, `admin`, and `reception`.
4. If coach access is retained, separately reduce raw background-job error exposure to a sanitized status field.

No migration or code change is included in this checkpoint because the coach/content-manager role outcome is materially product-dependent.

## Evidence

- Repository base: `main` commit `2f526ca16cf9cdaf2ab410cb3ae0ba8118f6f3bc`.
- Canonical Supabase project: `nmzxrjdxvmmzzmajrskm`, status `ACTIVE_HEALTHY`.
- Read-only `pg_proc`/privilege query executed on 2026-07-30 Asia/Dubai.
- Application call sites: `src/routes/api.os-command-center.ts` and `src/routes/api.os-operations.ts`.
- Existing invariant: PR #210 / CI #679 and Fresh Supabase Migration Compatibility #26.

## Failure and recovery

No execution failure occurred. No unsafe retry or mutation was attempted.

## Next safe action

After one owner RBAC decision, prepare one isolated Preview/disposable-database compatibility PR that updates the two exact role allowlists and regression assertions. Keep Production SQL and merge protected until CI, role-matrix review and Preview verification pass.
