# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Current governance stage

`GOV-H: COMPLETED — GOVERNANCE FULLY ESTABLISHED`

GOV-A through GOV-H are complete on `agent/phase-a-source-of-truth`. This certifies governance documentation and branch preparation only. It does not authorize execution, modify `main`, activate GitHub settings, unfreeze PR #170 or start `PHASE-3-SAFE-EXECUTION`.

## Final authoritative documents

- `docs/governance/GOV_H_READINESS_REPORT.md` — final governance decision.
- `docs/governance/GOVERNANCE_COMPLETION_CERTIFICATE.md` — completion certificate.
- `docs/governance/PHASE_3_ACTIVATION_GATE.md` — mandatory post-governance execution gate.
- `docs/governance/POST_GOVERNANCE_ROADMAP.md` — non-executable next-step order.
- `docs/governance/PHASE_NAMESPACE.md` — canonical phase definition.
- `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md` — registered operations, idempotency and concurrency.
- `docs/governance/AI_ENVIRONMENT_FOUNDATION.md` — blocked AI design.

## Permanently blocked unless separately re-authorized

- direct browser table writes and protected credentials;
- all Production writes;
- Migrations, DDL, RLS, grants, policies, cron and workers;
- AI text/media generation and provider spend;
- Storage writes;
- publishing, scheduling, Meta/provider writes, webhooks and messaging;
- the four Production-write/AI Workflows archived by GOV-F;
- unregistered operations;
- mutable or unspecified target refs;
- self-approved sensitive actions;
- history rewriting or undocumented database correction.

PR #170 remains frozen because it combines Migration and application/AI scope. PR #36 remains blocked by database foundation. PR #46 remains blocked by owner/legal/privacy decisions. PR #169 remains evidence only.

## Future candidates inside PHASE-3-SAFE-EXECUTION

Only after a separate explicit post-GOV-H order and a complete PASS gate:

1. source-only verification on an exact SHA;
2. manual `preview-readonly` verification against an exact approved Preview URL and SHA;
3. separately approved `production-readonly` page/header verification;
4. a specifically registered, time-limited server-mediated operation only after successful checks, named independent approval and verified environment controls.

Disposable Migration-chain verification is a separate database-only authorization and is not part of Phase 3. No current AI, media, Migration, Storage, publishing or Production-write operation is eligible.

## Safe operating boundary

Every candidate must be Registry-listed, time-bounded, exact-SHA pinned, independently approved, idempotent where applicable, concurrency-controlled, auditable, reversible and equipped with a named kill-switch owner. Read-only Environments may contain no write-capable secret. Hosts are deny-by-default except the documented GET/HEAD allowlist. Any missing or stale control causes fail closed.

## Experimental activation conditions

Before any experimental run:

- issue a new explicit instruction after GOV-H;
- complete `PHASE_3_ACTIVATION_GATE.md`;
- verify named owners and independent approvers;
- observe all applicable stable checks successful on the exact target SHA;
- verify host allowlist and Environment secret scope;
- record expiry, kill switch, rollback and audit receipt location;
- issue a separate time-bounded GO decision.

A NO-GO or incomplete gate permits no partial execution, fallback or automatic retry.

## Final safety receipt

No Workflow, script, test, build, audit, Preview, deployment, Migration, Supabase/provider/Production connection, generation, media, write, Storage mutation, publishing, scheduling, messaging, settings, secrets, PR metadata or `main` change occurred during GOV-H.

## Post-governance transition

Governance is complete. `PHASE-3-SAFE-EXECUTION` does not begin automatically and remains blocked until a separate explicit order passes the activation gate.