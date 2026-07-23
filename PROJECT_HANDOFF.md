# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Current governance stage

`GOV-G: COMPLETED — READY FOR GOV-H`

GOV-A through GOV-F restored source truth, organized PR risk, assigned operation ownership, designed enforcement, normalized CI and reduced the active risk surface. GOV-G prepared the safe Phase 3 contract only. No execution or external connection occurred.

## Canonical Phase 3

The only authoritative identifier is `PHASE-3-SAFE-EXECUTION`.

It is a separately authorized, limited and time-bound operation with no Production write, uncontrolled AI, publishing, Storage write, Migration or unregistered action. It requires exact target SHA, registered operation, owner, independent approver, idempotency, concurrency lock, audit receipt, kill switch and rollback. Missing controls fail closed.

GOV-G does not start Phase 3 or unfreeze PR #170.

## Migration and Feature separation

- Every Migration must be a database-only PR.
- A Feature PR may not contain `supabase/migrations/**`, DDL, RLS, grants, policies, cron, workers or schema changes.
- A Migration PR may not contain UI, Feature, AI/provider, media, publishing, Storage or unrelated application behavior.
- PR #170 remains frozen because it combines Migration with application/AI preparation.
- Disposable verification and independent database/security approval are prerequisites; Production application remains separately blocked.

## AI Environment foundation

`docs/governance/AI_ENVIRONMENT_FOUNDATION.md` is `BLOCKED — DESIGN ONLY`.

- Model allowlist is empty by default.
- Token ceilings require approved numeric per-request, per-run and daily values.
- Cost ceiling is zero until approved.
- The first possible candidate is text-only, draft-only and non-publishing.
- No Migration, Production database write, Storage write, media, publishing, scheduling or messaging is allowed.
- AI Operations Owner owns the kill switch; independent AI Risk and Security approvals are required.
- Audit receipt includes model, ceilings/actuals, run/idempotency/lock IDs, content fingerprint, hashes and provider receipt.

## Idempotency

Public booking, staff/CRM/inbox/content mutations, worker jobs, Content Brain, migrations, Storage and publishing candidates now have documented durable identities. Exact replay must produce no second side effect; conflicting key reuse fails; timeout retry reconciles the original receipt. AI and worker retries retain run/job identity.

## Concurrency locks

Documented scopes include booking, conversation, lead, content item, worker job/lease, AI tenant/day/purpose/fingerprint, migration environment, Storage object and publishing target. Same-scope concurrency accepts at most one mutation; conflicts, lease expiry and recovery must be bounded and auditable.

## Disposable Migration-chain verification plan

A future database-only PR must use an empty isolated Supabase/Postgres instance with no Production secrets or data. Pinned Supabase CLI, PostgreSQL client, Node/npm, shell/container tools and migration hashes are recorded. The plan covers empty, legacy, mixed-history, upgrade, repeat and concurrency scenarios, then inspects schema, functions, RLS, grants, cron/workers and migration history, captures artifacts and destroys the instance. No step was run.

## Archived and blocked paths

The four Production-write/AI workflows archived by GOV-F remain outside `.github/workflows/`. PR #170, migrations, AI/media, Storage mutation, publishing, scheduling, Production writes, PR #36 and privacy-dependent PR #46 remain frozen or blocked. `production-smoke-readonly.yml` remains read-only and was not dispatched.

## Safety receipt

No Workflow, script, test, build, audit, Preview, deployment, Migration, Supabase/provider/Production connection, generation, media, publishing, Storage write, message, PR metadata, setting, secret or `main` change occurred.

## Transition gate

GOV-H may begin only under a separate explicit instruction. It must issue a final go/no-go decision; until then `PHASE-3-SAFE-EXECUTION` and PR #170 remain blocked.
