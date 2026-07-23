# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Current governance stage

`GOV-F: COMPLETED — READY FOR GOV-G`

GOV-A through GOV-E established source truth, PR classification, operation ownership, GitHub enforcement design and normalized CI. GOV-F reduced the active risk surface on this governance branch only. No Workflow, script, test, build, audit, browser, migration, deployment or external system was run.

## GOV-F improvements

- Reviewed all dependencies and devDependencies statically; no package or lockfile was changed without executed evidence.
- Added `docs/governance/DEPENDENCY_REVIEW_GOV_F.md`.
- Archived four active Production-write/AI-spend Workflow definitions and removed them from `.github/workflows/` on this branch.
- Preserved their exact blob SHAs and recovery requirements in `docs/history/GOV_F_ARCHIVED_PRODUCTION_WRITE_WORKFLOWS.md`.
- Added deny-by-default browser runtime write rules to `WRITE_AND_WORKFLOW_REGISTRY.md`.
- Added `PRODUCTION_HOST_ALLOWLIST.md` and `SECRETS_SCOPE_MAP.md`.
- Kept migrations, AI, media generation, Storage mutation, publishing, scheduling and Production writes frozen or blocked.

## Archived active Workflows

- `production-booking-smoke.yml`;
- `ai-media-e2e.yml`;
- `ai-media-current-production-e2e.yml`;
- `ai-media-live-fallback.yml`.

They created Production records, temporary staff/media, provider jobs or commit statuses and therefore did not satisfy GOV-F's active Production read-only requirement. Historical evidence remains recoverable from Git and recorded blob SHAs. Reintroduction requires a new isolated protected PR and separate explicit authorization.

## Active Production workflow boundary

`production-smoke-readonly.yml` is the only active Production verification definition retained. It is limited to public page/header reads, is bound to `production-readonly`, and declares no Production write credential. It was not dispatched.

Disposable migration and Preview workflows remain isolated and were not run. Production-write and AI-spend paths have no active Workflow definition on this branch.

## Browser runtime prohibited paths

Browser/client code may not perform direct table POST/PATCH/PUT/DELETE, hold service-role/database/provider/publishing/webhook secrets, administer migrations/RLS/grants/cron/workers, mutate elevated Storage, call AI using protected credentials, publish, schedule, send messages, or invoke an unregistered RPC.

Named server-mediated booking and staff RPC paths remain classified but are not authorized for execution by GOV-F.

## Production host allowlist

Only the following hosts are approved for HTTPS GET/HEAD verification:

- `www.relaxfixuae.com`;
- `relaxfixuae.com`.

The former Vercel deployment URL, Supabase hosts/Edge Functions/Storage, AI providers, Meta/publishing providers, webhooks and admin endpoints are excluded. No host is approved for a write method.

## Secrets scope map

- `preview-readonly` and `production-readonly` may not contain service-role, database, AI, Storage-write, publishing or webhook credentials.
- Disposable credentials are limited to isolated/local migration tests and remain blocked from execution.
- Write-capable database credentials belong only to a future protected `production-write` environment.
- AI provider keys belong only to `production-ai-spend` and remain frozen.
- No secret value is recorded in governance files; actual GitHub secret inventories were not queried.

## PR and risk state

PR #170 remains frozen, PR #36 remains blocked by database foundation, PR #46 remains blocked by privacy/legal decisions, and PR #169 remains evidence only. No PR metadata was changed.

## Verification limitation

Dependency usage, secret absence and Workflow behavior were reviewed statically. The normalized supply-chain job and checks were not run. Rulesets, required checks, CODEOWNERS enforcement and Environments are not active on `main`.

## Safety boundary

Do not modify `main`, change PR metadata/settings/secrets, run Workflows/scripts/tests/builds, deploy, connect to Production/Supabase/providers, execute migrations, generate, publish, schedule, message or spend.

## Transition gate

GOV-F is complete on this branch. GOV-G may begin only after a separate explicit instruction.