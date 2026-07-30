# Master Baseline and Critical Risk Discovery

Last verified: 2026-07-30 11:55 Asia/Dubai

Status: `MASTER_BASELINE_REVIEW_READY_FOR_MANAGER_DECISION`

## Authorized scope

This document closes the single authorized stage `MASTER_BASELINE_AND_CRITICAL_RISK_DISCOVERY`.

Completed:

- latest `main` review;
- important open PR review;
- Handoff and Strategic Execution Ledger review;
- stale-record and contradiction discovery;
- Critical/High risk classification;
- unified baseline and next-stage recommendation.

Not authorized or performed:

- no Merge;
- no Production Promotion;
- no Supabase/Auth/RLS/data/key/environment mutation;
- no deletion;
- no broad remediation;
- no publishing, messaging, Analytics, Ads, billing or spend.

## Canonical latest main

- Repository: `aymanmahrous/swim-fluent-uae`.
- Branch: `main`.
- Exact head: `dc2273b9a2685b79f5c26054e556066beab4f900`.
- Commit: `Correct PR 219 Production receipt deployment note`.
- Both Vercel status contexts for this head are successful.
- The commit is documentation-only and corrects the PR #219 Production receipt to acknowledge the normal Vercel documentation deployment while preserving that no application-code release, Auth/RLS/data/key/environment change occurred.

## Important PR baseline

### PR #213 — PWA installability

- State: open, Draft, not merged.
- Head: `7b479f60089f70c269b7122110a49bba4f20455a`.
- Compare to current `main`: diverged; ahead 6, behind 7.
- Current changed scope: PWA manifest/icons/offline/service worker/registration verifier/CI plus the owner-attested device receipt.
- Device decision: `PWA_DEVICE_GATE_OWNER_ATTESTED_PASS_DOCUMENTATION_RISK_ACCEPTED`.
- Evidence level: `OWNER_ATTESTATION_ONLY_NO_SCREENSHOT_RECEIPT`.
- Vercel contexts on the receipt head are successful.
- GitHub Actions CI is not yet recorded for the new receipt head.
- Merge/Production remain unauthorized.

### PR #218 — Supabase RBAC advisor checkpoint

- State: open, Draft, not merged.
- Head: `2ec4cba12079f21b5d28acc95f9c4fe1c692a789`.
- Compare to current `main`: diverged; ahead 1, behind 3.
- Scope is one documentation file only.
- Its decision premise is stale because PR #219 has since been merged and the approved Production migration applied and verified.
- Recommendation: close as superseded after preserving any unique non-stale findings; do not merge as-is.

### PR #36 — international booking phone Phase B

- State: open, Draft, not merged, non-mergeable.
- Head: `8fa814167bcb9c6a6b33b27d7b7acdabdb9ca500`.
- Compare to current `main`: diverged; ahead 48, behind 325.
- It touches current booking, API, Staff UI, SEO and CI surfaces.
- Existing PR body already marks it `BLOCKED — DO NOT MERGE`.
- Recommendation: never rebase/merge as-is; later recover the still-approved business requirement into a new isolated current-main implementation after a separate manager decision.

## Handoff baseline

`PROJECT_HANDOFF.md` is authoritative in principle but internally stale at its tail.

Accurate durable elements include:

- repository/platform map and protected-boundary rules;
- Revenue-First order;
- booking-ingress Production closure;
- content/Privacy/SEO/publishing gates;
- prohibition on unsupported completion claims.

Stale or conflicting elements include:

- section `PR #219 release-gate readiness` still states PR #219 is Draft, unmerged and its Production migration unapplied;
- the current truth is that PR #219 was squash merged at `866327f82f24e1f300aa7cf134b727fd6e0ec9a1` and migration `20260730065949_restrict_os_rbac_sanitize_errors` was applied and runtime-verified;
- the PWA tail still describes Android as evidence-unverified and requires screenshots, while the owner has now explicitly accepted the residual documentation risk and conditionally passed the device gate by attestation;
- the listed latest Production deployment section predates newer documentation-only deployments;
- the approved execution order is strategic but does not yet reflect closure of the PR #219 gate.

Classification: `AUTHORITATIVE_DOCUMENT_WITH_STALE_OPERATIONAL_TAIL`.

## Strategic Execution Ledger baseline

The ledger structure and canonical platform map remain useful, but current phase rows are stale:

