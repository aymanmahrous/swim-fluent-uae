# AI Environment Foundation

Document status: CURRENT-DESIGN
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Activation state

`BLOCKED — DESIGN ONLY`

PR #170 remains frozen. No AI Environment, provider credential, model call, generation, media, spend, Storage write, publishing, or database write is authorized by GOV-G.

## Model allowlist

- Empty by default.
- Addition requires exact provider and exact model identifier.
- No fallback, auto-routing, preview/beta model, image, audio, video, browsing, tool execution, or fine-tuning endpoint without separate approval.
- The first candidate must be text-only, draft-only, non-publishing and isolated from Production writes.

## Token and cost ceilings

- Token ceiling: deny until numeric per-request, per-run and daily ceilings are approved.
- Cost ceiling: zero until numeric per-run and daily ceilings are approved.
- Missing/exceeded ceilings fail closed before provider invocation.

## Required approvals

AI Operations Owner, Independent AI Risk Approver, Repository Owner for exact target SHA/scope, and separate Security approval for secret/environment changes. Author/operator cannot self-approve.

## Required controls

- dedicated disposable AI or `production-ai-spend` environment; no browser credential;
- exact target SHA and registered operation;
- idempotency key, immutable run ID and content fingerprint;
- per-tenant/day/purpose concurrency lock;
- model allowlist, token/cost checks and sensitive-data rejection before call;
- bounded timeout/retries reusing the same idempotency identity;
- no Migration, Production database write, Storage write, media, publishing, scheduling or outbound messaging.

## Kill switch

Owner: AI Operations Owner.

Disable environment approval, credential and feature gate; reject new requests; stop claiming queued jobs. Preserve run IDs, provider receipts, hashes, cost records and unresolved jobs.

## Rollback

Treat output as an unapproved draft. Stop new calls first, mark/cancel the run through an audited path, reconcile provider jobs, and quarantine/remove draft output only with hashes and approval. Never publish as rollback.

## Audit receipt

Repository, target SHA, environment, actor, approver, exact model, token/cost ceilings and actuals, idempotency key, lock key, run UUID, content fingerprint, timestamps, input/output hashes, provider request/job ID, result, kill-switch state and unresolved side effects.
