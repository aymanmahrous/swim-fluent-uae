# Write and Workflow Registry

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Governing rules

Browser code is deny-by-default for writes. No direct table write, protected credential, Storage mutation, publication, messaging, Migration or deployment action may originate in the browser. Only named server-enforced operations may be considered, and GOV-G authorizes no execution.

No step may enter `PHASE-3-SAFE-EXECUTION` unless listed here with owner, approver, environment, idempotency, concurrency, audit, kill switch and rollback.

## Migration separation rule

- Every future Migration must be a database-only PR.
- A Feature PR may not contain `supabase/migrations/**`, DDL, RLS, grants, policies, cron, workers, schema changes or migration runners.
- A Migration PR may not contain UI, Feature, AI/provider, media, publishing, Storage or unrelated application changes.
- PR #170 remains frozen because it combines Migration and AI/application scope.
- Migration verification is disposable-only until separate Production authorization.
- Historical migrations are immutable; recovery uses forward-fix/compensating migration or approved restore.

## Registered paths and controls

| Path | Target | Status | Idempotency requirement | Concurrency lock |
|---|---|---|---|---|
| Public booking ingress / `submit_booking_request` | Database | Current product path; no GOV-G call | client/server idempotency key + normalized booking fingerprint | one accepted request per key/fingerprint window |
| `update_booking_request_status` | Database | BLOCKED | booking + intended status + request identity | one transition per booking |
| `update_staff_lead_workflow` | Database | BLOCKED | lead + intended workflow state + request identity | one mutation per lead |
| `set_staff_conversation_mode` | Database | BLOCKED | conversation + intended mode + request identity | one mutation per conversation |
| `update_staff_content_item` | Database | BLOCKED | item + expected version/hash + request identity | optimistic version and one mutation per item |
| `transition_staff_content_item` | Database/scheduling | BLOCKED; publishing excluded | item + from/to state + content fingerprint | one transition per item; scheduler lock if later approved |
| Content/media worker queue | Database/Storage/provider | BLOCKED | job UUID + content fingerprint + attempt identity | claim/lease lock; one active worker per job |
| Content Brain / PR #170 | AI provider/draft audit | FROZEN | run UUID + idempotency key + input hash + content fingerprint | advisory lock by tenant/day/purpose/fingerprint |
| Disposable migration workflows | Disposable database | BLOCKED pending authorization | migration chain hash + target SHA + run ID | one run per disposable instance/chain |
| `production-smoke-readonly.yml` | Public website read | Current definition; not dispatched | N/A | single run concurrency group |
| Archived Production-write/AI workflows | Production/AI/Storage | DEPRECATED/ARCHIVED | not eligible | not eligible |
| Migrations/RLS/grants/RPCs/cron | Database | FROZEN/BLOCKED | migration version/filename + target SHA | one protected migration operation per environment |
| Publishing/Meta/scheduler | Provider/Database | FROZEN/BLOCKED | content fingerprint + provider request ID | one publish attempt per content/provider target |
| Storage upload/update/delete | Storage | BLOCKED | object key + content hash + operation ID | one mutation per object/version |
| Governance branch commits | Git | Current under explicit instruction | commit SHA/path set | sequential file/ref updates |
| PR metadata/merge/settings | GitHub | BLOCKED | operation identity + expected state | one protected operation per target |

## Idempotency verification design

Demonstrate: first request creates one effect; exact replay returns the original receipt; conflicting payload using the same key is rejected; timeout retry reconciles the first operation; daily limits count unique accepted identities only; audit data contains one durable operation ID. No test was run.

## Concurrency verification design

Demonstrate: two simultaneous requests in the same scope produce at most one accepted mutation/job; the loser receives bounded conflict/in-progress status; lease expiry is recoverable; owner/run ID, lock key and timestamps are auditable; unrelated scopes remain independent. No test was run.

## Browser runtime blocklist

Prohibited: direct REST mutations; service-role/database/provider/publishing/webhook secrets; elevated Storage writes; migration/DDL/RLS/grants/cron/workers; protected AI calls; Meta/publishing/scheduling/messages; unregistered RPCs; Production host writes.

## GOV-F archived workflows

`production-booking-smoke.yml`, `ai-media-e2e.yml`, `ai-media-current-production-e2e.yml` and `ai-media-live-fallback.yml` remain removed from the active Workflow directory and preserved by blob SHA in `docs/history/GOV_F_ARCHIVED_PRODUCTION_WRITE_WORKFLOWS.md`.

## Disposable Migration-chain verification plan — not authorized to run

1. Require an isolated database-only PR and exact SHA.
2. Create an empty disposable Supabase/Postgres instance with no Production secrets or data.
3. Pin and record Supabase CLI, PostgreSQL client, Node/npm, shell, Docker/container and migration hashes.
4. Run exact migrations in repository filename order from empty state.
5. Run approved legacy, mixed-history, upgrade, repeat and concurrency scenarios.
6. Inspect schema, functions, RLS, grants, cron/workers, migration history and privilege diffs.
7. Execute read-only SQL post-checks and prove no provider, Storage, publishing or Production network action.
8. Capture logs/artifacts and destroy the disposable instance.
9. Independent database/security reviewer decides pass/fail; failure authorizes no Production action.

Required tools are documented only: pinned `supabase/setup-cli`, Supabase CLI, Docker/local containers where approved, PostgreSQL client, repository shell/Node scripts and SQL verification files. None was invoked.

Kill switches, ownership and rollback remain governed by `RISK_OWNERSHIP_MATRIX.md`, `AI_ENVIRONMENT_FOUNDATION.md` and GOV-C records.
