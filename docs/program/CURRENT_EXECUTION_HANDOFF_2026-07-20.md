# Current Execution Handoff — 2026-07-20

## Verified main baseline

- Repository: `aymanmahrous/swim-fluent-uae`
- Latest verified merged commit: `c38e566b8a2a53f5735326a8c631707b11f97d42`
- Merged PR #136: high-intent conversion event coverage.
- Merged PR #137: mobile sticky assessment and WhatsApp conversion bar.

## Active safe work

- Issue #138: Codex read-only performance audit with zero Production risk.
- Codex must use a new branch, open a review PR, and never merge or deploy Production.
- No booking, Supabase, authentication, environment-variable, pricing, workflow, or Production-writing changes are allowed.

## Next execution order

1. Fix the confirmed accessible-name defect for the booking form full-name and phone inputs on Arabic and English routes.
2. Preserve booking behavior and bilingual parity.
3. Require Typecheck, Lint, Build, SEO, sitemap, Production Quality Gate, and existing CI checks before merge.
4. Review Codex performance findings only after independent evidence and no-overlap confirmation.

## Non-overlap rule

- Main execution owns accessibility and conversion correctness.
- Codex owns only the isolated public-route performance audit in Issue #138.
- Neither lane may change booking submission, database code, Production configuration, or external integrations.

## Resume instruction

Read this file, `PROJECT_HANDOFF.md`, `PROJECT_STRATEGY_HANDOFF.md`, and Issue #138. Verify current `main` before changing code. Do not start from zero and do not create parallel systems.

---

## Architecture audit continuation — 2026-07-21

### Locked scope

- Audit and implementation are restricted to `aymanmahrous/swim-fluent-uae`.
- Working branch: `agent/relaxfix-architecture-consolidation`.
- Draft review boundary: PR #152.
- `main` must remain unchanged until the complete audit and required checks are reviewed.
- No repository consolidation, rename, archive, deletion, or cross-project merge is authorized in this lane.

### Verified completed work on PR #152

- Added non-destructive execution and rollback baseline documentation.
- Added current-state inventory for public routes, Staff Portal, AI OS, APIs, cron, and workers.
- Added legacy repository parity documentation without taking destructive action.
- Added route-level `VITE_ENABLE_AI_OS` gating for `/os`.
- Added centralized staff RBAC policy in `src/platform/staff-rbac.ts`.
- Migrated booking status, CRM workflow, content update, content transition, and image generation authorization to centralized permissions.
- Closed the API-level authorization gap in booking status mutation before the RPC call.

### Current verified RBAC permissions

- `booking.status.update`
- `crm.workflow.update`
- `content.item.update`
- `content.item.transition`
- `content.generate`
- `media.generate`

The centralized policy preserves the previous role boundaries and does not broaden access.

### Immediate implementation queue

1. Migrate `src/routes/api.os-media-generate-video.ts` from its local role helper to `media.generate`.
2. Migrate `src/routes/api.os-content-generate.ts` from inline role comparisons to `content.generate`.
3. Search all remaining protected write routes for duplicated role checks or missing explicit API authorization.
4. Verify the resulting head commit status and Vercel checks.
5. Record the complete Phase 1 architecture findings, strengths, weaknesses, risks, and remediation priorities.

### Safety state

- No merge to `main` has occurred.
- No database migration or production write has been executed.
- No cron, worker, publishing, or booking submission has been triggered.
- All current changes remain reviewable and reversible inside Draft PR #152.
