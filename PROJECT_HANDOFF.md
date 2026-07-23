# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Supersedes: the corrupted 13-line `PROJECT_HANDOFF.md` introduced at `c7c0f118048e13de606576771edddddcc07f0c7a`
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Purpose

This is the current operational continuation source for `aymanmahrous/swim-fluent-uae`. The complete pre-incident Handoff is preserved byte-for-byte at `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md` as immutable historical evidence. This file records the current governance state without deleting, rewriting, or revalidating that evidence.

## Source-of-truth order

1. `AGENT_CONSTITUTION.md` — governance candidate for later review and merge.
2. `docs/governance/PHASE_NAMESPACE.md` — canonical governance and product naming.
3. This `PROJECT_HANDOFF.md` — current operational state.
4. `docs/governance/PR_REGISTRY.md` — current PR classifications and dependencies.
5. `docs/governance/DOCUMENT_REGISTRY.md` — document status and authority.
6. Historical and superseded sources — evidence only; they authorize no action.

When sources conflict, the stricter safety boundary applies and the conflict remains blocked until explicitly resolved.

## Current governance stage

`GOV-B: COMPLETED — READY FOR GOV-C`

GOV-A restored the source of truth. GOV-B classified and organized the PR surface. Neither stage authorizes merge, product work, deployment, database activity, provider connectivity, or Production action.

## Unified phase model

Governance stages use `GOV-A` through `GOV-H`.

Product scopes use descriptive identifiers and must never be called only “Phase 3”:

- `PRODUCT-SEO-READINESS`
- `PRODUCT-CONTENT-BRAIN-VALIDATION`
- `PRODUCT-BOOKING-INTERNATIONAL-PHONE`
- `PRODUCT-PRIVACY-CONSENT-ANALYTICS`
- `PRODUCT-PUBLISHING-READINESS`

## Repository state preserved from GOV-A

- Default branch remains `main`; this branch does not modify `main`.
- Governance branch: `agent/phase-a-source-of-truth`.
- Reviewed base: `c7c0f118048e13de606576771edddddcc07f0c7a`.
- That base replaced the full Handoff with PowerShell instructions.
- The complete prior Handoff from blob `a6738cacb029c9cd03be32c10bdcefaa520837b8` remains preserved at the historical path above.
- No historical evidence was deleted.

## GOV-B pull-request organization

The authoritative classification is in `docs/governance/PR_REGISTRY.md`.

### PR #168 — Constitution

Classification: `BLOCKED / OVERLAPPING / SUPERSEDED-CANDIDATE`

- It is an older governance candidate based on the former numeric phase model.
- Its Constitution and Handoff scope overlap the completed GOV-A branch.
- Useful historical evidence may be reconciled later.
- It is not merge-ready and was not modified by GOV-B.

### PR #169 — Vercel evidence

Classification: `OVERLAPPING / HISTORICAL-CANDIDATE`

- It contains dated Production and Preview evidence.
- Evidence may be preserved without treating the PR as a product phase.
- It does not authorize deployment, promotion, environment changes, or Production action.
- It is non-merge-ready and was not modified by GOV-B.

### PR #170 — Content Brain validation

Classification: `FROZEN / NON-MERGE-READY`

- It combines a proposed Supabase migration with provider-facing application preparation.
- It targets `feat/phase2-pulse`, not current `main`.
- Its source describes proposed idempotency, concurrency, daily limits, text-only generation, token limits, and no publishing, but those contracts were not executed or reverified in GOV-B.
- No merge, migration, provider call, generation, media job, publishing job, scheduling, rebase, or Production write is authorized.
- Future work must separate the database foundation from application/AI behavior and restart from the then-current baseline after later governance gates.

### PR #46 — Privacy and consent copy

Classification: `BLOCKED`

- It is documentation-only and remains pending owner, legal, provider, retention, minors/guardian, sensitive-data, and privacy-process decisions.
- It cannot authorize publication, legal-compliance claims, routes, Consent UI, Analytics, cookies, data collection, or Production tracking.

### PR #36 — International booking phone cutover

Classification: `BLOCKED / DEPENDENCY / NON-MERGE-READY`

- It depends on predecessor PR #37 and a database foundation that must be reviewed separately.
- Any migration-chain verification belongs to a future explicitly authorized disposable environment.
- Foundation approval/application and read-only post-verification must precede an application cutover.
- The cutover must later be recreated or synchronized from current `main`.

