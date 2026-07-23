# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner

## Current stage

`PHASE-3-DISPATCH-SETUP: COMPLETED — READY FOR EXECUTION`

This certifies dispatch preparation only. No Check, Workflow, script, test, build, Preview, deployment, Migration, Supabase/provider or Production connection was run.

## Authorized source-only dispatch

`.github/workflows/phase-3-source-only-dispatch.yml` defines manual `workflow_dispatch` for `source-only-verification` only.

It requires an exact 40-character SHA equal to the selected `agent/phase-a-source-of-truth` commit, uses `contents: read`, disables persisted checkout credentials, references no secret or Environment and exposes only:

- `verify:source`;
- `verify:ci`;
- `verify:release`;
- `test:unit`;
- `test:security`;
- `test:contracts`.

Concurrency is limited to one run per target SHA. Cancellation is the kill switch.

## Safety boundary

The dispatch definition contains no Production, Supabase/database, AI, Storage-write, publishing, scheduling, webhook or messaging credential or step. `preview-readonly-verification`, `verify:production-readonly` and disposable migration checks remain outside this mechanism.

## Activation gate

`PHASE_3_ACTIVATION_GATE.md` now names the Workflow as the authorized dispatch mechanism. A future execution still requires a new target SHA, named Operator and independent approver, time limit, successful exact-SHA receipts and a separate explicit order. If branch dispatch is unavailable, use only an independently approved isolated runner with identical commands; otherwise fail closed.

## Continuing prohibitions

PR #170 remains frozen. PR #36 and PR #46 remain blocked. Production/database writes, Migrations, AI/media, Storage mutation, publishing, scheduling, Meta/provider writes, webhooks, messaging, archived Production-write/AI Workflows, settings and PR metadata changes remain blocked.

## Next transition

Do not start `PHASE-3-SAFE-EXECUTION` automatically. A separate explicit instruction must select one registered operation and satisfy every Activation Gate control.
