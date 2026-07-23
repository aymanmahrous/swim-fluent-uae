# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Current stage

`PHASE-3-PREP: COMPLETED — READY FOR SAFE EXECUTION`

Equivalent activation wording: `PHASE-3-PREP: COMPLETED — READY FOR EXECUTION`.

This certifies preparation only. No Check, Workflow, script, test, build, Preview, deployment, Migration, Supabase/provider or Production connection was run. `PHASE-3-SAFE-EXECUTION` still requires a new explicit order and a complete PASS gate.

## Registered Phase 3 operations

`WRITE_AND_WORKFLOW_REGISTRY.md` now contains the literal operations:

1. `source-only-verification` — read-only source/test/build verification on an exact SHA.
2. `preview-readonly-verification` — read-only GET/HEAD browser verification against one approved HTTPS Preview URL and exact SHA.

Both rows include Repository, classification, environment, approvals, checks, secrets scope, kill switch, rollback, audit receipt, idempotency, concurrency and status `ALLOWED-FOR-PHASE-3`.

`ALLOWED-FOR-PHASE-3` is eligibility for a future activation review only; it does not dispatch or authorize execution.

## Activation gate

`PHASE_3_ACTIVATION_GATE.md` now recognizes only those two operations for the first safe-execution attempt.

- `source-only-verification` requires successful `verify:source`, `verify:ci`, `verify:release`, `test:unit`, `test:security` and `test:contracts` on the exact target SHA.
- `preview-readonly-verification` additionally requires `test:e2e:preview`, an exact approved HTTPS Preview URL and verified `preview-readonly` secret inventory.
- Named Operator and independent approver are mandatory.
- A usable authorized dispatch mechanism or isolated runner is mandatory.
- `verify:production-readonly` and `test:integration:disposable` remain outside these two operations and need separate authorization.
- Any missing control returns `FAIL-CLOSED`.

## Continuing prohibitions

PR #170 remains frozen. PR #36 and PR #46 remain blocked. Production/database writes, Migrations, AI/media, Storage mutation, publishing, scheduling, Meta/provider writes, webhooks, messaging, protected browser credentials, archived Production-write/AI Workflows, repository settings and PR metadata changes remain blocked.

## Safety receipt

PHASE-3-PREP changed governance Markdown only on `agent/phase-a-source-of-truth`. It did not touch `main`, run checks or Workflows, create a Preview, deploy, connect to Supabase/Production/providers, generate, publish, schedule, migrate or mutate external state.

## Next transition

Do not begin `PHASE-3-SAFE-EXECUTION` automatically. A new explicit instruction must select one literal operation, provide an exact new target SHA and satisfy every Activation Gate control.
