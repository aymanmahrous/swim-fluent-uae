# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Supersedes: the corrupted 13-line `PROJECT_HANDOFF.md` introduced at `c7c0f118048e13de606576771edddddcc07f0c7a`
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Purpose

This is the current operational continuation source. The complete pre-incident Handoff remains immutable historical evidence at the path above. Current governance records do not delete, rewrite or revalidate that evidence and authorize no runtime or external action.

## Source-of-truth order

1. `AGENT_CONSTITUTION.md` — governance candidate.
2. `docs/governance/PHASE_NAMESPACE.md` — canonical GOV and PRODUCT naming.
3. This Handoff — current operational state.
4. `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md` — write/read paths, environments, approvals, kill switches and rollback.
5. `docs/governance/RISK_OWNERSHIP_MATRIX.md` — accountable role separation.
6. `docs/governance/PR_REGISTRY.md` — PR classifications and dependencies.
7. `docs/governance/DOCUMENT_REGISTRY.md` — document authority.
8. Historical and superseded sources — evidence only; no executable instruction.

When sources conflict, the stricter safety boundary applies.

## Current governance stage

`GOV-C: COMPLETED — READY FOR GOV-D`

GOV-A restored the source of truth. GOV-B classified and organized PR risk. GOV-C inventoried writes and Workflows and documented owners, independent approvers, kill switches and rollback. No merge, product execution, deployment, database/provider connection or Production action is authorized.

## Repository state

- Default branch remains `main`; GOV-C did not modify it.
- Governance branch: `agent/phase-a-source-of-truth`.
- Historical Handoff remains preserved at `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`.
- No historical evidence was deleted.
- No tests, scripts, Workflows, builds, Preview, deployment or external verification ran during GOV-A, GOV-B or GOV-C.

## GOV-B PR organization

The authoritative classification remains in `docs/governance/PR_REGISTRY.md`.

- PR #168: `BLOCKED / OVERLAPPING / SUPERSEDED-CANDIDATE`.
- PR #169: `OVERLAPPING / HISTORICAL-CANDIDATE`; evidence only.
- PR #170: `FROZEN / NON-MERGE-READY`; proposed AI/database scope remains frozen.
- PR #46: blocked by owner, legal, privacy, retention and provider decisions.
- PR #36: blocked by database-foundation dependency and must not merge as-is.
- Historical and superseded PR evidence authorizes no execution.

## GOV-C Write and Workflow Registry

The authoritative registry is `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md`.

Registered domains include:

- public booking ingress and database writes;
- staff booking status operations;
- CRM workflow writes;
- inbox conversation-mode writes;
- content editing and review/schedule transitions;
- Content/media worker queues and `background_jobs` paths;
- Content Brain and AI-provider writes, frozen;
- database migrations, RLS, grants, RPCs, cron and scheduler schema, frozen;
- disposable migration verification definitions, not executed;
- Production write and read-only smoke Workflow definitions, not dispatched;
- AI media workflows, frozen;
- Storage mutation, publishing, scheduling and Meta/provider writes, frozen;
- governance branch commits and GitHub PR metadata operations.

For every operation the registry records Repository, Workflow/API/RPC, read/write classification, target, trigger, allowed environment, role, secret scope, approval, idempotency, audit receipt, rollback, owner, independent approver and status.

## GOV-C Risk Ownership Matrix

The authoritative matrix is `docs/governance/RISK_OWNERSHIP_MATRIX.md`.

Each risk domain has accountable role names for:

- Responsible;
- Independent approver;
- Kill switch owner;
- Rollback owner.

Role names are governance placeholders, not claims that a named individual has accepted responsibility. Protected activation remains blocked until named assignments and enforceable separation of duties are recorded. The author/operator cannot be the sole independent approver.

## Kill switches

- Public booking: disable the affected route/release through an approved deployment or server gate; preserve existing booking records and fail closed for new requests.
- Staff booking/CRM/inbox: disable mutation routes/UI or affected write permissions while retaining safe read access.
- Content editing/transitions: disable mutation and scheduling controls; leave items in the last confirmed state.
- AI Content Brain: keep PR #170 frozen and disable the dedicated AI environment/model secret/feature gate.
- Database migrations: do not dispatch/apply; lock the protected environment or operator access and perform read-only review.
- Media worker/generation: disable worker/cron/environment secret and stop claiming new jobs.
- Publishing/scheduler: disable worker/scheduler and revoke the scoped provider token; reconcile ambiguous receipts.
- Storage: disable the storage write credential or worker and quarantine suspect objects using hashes.
- Production Workflow: disable protected-environment approvals/dispatch access; preserve run history.
- Governance: stop branch commits and revert only through a new auditable commit.

## Rollback procedures

Rollback must be a new auditable action and may not rewrite history or use undocumented direct database correction.

Required evidence includes repository/path, actor, independent approval, environment, target SHA/release, before-state, after-state, request/job/migration/publication IDs, timestamps, logs/receipts, verification and unresolved side effects.

- Booking and staff operations use approved compensating RPC/state transitions and preserve the original receipt.
- Content restoration uses preserved before-state and an approved RPC.
- AI/media rollback stops new requests first, cancels or reconciles provider jobs, then quarantines/removes output only through an approved process.
- Database recovery uses an approved forward-fix/compensating migration or backup/PITR restoration; historical migrations are never edited.
- Publishing rollback stops new publications, resolves remote status, then corrects/unpublishes only with approval.
- Storage rollback uses object hashes/version evidence and approved restore/quarantine actions.
- Governance rollback uses a new commit on the governance branch; no force push, amend or direct `main` change.

## GOV-C frozen-path decisions

### Content Brain / PR #170

PR #170 remains frozen. No migration, AI call, generation, media, publishing, scheduling or Production write is authorized. Later work must separate database and application/AI changes and restart from then-current `main` after GOV-D/E.

### Database migrations

All Production migration activity remains frozen. Future migration-chain testing requires a separate explicit authorization and a disposable environment. Production application requires protected environment approval, target SHA, independent database/security approval, audit receipt and read-only post-check.

### Publishing and media

Publishing, external messaging, AI media, Storage mutation and schedulers remain frozen. Source definitions or historical receipts do not establish live readiness.

## Governance completion evidence

### GOV-A

- Historical Handoff restored; phase naming, Constitution candidate, Document Registry and no-execution receipt established.

### GOV-B

- Open PR surface classified; PR #170 frozen; evidence and functional scopes separated; dependency order recorded.

### GOV-C

- `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md` created.
- `docs/governance/RISK_OWNERSHIP_MATRIX.md` created.
- Booking, CRM, content, staff, AI, migration, Storage, publishing, Production Workflow and governance paths registered.
- Kill switches, rollback procedures, owners and independent approvers documented.
- `docs/governance/GOV_C_READINESS_REPORT.md` records `GOV-C: COMPLETED — READY FOR GOV-D`.
- No PR metadata, `main`, code, Workflow, Supabase, provider, deployment or external account was changed.

## Prohibited actions

- No direct push or modification to `main`.
- No merge, revert, close, relabel, retarget or PR comment action under GOV-C.
- No scripts, Workflows, tests, builds, Preview or deployment.
- No migration, Supabase access, database/Storage write or Production connection.
- No AI-provider access, generation, media, publishing, scheduling, outbound messaging, Ads, billing or spend.
- No secrets, environment variables, external account or domain changes.

## Transition gate

GOV-C is complete on this branch. GOV-D may begin only after a separate explicit instruction and must remain within the newly authorized scope.