## Historical and superseded PR evidence

- Merged documentation, security, Quality, SEO, and operational PRs in the restored Handoff remain `HISTORICAL` evidence.
- PRs #51, #28, and #49 remain `SUPERSEDED` evidence.
- Historical and superseded PRs do not occupy active risk slots and authorize no new execution.

## One-PR-per-risk-domain decision

- Governance source of truth: this GOV branch only; PR #168 is overlapping and blocked.
- Deployment evidence: no active implementation PR; PR #169 is evidence only.
- AI/content generation: no active candidate; PR #170 is frozen.
- Privacy/legal: PR #46 remains blocked and cannot be paired with an implementation PR before decisions close.
- International booking cutover: PR #36 remains blocked; no parallel cutover PR may advance.

## Dependency order

### Governance sequence

1. GOV-B classification and dependency recording — completed.
2. GOV-C Write/Workflow Registry and accountable owners/approvers.
3. GOV-D Rulesets, Branch Protection, CODEOWNERS, and separate Environments.
4. GOV-E CI normalization and verification-level separation.
5. GOV-F reduction of duplicate workflows, broad secrets, stale scripts, and runtime-write surface.
6. A later product-readiness decision only after those gates close.

### Content Brain sequence

1. Keep PR #170 frozen.
2. Review the proposed migration later as an isolated database PR; do not apply it.
3. Test its migration chain only in an explicitly authorized disposable environment.
4. Establish the dedicated AI Environment, model allowlist, token/cost ceiling, kill switch, idempotency, concurrency lock, and audit receipt.
5. Create a separate text-only application PR from then-current `main`.
6. Keep media, publishing, scheduling, and Production writes excluded.

### International phone sequence

1. Review predecessor #37 independently.
2. Test its migration chain only in an explicitly authorized disposable environment.
3. Obtain separate approval before merge or application.
4. Perform read-only post-foundation verification.
5. Recreate or synchronize the application cutover from current `main`.
6. Put any legacy RPC retirement in a later isolated PR.

## Evidence versus functional separation

- PR #169 is evidence only.
- PRs #168 and #46 are governance/documentation with unresolved approvals.
- PRs #170 and #36 are functional high-risk scopes.
- Evidence receipts cannot authorize functional changes.
- Historical verification cannot substitute for current required checks.

## Historical evidence handling

The restored full Handoff preserves prior repository, Production, Quality, Privacy, SEO, content, Command Center, safety, blocker, and evidence records as they existed before `c7c0f118`.

Any heading or text named `NEXT_REQUIRED_ACTION`, `Next required action`, `Resume instruction`, or equivalent inside that historical file is evidence only and is not executable. Current action authority exists only in this Handoff and the current governance registries.

## Document handling rule

- `CURRENT`: authoritative now.
- `DRAFT`: proposed and not authoritative.
- `BLOCKED`: incomplete because a dependency or approval is missing.
- `HISTORICAL`: retained evidence only; no executable next action.
- `SUPERSEDED`: replaced by a named source; no executable next action.

Documents without an inline header are governed by `docs/governance/DOCUMENT_REGISTRY.md`.

## Governance completion evidence

### GOV-A

- Complete historical Handoff restored inside this branch.
- Current Handoff rebuilt non-destructively.
- Phase identifiers unified.
- Constitution candidate and Document Registry synchronized.
- No-execution receipt recorded.

### GOV-B

- Every open PR inventoried and classified.
- PR #170 formally frozen in governance documentation.
- PR #168, #169, #46, and #36 classified with explicit blockers.
- Evidence and functional scopes separated.
- One-PR-per-risk-domain and dependency rules documented.
- `docs/governance/PR_REGISTRY.md` and `docs/governance/GOV_B_READINESS_REPORT.md` added.
- No actual PR state was changed.

## Prohibited actions

- No direct push or modification to `main`.
- No merge, revert, close, relabel, retarget, or comment action on PRs under this stage.
- No scripts, Workflows, tests, builds, Preview, or deployment.
- No migration, Supabase access, database write, Storage write, or Production connection.
- No AI-provider access, generation, media, publishing, scheduling, outbound messaging, Ads, billing, or spend.
- No secrets, environment variables, external account, or domain changes.

## Transition gate

GOV-B is complete as a documentation-governance stage on this branch. GOV-C may begin only after a separate explicit instruction and must remain isolated from product execution.