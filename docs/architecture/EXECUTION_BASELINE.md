# Relax Fix UAE — Architecture Consolidation Execution Baseline

## Objective

Consolidate the Relax Fix UAE public website, secure Staff Portal, and AI OS / Command Center into one auditable production platform without destructive cutover.

## Non-destructive rules

- Work only on `agent/relaxfix-architecture-consolidation` until review.
- Keep `main` unchanged until the draft PR is validated and explicitly approved.
- Do not run or apply production migrations, seeds, cron routes, workers, publishing actions, booking submissions, or outbound messaging.
- Do not read, copy, rotate, or alter production secret values through this branch.
- Do not rename, archive, or delete repositories before dependency and deployment parity checks are complete.
- Preserve existing public URLs and production behavior unless a reviewed change explicitly documents otherwise.

## Target architecture

- Public Site: localized public pages and booking experience.
- Staff Portal: Supabase Auth-backed staff entry, session management, and role-aware operations.
- AI OS: internal Command Center available only when its feature flag is enabled and an active Staff session is verified.
- Server APIs: session and role verification at every protected boundary.
- Legacy Admin: retired compatibility route only; no browser-password administration.
- Background execution: internal/cron/worker routes isolated from routine Preview and manual testing.

## Ordered execution

1. Inventory existing routes, APIs, data sources, feature flags, authentication, cron, workers, and publishing surfaces.
2. Enforce AI OS availability at its route boundary, not only through a navigation link.
3. Keep Staff Portal as the secure operational entry point.
4. Centralize RBAC policy while preserving current allowed-role behavior endpoint by endpoint.
5. Remove public discoverability of internal tools only after validating staff navigation and bookmarks.
6. Keep the retired legacy route during compatibility review, then remove it in a separate reversible change.
7. Compare legacy repositories and deployment integrations before archive/delete decisions.
8. Rename the repository only after Vercel, GitHub Actions, webhooks, documentation, and developer remotes are checked.

## Completed in PR #152

- Created a protected implementation branch and Draft PR.
- Added the current-state architecture inventory.
- Confirmed that `/admin` is already a retired compatibility route rather than a functioning browser-password dashboard.
- Added a route-level `VITE_ENABLE_AI_OS` gate to `/os`.
- Prevented `/os` from querying the Staff session endpoint while AI OS is disabled.
- Kept the existing Supabase Staff session and RBAC verification intact.

## Validation state

No manual Preview, local tests, cron, workers, migrations, publishing, or production writes were executed. GitHub/Vercel status reported one successful deployment check after the AI OS route-gate commit, with another deployment status pending at the time of inspection.

## Rollback

The production branch remains unchanged. All implementation commits can be abandoned by closing Draft PR #152; no production database or external-system rollback is required for the current changes.
