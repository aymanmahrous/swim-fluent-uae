# Phase 3 Activation Gate

Document status: CURRENT
Authority: EXECUTION GATE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

`PHASE-3-SAFE-EXECUTION` does not start automatically. A separate explicit order is mandatory after GOV-H. Any missing, ambiguous, expired or unverified item causes `FAIL-CLOSED`.

## Required target

- exact 40-character commit SHA;
- repository and branch named explicitly;
- operation exactly matching `WRITE_AND_WORKFLOW_REGISTRY.md`;
- fixed scope, maximum duration and expiry;
- no mutable tag, implicit latest version or broad branch range.

## Required approvals

- Repository Owner;
- named Responsible/Operator;
- named Independent approver who is not author or operator;
- Security approval for Environment or credential scope;
- domain approval where applicable: Release, Database, AI Risk, Privacy, Content or Operations.

Role placeholders alone do not pass. Repository access and separation of duties must be verified.

## Required checks

Successful observed contexts on the exact target SHA, according to scope:

- `verify:source`;
- `verify:ci`;
- `verify:release`;
- `test:unit`;
- `test:security`;
- `test:contracts`;
- `test:e2e:preview` for Preview;
- `verify:production-readonly` only for a separately approved read-only Production check.

`test:integration:disposable` belongs only to a separate database-only authorization and cannot authorize a Migration inside Phase 3. Historical, skipped or stale checks fail.

## Required environment

The first eligible candidate must use source-only or `preview-readonly`. A separately approved read-only website check may use `production-readonly`.

Requirements:

- exact allowlisted host;
- no Production-write credential;
- no service role, database password, AI key, Storage-write token, publishing token or webhook secret;
- protected approval and no self-approval;
- expiry and disable procedure recorded;
- no Production data mutation.

## Kill switch

Record the named owner and immediate stop: disable Environment approval, revoke a narrowly scoped credential, disable route/feature, cancel run, or block requests. Preserve run/provider receipts and fail closed.

## Rollback

Record rollback owner, before-state, compensating action, evidence and verification. Git rollback uses a new commit. Migrations use a separately approved forward-fix/restore plan and are not eligible under this activation gate. AI, Storage and publishing recovery plans do not authorize those frozen operations.

## Audit receipt

Record repository, branch, SHA, Registry operation, requester, operator, approver, Environment, host, start/expiry/completion, exact check contexts, idempotency/lock IDs, input/output hashes, run/request IDs, kill-switch state, rollback result, PASS/FAIL and unresolved side effects. Never record secret values.

## PASS conditions

Every control is present and verified; the operation is Registry-listed, time-bound and read-only or otherwise explicitly allowed by the safe-execution contract; checks succeeded on the exact SHA; approvals are independent; host and Environment are approved; kill switch and rollback are ready; and no prohibited credential or action exists.

## FAIL conditions

Any missing control; Production write; Migration; PR #170 combined scope; AI without exact approved provider/model/token/cost values; media generation; Storage write; publishing/scheduling/messaging; browser protected credential; unregistered action; failed/skipped/stale check; mismatched SHA; self-approval; non-allowlisted host; expired authorization; or ambiguous rollback.

FAIL permits no partial execution, automatic fallback or automatic retry.