- Phase 3 is still `REVIEW_READY` and claims PR #219 is Draft; current truth is the isolated PR #219 migration is Production-applied and verified, though broader Phase 3 security work remains open;
- Phase 4 still uses `REVIEW_READY_ANDROID_EVIDENCE_UNVERIFIED`; manager-approved truth is conditional device PASS by owner attestation with accepted documentation risk, while current-main compatibility and CI are pending;
- checkpoints describing PR #219 as waiting for merge/Production approval are superseded;
- direct-main documentation receipts after PR #219 are not reflected in the phase register.

Classification: `LEDGER_SCHEMA_VALID_CURRENT_STATE_STALE`.

## Conflicts and stale records

1. PR #219 readiness records conflict with completed merge and Production migration receipts.
2. PWA screenshot requirement conflicts with the manager-approved owner-attestation risk acceptance.
3. PR #218 duplicates a decision that PR #219 already resolved.
4. PR #36 is 325 commits behind `main` and overlaps security-sensitive booking surfaces.
5. Handoff and Ledger are not synchronized with the newest durable receipts on `main`.
6. Direct documentation commits to `main` bypass the ledger's stated `no direct main mutation` operating rule, even though the individual changes were safe and evidence-backed.
7. Latest-main GitHub Actions evidence is absent because the two receipt commits were direct documentation commits; only Vercel status contexts are present.

## Critical findings

### C-01 — PR #36 unsafe integration risk

Severity: `CRITICAL`.

PR #36 is 325 commits behind current `main`, non-mergeable, and changes booking ingress, public booking UI, Staff UI, SEO contracts and CI. Attempting to merge or force-rebase it could overwrite newer security and booking hardening.

Required control: keep Draft and blocked; no merge, rebase, force update or Production action. Recover requirements later into a new current-main branch only.

### C-02 — Canonical operational truth is contradictory

Severity: `CRITICAL` for governance/release control.

Handoff and Ledger currently direct future agents toward already-completed PR #219 gates and an obsolete PWA screenshot gate. An agent relying only on them could repeat a Production migration, attempt an unnecessary rollback, or block/incorrectly approve PWA work.

Required control: next stage should be a narrow truth-synchronization stage on current `main`, reviewed through a Draft PR; no application change.

## High findings

### H-01 — PR #213 current-main compatibility unverified

The PWA branch is behind by 7 commits. Device gate is conditionally accepted, but current-main conflict resolution, fresh CI, exact-head Preview, private-cache boundary and rollback verification remain required before merge consideration.

### H-02 — PR #218 is superseded but still open

Its stale decision framing can confuse future work and duplicate Phase 3 security actions.

### H-03 — Ledger phase status misrepresents Production state

Phase 3 and Phase 4 status rows no longer match verified receipts, weakening reporting accuracy and next-action routing.

### H-04 — Governance path drift

Recent receipt documents were committed directly to `main`, while the Ledger says GitHub changes should avoid direct-main mutation. This is not a product incident, but it creates process inconsistency and missing normal PR CI evidence.

### H-05 — Broader Supabase advisor warnings remain open

PR #219 solved only the approved two-function scope. Existing authenticated `SECURITY DEFINER` warnings, leaked-password-protection decision and other advisor findings remain independent work; they must not be bulk-revoked or treated as closed.

## Unified master baseline

- `main` head is healthy at `dc2273b9a2685b79f5c26054e556066beab4f900`; both Vercel contexts succeed.
- PR #219 scope is merged, Production-migrated and runtime-verified; rollback not required.
- PR #213 device gate is conditionally passed by owner attestation only; technical current-main review is incomplete.
- PR #218 is superseded by PR #219 outcomes.
- PR #36 is critically stale and blocked.
- Handoff and Ledger remain canonical-format documents but their latest operational state is stale and contradictory.
- No current evidence authorizes PWA merge, Production promotion, broad security remediation, International Phone rollout, publishing, Analytics activation or Ads.

## Manager decision required

Approve or reject the proposed next stage:

`CANONICAL_TRUTH_SYNCHRONIZATION_AND_STALE_PR_DISPOSITION`

Recommended scope:

1. update `PROJECT_HANDOFF.md` and `STRATEGIC_EXECUTION_LEDGER.md` from current `main` with exact PR #219 and PWA attestation truth;
2. preserve strategy and protected boundaries;
3. close PR #218 as superseded after checking for unique findings;
4. keep PR #36 Draft/blocked and record it as rebuild-from-current-main-only;
5. create no application-code change;
6. stop before PR #213 rebase, Merge or Production Promotion.

## Final stage status

`MASTER_BASELINE_REVIEW_READY_FOR_MANAGER_DECISION`
