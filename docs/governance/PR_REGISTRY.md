# Pull Request Registry

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner

## Classification model

- `ACTIVE`: the single current candidate in its risk domain.
- `BLOCKED`: cannot advance because a named dependency or approval is missing.
- `STALE`: based on an obsolete baseline and requires recreation or full revalidation.
- `SUPERSEDED`: replaced by a newer source or PR.
- `HISTORICAL`: evidence only.
- `FROZEN`: intentionally prevented from advancing until later governance gates close.
- `OVERLAPPING`: duplicates or conflicts with another scope.

These classifications exist only in governance documents on branch `agent/phase-a-source-of-truth`. They do not alter PR state, labels, comments, reviewers, base branches, or mergeability.

## Open PR inventory

| PR | Scope type | Risk domain | GOV-B classification | Merge readiness | Governance decision |
|---|---|---|---|---|---|
| #168 — Constitution | Governance/documentation | Governance source of truth | `BLOCKED / OVERLAPPING / SUPERSEDED-CANDIDATE` | `NON-MERGE-READY` | Its old phase model and Handoff scope overlap the completed GOV-A branch. Preserve its evidence; reconcile useful content into the current governance source before any later closure decision. |
| #169 — Vercel Production and Preview evidence | Evidence only | Deployment evidence | `OVERLAPPING / HISTORICAL-CANDIDATE` | `NON-MERGE-READY` | Deployment receipts may be preserved as dated evidence, but this PR must not be treated as a product phase or deployment authorization. |
| #170 — Content Brain safety | Functional AI plus database migration | AI, database, cost, content generation | `FROZEN` | `NON-MERGE-READY` | It combines a migration with provider-facing feature preparation and targets a non-main prerequisite branch. No merge, migration, provider call, generation, or rebase is authorized. Future work must split database foundation from application/AI behavior. |
| #46 — Privacy and consent copy | Documentation and protected decisions | Privacy/legal/consent | `BLOCKED` | Owner/legal review required | Remains Draft evidence. It cannot authorize publication, routes, consent UI, Analytics, data collection, or legal-compliance claims. |
| #36 — International booking phone cutover | Functional application cutover | Booking ingress and phone handling | `BLOCKED / DEPENDENCY` | `NON-MERGE-READY` | Depends on predecessor PR #37 and disposable migration verification, approval, application of the foundation, and read-only post-verification before a recreated or synchronized cutover PR can advance. |

## Historical and superseded evidence

- Merged documentation, security, Quality, SEO, and operational PRs recorded in the restored Handoff are `HISTORICAL` evidence.
- PRs #51, #28, and #49 remain `SUPERSEDED` evidence.
- Historical PR evidence does not occupy an active risk slot and does not authorize execution.

## One-PR-per-risk-domain rule

- Governance source of truth: this GOV branch is the sole active governance candidate; PR #168 is overlapping and blocked.
- Deployment evidence: no active implementation PR; PR #169 is evidence only.
- AI/content generation: no active candidate; PR #170 is frozen.
- Privacy/legal: PR #46 is blocked and cannot be accompanied by an implementation PR until decisions close.
- International booking cutover: PR #36 is blocked; no parallel cutover PR may proceed.

## Dependency order

### Governance sequence

1. GOV-B records classifications and dependencies.
2. GOV-C establishes Write/Workflow Registry and accountable owners/approvers.
3. GOV-D verifies Rulesets, Branch Protection, CODEOWNERS, and separate Environments.
4. GOV-E normalizes CI and verification levels.
5. GOV-F reduces duplicated workflows, broad secrets, stale scripts, and runtime-write surface.
6. Only after those gates may a product-readiness decision be made.

### Content Brain sequence

1. Keep PR #170 frozen.
2. Review the proposed database migration as an isolated database scope in a future PR; do not apply it.
3. Later verify its migration chain only in an approved disposable environment.
4. Establish the dedicated AI Environment, model allowlist, token/cost ceiling, kill switch, idempotency, concurrency lock, and audit receipt.
5. Create a separate text-only application PR from the then-current `main`.
6. Media, publishing, scheduling, and Production writes remain excluded.

### International phone sequence

1. Review predecessor #37 independently.
2. Later test its migration chain only in a disposable environment under a separate authorization.
3. Obtain approval before any merge or application.
4. Perform read-only post-foundation verification.
5. Recreate or synchronize the application cutover from current `main`.
6. Legacy RPC retirement, if needed, belongs in a later isolated PR.

## Evidence versus functional separation

- PR #169 is evidence only.
- PRs #168 and #46 are governance/documentation with unresolved approvals.
- PRs #170 and #36 are functional high-risk scopes.
- Evidence receipts cannot authorize functional changes, and historical verification cannot substitute for current checks.

## Safety receipt

No PR was closed, relabeled, commented on, converted, merged, rebased, or otherwise modified. No script, Workflow, test, build, Preview, deployment, migration, Supabase connection, AI-provider connection, generation, media, publishing, scheduling, or Production operation was performed.