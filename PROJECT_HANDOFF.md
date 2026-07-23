# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Supersedes: the corrupted 13-line `PROJECT_HANDOFF.md` introduced at `c7c0f118048e13de606576771edddddcc07f0c7a`
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Purpose

This is the current operational continuation source for `aymanmahrous/swim-fluent-uae`. The complete pre-incident Handoff has been restored byte-for-byte on this branch at `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`; it remains immutable historical evidence. This file records the current governance state without deleting or rewriting that evidence.

## Source-of-truth order

1. `AGENT_CONSTITUTION.md` — governance candidate for later review and merge.
2. `docs/governance/PHASE_NAMESPACE.md` — canonical governance and product phase naming.
3. This `PROJECT_HANDOFF.md` — current operational state.
4. `docs/governance/DOCUMENT_REGISTRY.md` — document status and authority registry.
5. Historical and superseded documents — evidence only; they authorize no action.

When sources conflict, the stricter safety boundary applies and the conflict remains blocked until explicitly resolved.

## Current governance stage

`GOV-A: COMPLETED — READY FOR GOV-B`

GOV-A established the source of truth only. It did not authorize GOV-B execution, merge, deployment, database work, provider connectivity, or any Production action.

## Unified phase model

Governance stages use `GOV-A` through `GOV-H`.

Product scopes use descriptive identifiers and must never be called only “Phase 3”:

- `PRODUCT-SEO-READINESS`
- `PRODUCT-CONTENT-BRAIN-VALIDATION`
- `PRODUCT-BOOKING-INTERNATIONAL-PHONE`
- `PRODUCT-PRIVACY-CONSENT-ANALYTICS`
- `PRODUCT-PUBLISHING-READINESS`

## Repository state reviewed for GOV-A

- Default branch remains `main`; this branch does not modify `main`.
- Branch used for GOV-A: `agent/phase-a-source-of-truth`.
- Base reviewed: `c7c0f118048e13de606576771edddddcc07f0c7a`.
- The base commit replaced the full Handoff with PowerShell instructions. The full prior Handoff from blob `a6738cacb029c9cd03be32c10bdcefaa520837b8` is preserved in the historical path named above.
- No prior historical evidence was deleted.

## Pull-request synchronization

### PR #168 — Constitution

Classification: `BLOCKED`

Reason: governance-only candidate requiring later independent factual review and a separate merge decision. Its phase naming is superseded on this branch by `docs/governance/PHASE_NAMESPACE.md` where bare phase numbers were ambiguous.

### PR #169 — Vercel evidence

Classification: `OVERLAPPING`

Reason: evidence scope overlaps the governance baseline and must not be treated as a product implementation phase. Its verified evidence may be reconciled later without authorizing deployment.

### PR #170 — Content Brain validation

Classification: `FROZEN`

Reason: it contains future AI and migration preparation and is outside GOV-A. It must use the identifier `PRODUCT-CONTENT-BRAIN-VALIDATION`. No provider call, migration, Production write, media generation, or publishing is authorized.

## Historical evidence retained

The restored full Handoff preserves prior repository, Production, Quality, Privacy, SEO, content, Command Center, safety, blocker, and evidence records as they existed before `c7c0f118`. Any section in that historical file titled `NEXT_REQUIRED_ACTION`, `Next required action`, or equivalent is historical evidence only and is not executable. Current action authority exists only in this file and the current Constitution/registry.

## Document handling rule

- `CURRENT`: authoritative now.
- `DRAFT`: proposed, not authoritative.
- `BLOCKED`: incomplete because a dependency or approval is missing.
- `HISTORICAL`: retained evidence only; no executable next action.
- `SUPERSEDED`: replaced by a named source; no executable next action.

Documents without a classification header are classified through `docs/governance/DOCUMENT_REGISTRY.md` until a later isolated documentation pass adds headers individually.

## GOV-A completion evidence

- Complete historical Handoff restored inside this branch.
- Current Handoff rebuilt non-destructively.
- Phase identifiers unified.
- Constitution candidate present.
- Document Registry present and synchronized.
- PR #168, #169, and #170 classifications recorded.
- No-execution receipt present.
- No operational instruction from a historical or superseded document is authoritative.

## Prohibited actions

- No direct push or modification to `main`.
- No Merge or Revert.
- No scripts, Workflows, tests, builds, Preview, or deployment.
- No Migration, Supabase access, database write, Storage write, or Production connection.
- No AI-provider access, generation, media, publishing, scheduling, outbound messaging, Ads, billing, or spend.
- No secrets, environment variables, external account, or domain changes.

## Transition gate

GOV-A is complete as a documentation-governance stage on this branch. GOV-B may begin only after an explicit separate instruction and must remain isolated from product execution.