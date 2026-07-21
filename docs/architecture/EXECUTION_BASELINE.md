# Relax Fix UAE Architecture Execution Baseline

This document establishes the safety boundary for consolidating the Relax Fix UAE public website and Command Center.

## Non-destructive execution rules

- Work only on `agent/relaxfix-architecture-consolidation` until reviewed.
- Do not run production database migrations, seeds, cron jobs, workers, or outbound publishing.
- Do not use production secrets in previews or tests.
- Do not delete or archive legacy repositories until feature, deployment, and data-flow parity are documented.
- Do not rename the production repository until deployment integrations and redirects are mapped.
- Open changes as a draft pull request; do not merge automatically.

## Target architecture

- One production repository for the Relax Fix UAE public website and internal Command Center.
- Clear route and module boundaries between public and staff-only areas.
- AI OS protected by a route-level feature gate, staff authentication, and server-side role-based access control.
- Legacy Admin disabled only after every required capability has an approved replacement.
- External writes and publishing disabled by default in non-production environments.

## Completed safe changes

- Added an explicit route-level `VITE_ENABLE_AI_OS` gate to `/os`.
- Preserved Supabase Auth, active `staff_profiles` validation, secure HttpOnly cookies, and independent API session checks.
- Added `src/platform/staff-rbac.ts` as the initial auditable permission map.
- Migrated booking-status, CRM-workflow, content-update, and content-transition writes to centralized server-side RBAC without broadening existing access.
- Added an explicit server-side role rejection to booking status updates instead of relying only on disabled UI controls and downstream RPC policy.

## Remaining sequence

1. Continue auditing and migrating the remaining AI OS write endpoints into the centralized permission map.
2. Remove public discoverability of internal surfaces while retaining secure Staff Portal navigation.
3. Confirm legacy repository feature, deployment, and data-flow parity before archive/delete decisions.
4. Verify Vercel projects, GitHub Actions, webhooks, documentation, and developer remotes before renaming the retained repository.
5. Keep the pull request in Draft until all checks are green and an explicit merge decision is made.
