# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Supersedes: the corrupted 13-line `PROJECT_HANDOFF.md` introduced at `c7c0f118048e13de606576771edddddcc07f0c7a`
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Purpose

This is the current operational continuation source. Historical evidence remains immutable and non-executable. No governance stage authorizes runtime, external, database, provider or Production action without a later explicit approval.

## Source-of-truth order

1. `AGENT_CONSTITUTION.md`.
2. `docs/governance/PHASE_NAMESPACE.md`.
3. This Handoff.
4. `docs/governance/GITHUB_RULESETS_DESIGN.md`.
5. `docs/governance/GITHUB_ENVIRONMENTS_DESIGN.md`.
6. `.github/CODEOWNERS`.
7. `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md`.
8. `docs/governance/RISK_OWNERSHIP_MATRIX.md`.
9. `docs/governance/PR_REGISTRY.md`.
10. Historical and superseded sources — evidence only.

## Current governance stage

`GOV-D: COMPLETED — READY FOR GOV-E`

GOV-A restored the source of truth, GOV-B organized PR risk, GOV-C inventoried sensitive operations and ownership, and GOV-D prepared branch-only GitHub enforcement designs. Rulesets, Branch Protection, Code Owner enforcement and Environments are not claimed as active on `main`.

## Repository and PR state

- `main` was not modified.
- Governance branch: `agent/phase-a-source-of-truth`.
- Historical Handoff remains preserved at `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`.
- PR #168 remains blocked/overlapping.
- PR #169 remains evidence only.
- PR #170 remains frozen and non-merge-ready.
- PR #46 remains blocked by privacy/legal/owner decisions.
- PR #36 remains blocked by its database-foundation dependency.
- No tests, scripts, Workflows, builds, Preview, deployment or external verification ran during GOV-A through GOV-D.

## GOV-C operation boundary

The authoritative inventory remains `WRITE_AND_WORKFLOW_REGISTRY.md`. Public booking, staff booking, CRM, inbox, content, worker, AI, migration, Storage, publishing, Production Workflow and governance paths are classified there. AI, migrations, media generation, publishing, scheduling, Storage mutation, secrets and Production writes remain frozen or blocked.

## GOV-D CODEOWNERS design

`.github/CODEOWNERS` covers:

- `.github/workflows/**`;
- `supabase/migrations/**`;
- auth, AI and booking source paths;
- `scripts/verify-*`;
- `docs/privacy/**`;
- `AGENT_CONSTITUTION.md`;
- `PROJECT_HANDOFF.md`;
- governance files.

`@aymanmahrous` is the Responsible candidate and `@pixelreel2026` is the known independent-review candidate. Their access and Code Owner eligibility must be verified before merge or activation. This branch file does not enforce review on `main`.

## GOV-D Rulesets design

The proposed `main` ruleset requires:

- PR-only changes;
- independent approvals, with two approvals for the highest-risk domains;
- Code Owner review;
- stale-approval dismissal;
- approval after the last push;
- conversation resolution;
- stable required checks;
- blocked force-push and branch deletion;
- tightly restricted emergency bypass;
- merge commits preserving PR and audit history.

GOV-E must normalize CI and establish stable required-check names before actual settings enforcement.

## GOV-D Environments design

Four isolated designs are documented:

- `preview-readonly`;
- `production-readonly`;
- `production-write`;
- `production-ai-spend`.

Each specifies secret scope, triggers, independent approvals, kill switch and rollback. Read-only environments cannot contain write-capable credentials. Production write and AI spend cannot use PR, push or schedule triggers and remain inactive.

## Kill switches and rollback

GOV-C remains authoritative for operation-level kill switches. GOV-D adds settings-level stops: disable Environment approval, revoke narrowly scoped credentials, block dispatch, disable worker/scheduler/provider gates, cancel pending deployment and preserve settings/run receipts. Database recovery uses forward fixes or approved restoration; Git history is never rewritten.

## Frozen-path decisions

- PR #170 remains frozen; no AI provider call, generation, Migration, media, publishing, scheduling or Production write is authorized.
- Database migration application remains frozen. Disposable testing requires separate authorization.
- Publishing, Meta/provider writes, Storage mutation and schedulers remain frozen.
- Existing workflow definitions were not dispatched or changed.

## Governance completion evidence

### GOV-A

- Historical Handoff restored and source-of-truth governance established.

### GOV-B

- PR surface classified; PR #170 frozen; dependency order recorded.

### GOV-C

- Write/workflow registry, ownership matrix, kill switches and rollback requirements completed.

### GOV-D

- `.github/CODEOWNERS` added on the governance branch.
- `GITHUB_RULESETS_DESIGN.md` created.
- `GITHUB_ENVIRONMENTS_DESIGN.md` created.
- `GOV_D_READINESS_REPORT.md` records `GOV-D: COMPLETED — READY FOR GOV-E`.
- No repository settings, PR metadata, `main`, Workflow, deployment, secret, database, provider or external account was changed.

## Prohibited actions

- No direct push or modification to `main`.
- No repository-settings activation under this branch-only stage.
- No merge, revert, PR state or metadata changes.
- No scripts, Workflows, tests, builds, Preview or deployment.
- No Migration, Supabase access, database/Storage write or Production connection.
- No AI provider, generation, media, publishing, scheduling, messaging, Ads, billing or spend.
- No secrets, environment variables, external account or domain changes.

## Transition gate

GOV-D is complete as an enforcement design stage. GOV-E may begin only after a separate explicit instruction. Actual Ruleset, Branch Protection, CODEOWNERS enforcement and Environment activation require a separate settings authorization and evidence receipt.