# GitHub Environments Design

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Truth boundary

These are proposed Environments only. GOV-D does not create them, add secrets, dispatch workflows, approve deployments, or connect to Production.

| Environment | Secret scope | Allowed triggers | Required approvals | Kill switch | Rollback |
|---|---|---|---|---|---|
| `preview-readonly` | Browser-safe public identifiers and isolated Preview-only read credentials; no service-role, DB password, provider, publishing or write token | PR only after source checks | 1 independent reviewer; Code Owner approval for sensitive paths | Disable Environment or branch deployment policy; cancel pending Preview | Redeploy last approved Preview SHA or delete isolated Preview; retain receipt |
| `production-readonly` | Minimum-scope read-only verification credentials; no RPC/table mutation capability | Manual only from exact protected `main` SHA | Release Verification Owner + Independent Release Reviewer | Disable approvals and revoke read-only verification token | Stop run, revoke/rotate credential if needed, preserve no-write logs and verification receipt |
| `production-write` | Operation-specific Supabase/service credentials separated by booking, migration, storage or publishing purpose; never browser-exposed | Manual `workflow_dispatch` only from exact protected `main` SHA | Domain Responsible + Independent Security/Database/Operations Approver + Release Owner | Disable Environment, revoke scoped secret, disable mutation route/worker/scheduler | Use domain rollback plan; verify DB/external before-and-after state and audit receipt |
| `production-ai-spend` | AI provider token, explicit model allowlist, token/cost ceiling and request policy only; no publishing or broad database secret | Manual only; never PR, push or schedule | AI Operations Owner + Independent AI Risk Approver + Repository Owner | Disable Environment, revoke provider token, set AI feature gate/worker off | Stop requests/jobs, preserve request/provider receipts, reconcile spend, revert application SHA if needed |

## Shared rules

1. Environment secrets are isolated and never copied wholesale.
2. Read-only Environments cannot contain write-capable credentials.
3. Write and AI-spend Environments require named reviewers and disallow self-approval.
4. Protected branch policy permits only exact `main` or separately approved release tags.
5. Production migration, publishing, storage mutation and AI spend remain distinct approvals even when one workflow references more than one service.
6. Every protected run records actor, approvers, SHA, environment, reason, target, start/end time, receipts, spend or row impact, and rollback owner.
7. Schedules cannot target `production-write` or `production-ai-spend` without a later explicit governance exception.

## Frozen paths

PR #170, AI media generation, database migration application, publishing, scheduling, storage writes and Production booking writes remain frozen. This design does not activate any existing workflow definition.
