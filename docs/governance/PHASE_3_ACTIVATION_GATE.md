# Phase 3 Activation Gate

Document status: CURRENT
Authority: EXECUTION GATE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

`PHASE-3-SAFE-EXECUTION` does not start automatically. A separate explicit order is mandatory after PHASE-3-PREP. Any missing, ambiguous, expired or unverified item causes `FAIL-CLOSED`.

## Eligible registered operations

Only these literal Registry operations are eligible for the first safe-execution attempt:

1. `source-only-verification`
2. `preview-readonly-verification`

Their full controls are authoritative in `WRITE_AND_WORKFLOW_REGISTRY.md`. `ALLOWED-FOR-PHASE-3` means eligibility only, not execution authorization.

## Required target

- exact 40-character commit SHA;
- repository and branch named explicitly;
- one operation exactly matching an eligible name above;
- fixed scope, maximum duration and expiry;
- no mutable tag, implicit latest version or broad branch range.

## Required approvals

- Repository Owner;
- named Responsible/Operator;
- named Independent approver who is not author or operator;
- Security approval for Environment or credential scope;
- Release approval for Preview URL and environment evidence.

Role placeholders alone do not pass. Access and separation of duties must be verified.

## Required checks

For `source-only-verification`, successful observed contexts on the exact SHA:

- `verify:source`;
- `verify:ci`;
- `verify:release`;
- `test:unit`;
- `test:security`;
- `test:contracts`.

For `preview-readonly-verification`, all source checks plus `test:e2e:preview`. `verify:production-readonly` and `test:integration:disposable` are outside these two operations and require separate authorization. Historical, skipped or stale checks fail.

## Required environment

- `source-only-verification`: isolated runner or GitHub Actions with repository read scope only;
- `preview-readonly-verification`: `preview-readonly` and one exact approved HTTPS Preview URL;
- no Production-write credential, service role, database password, AI key, Storage-write token, publishing token, webhook secret or messaging credential;
- protected approval, no self-approval, expiry and disable procedure recorded;
- no Production or Preview data mutation.

## Kill switch

Use the Registry method: cancel run, disable dispatch/runner or Environment approval, revoke scoped read token, preserve receipts and fail closed.

## Rollback

No remote state change is permitted. Stop verification and discard transient browser state/artifacts as allowed. Git rollback uses a new auditable branch commit. Migrations, AI, Storage and publishing remain ineligible.

## Audit receipt

Record repository, branch, SHA, literal Registry operation, requester, operator, approver, Environment, exact URL when applicable, start/expiry/completion, check contexts and run IDs, configuration/input hashes, idempotency/concurrency identities, kill-switch state, rollback result, PASS/FAIL and unresolved effects. Never record secret values.

## PASS conditions

Every control is present and verified; the exact Registry row is `ALLOWED-FOR-PHASE-3`; checks succeed on the exact SHA; approvals are independent; URL and Environment are approved; secrets scope is read-only; kill switch and rollback are ready; and a separate time-bounded order authorizes the single operation.

## FAIL conditions

Any missing control; operation mismatch; unavailable dispatch/runner; missing Preview URL; Production write; Migration; PR #170 scope; AI/media; Storage write; publishing/scheduling/messaging; protected browser credential; failed/skipped/stale check; mismatched SHA; self-approval; non-approved host; expired authorization; or ambiguous rollback.

FAIL permits no partial execution, fallback or automatic retry.
