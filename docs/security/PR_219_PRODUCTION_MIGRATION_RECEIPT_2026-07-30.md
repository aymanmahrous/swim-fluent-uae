# PR #219 Production Migration Receipt

Last verified: 2026-07-30 10:57 Asia/Dubai

Status: `PR_219_PRODUCTION_MIGRATION_APPLIED_RUNTIME_VERIFIED`

## Authorization and scope

The owner authorized the separate Production Migration gate after PR #219 was merged. This receipt covers only the approved OS RBAC migration and read-only verification.

Explicit exclusions preserved:

- no Auth change
- no RLS or policy change
- no application-data mutation
- no key or environment change
- no Production deployment
- no publishing, messaging, Analytics, Ads, billing or spend

## Repository and merge evidence

- PR #219: merged.
- Reviewed head: `e21c1ef98b634186a62b61acbaa5f64479de0be2`.
- Squash merge: `866327f82f24e1f300aa7cf134b727fd6e0ec9a1`.
- Final pre-merge checks: CI #710 success; Fresh Supabase Migration Compatibility #38 success; Booking Phone Foundation #44 success.

## Production migration

- Canonical Supabase project: `nmzxrjdxvmmzzmajrskm`.
- Project state before application: `ACTIVE_HEALTHY`, PostgreSQL 17, `eu-west-1`.
- Repository migration source: `supabase/migrations/20260729221600_restrict_os_rbac_sanitize_errors.sql`.
- Applied migration record: `20260730065949_restrict_os_rbac_sanitize_errors`.
- Application result: success.

## Post-application definition and privilege verification

Both functions retain:

- `SECURITY DEFINER`
- fixed `search_path = public, pg_temp`
- execute for `authenticated` and `service_role`
- no execute for `anon`

Verified behavior:

- `content_manager` is absent from both role allowlists.
- `get_staff_operations_queue()` contains the coach sanitizer constant `JOB_FAILED`.
- `get_staff_command_center()` and `get_staff_operations_queue()` preserve the expected response contracts.

## Runtime verification

The Production environment currently has one active `super_admin` staff identity and no active `admin`, `reception`, `coach`, or `content_manager` staff identities. There were no current `background_jobs.last_error` values.

Runtime checks completed without creating or changing records:

- active `super_admin` successfully executed both RPCs;
- command-center response contained `metrics` and `priorityQueue`;
- operations response contained `followUps` and `backgroundJobs`;
- a non-staff authenticated identity was denied by both RPCs with SQLSTATE `42501`;
- `anon` denial and `service_role` compatibility were verified through exact function privileges;
- absent-role behavior and coach sanitization were verified from the deployed function definitions and repository disposable-database test matrix.

Result: `RUNTIME_SUPER_ADMIN_AND_NONSTAFF_DENIAL_PASS`.

## Security Advisor comparison

Security Advisors were run before and after application. The existing broader informational and warning baseline remained. No migration-specific new finding or permission regression was observed. Existing authenticated `SECURITY DEFINER` warnings remain the reviewed intentional staff-RPC model and broader function-by-function Phase 3 work; they were not bulk-modified.

## Rollback outcome

Rollback was not required. The migration, grants, response contracts and executable runtime checks passed.

## Final state

`PR_219_PRODUCTION_MIGRATION_APPLIED_RUNTIME_VERIFIED`

The OS RBAC change is applied to Supabase Production. This does not claim a Vercel Production deployment, application release, Auth/RLS change or data mutation.