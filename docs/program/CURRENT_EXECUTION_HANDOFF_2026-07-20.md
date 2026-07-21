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
- Removed public navigation links to `/os` and `/admin` while retaining authenticated Staff Portal navigation to AI OS.
- Added centralized staff RBAC policy in `src/platform/staff-rbac.ts`.
- Migrated booking status, CRM workflow, content update, content transition, content generation, image generation, video generation, media-copy generation, video-job listing, and automation-status authorization to centralized permissions.
- Closed the API-level authorization gap in booking status mutation before the RPC call.
- Preserved the previous role sets exactly: `super_admin`, `admin`, and `content_manager` retain content/media/automation access; no other role gained access.
- Added `tests/staff-rbac.test.ts` to lock the complete five-role, seven-permission matrix.
- Added the safe `test:rbac` package command and made it a required CI step.
- Added `docs/architecture/PHASE_1_ARCHITECTURE_FINDINGS.md` with strengths, weaknesses, risks, and remediation priorities.
- Added `docs/architecture/MODULE_OWNERSHIP_BOUNDARIES.md` defining public, Staff, AI OS, shared server, worker, cron, and database ownership rules.

### Current verified RBAC permissions

- `booking.status.update`
- `crm.workflow.update`
- `content.item.update`
- `content.item.transition`
- `content.generate`
- `media.generate`
- `automation.status.read`

The centralized policy preserves the previous role boundaries and does not broaden access.

### RBAC consolidation audit result

- `src/platform/staff-rbac.ts` remains the single auditable role-to-permission map.
- `src/routes/api.os-media-generate-video.ts` uses `media.generate` for both POST and GET authorization.
- `src/routes/api.os-content-generate.ts` uses `content.generate` instead of three duplicated direct role comparisons.
- `src/routes/api.os-media-copy.ts` uses `media.generate` instead of a local `allowedRole` helper.
- `src/routes/api.os-media-video-jobs.ts` uses `media.generate` instead of a local `allowedRole` helper.
- `src/routes/api.os-automation-status.ts` uses `automation.status.read` instead of a local `allowedRole` helper.
- Existing centralized checks in booking, CRM, content update/transition, and image generation remain unchanged.
- The remaining direct role expression in `src/routes/staff.tsx` only disables the booking-status selector for UX. The protected API remains authoritative through `booking.status.update`; this client-side expression is not treated as a security boundary.

### Verification state

- GitHub Actions CI run `29839908940` completed successfully on the initial RBAC-test head.
- On the public-discoverability head, Typecheck, RBAC tests, Lint, Build, SEO, sitemap, and the earlier contract checks passed.
- CI run `29840796412` failed only because `verify-content-automation-scheduler.mjs` still expected the removed local role array.
- The contract verifier was updated to require `hasStaffPermission` and `automation.status.read`, and to forbid reintroducing the local role array.
- A fresh CI run is required on the current documentation-and-contract head.
- `test:e2e:ai-media` was not run because it can invoke external/provider and persistence behavior and remains outside the no-production-write/no-external-action boundary.
- No migration, seed, cron, worker, preview, publishing action, production secret access, or database write was performed.

### Immediate implementation queue

1. Confirm CI on the current head after the scheduler-contract alignment.
2. Add a read-only architecture boundary verification that prevents public-shell links/imports from reappearing.
3. Complete legacy repository and deployment parity before any archive/delete decision.
4. Review Vercel status separately; Vercel build-rate-limit failures are not code-validation failures.
5. Keep PR #152 as Draft until the full architecture review is complete.

### Safety state

- No merge to `main` has occurred.
- No database migration or production write has been executed.
- No cron, worker, publishing, Preview, or booking submission has been triggered.
- All current changes remain reviewable and reversible inside Draft PR #152.

---

## Security execution continuation — 2026-07-21

### Verified merged security phases

- PR #156 merged authentication-domain separation for AI OS, Cron, internal workers, and GitHub Actions OIDC routes.
- Merge commit: `6b9a7d36f70ff2864babf215c946f3e20f6ba8e1`.
- PR #157 merged centralized RBAC enforcement for mutating AI OS routes.
- Added `conversation.mode.update` and protected `PATCH /api/os-inbox`.
- Merge commit: `b178a0b4928c3bdb9af4637ea4105aebfa7fea25`.

### Current phase — API mutation input contracts

- Working branch: `agent/api-mutation-input-contract`.
- Review boundary: PR #158.
- Added `scripts/verify-api-mutation-input-contracts.mjs` as a read-only source verifier.
- CI now discovers POST, PUT, PATCH, and DELETE API handlers that read JSON bodies.
- These routes must handle malformed JSON, perform runtime schema validation, and preserve an explicit invalid-input contract.
- `src/routes/api.staff-password-request.ts` now uses a bounded Zod email schema.
- `src/routes/api.staff-password-reset.ts` now uses a bounded Zod password schema.
- `src/routes/api.password-recovery.ts` preserves account-enumeration resistance through the documented `ENUMERATION_SAFE_INVALID_INPUT` exception and generic response.
- Mutation-input failure diagnostics are uploaded as a CI artifact when this contract fails.

### Current verification state

- CI run `29860767997` passed Typecheck, Staff RBAC, architecture boundaries, privileged authentication boundaries, mutation RBAC, mutation input contracts, Lint, Build, and all existing read-only contract checks.
- Final CI must be reconfirmed after this Handoff update before PR #158 is merged.

### Next security phase after merge

1. Audit rate limiting and abuse controls for public authentication, password recovery, booking, and AI/provider endpoints.
2. Add a read-only CI contract for endpoints that require rate limiting.
3. Do not call endpoints or use Production secrets while implementing the contract.

### Persistent safety constraints

- Work only in `aymanmahrous/swim-fluent-uae`.
- Do not run Preview or deployments.
- Do not run migrations, seeds, Cron jobs, Workers, publishing, or external provider actions.
- Do not use Production secrets.
- Do not perform database or Production writes.
- Update this Handoff after every completed phase so continuation never starts from zero.
