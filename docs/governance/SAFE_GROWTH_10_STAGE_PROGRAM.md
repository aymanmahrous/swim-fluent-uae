# Safe Growth Ten-Stage Program

Document status: CURRENT
Authority: STRATEGIC OPERATING PROGRAM
Applies to: swim-fluent-uae
Last verified: 2026-07-24 (Asia/Dubai)

## Program decision

`SAFE-GROWTH-10-STAGE-PROGRAM: APPROVED — SEQUENTIAL EXECUTION ONLY`

One stage is handled at a time. A stage must be completed, documented, independently reviewed and returned to fail-closed before the next stage may begin. No stage starts automatically.

## Program roles

- Owner / Operator: `AYMAN`
- Independent approver: `pixelreel2026`
- Repository: `aymanmahrous/swim-fluent-uae`
- Branch: `agent/phase-a-source-of-truth`

## Permanent boundaries

- paid AI provider use: prohibited; cost ceiling `0`;
- generated images: prohibited; ceiling `0`;
- generated videos: prohibited; ceiling `0`;
- automatic provider spend or paid fallback: prohibited;
- Production, Supabase, Storage, publishing, scheduling, webhook, CRM or Booking writes require a later operation-specific gate;
- execution outside an exact target SHA and named branch is prohibited.

Any missing, ambiguous, expired, skipped or unverified control causes `FAIL-CLOSED`.

## Stages

1. SAFE EXECUTION BASELINE — `COMPLETED`.
2. READ-ONLY INVENTORY — `COMPLETED`.
3. CONVERSION OPERATING MODEL — `COMPLETED`.
4. CONTENT CALENDAR (DRAFT-ONLY) — `COMPLETED`.
5. N8N SHADOW MODE — `BLOCKED — NO AUTHORIZED SHADOW RUNNER`.
6. CHATBOT SCRIPTED EVALUATION — `BLOCKED`.
7. SINGLE CHANNEL PILOT — `BLOCKED`.
8. MULTI-CHANNEL EXPANSION — `BLOCKED`.
9. CRM & BOOKING INTEGRATION — `BLOCKED`.
10. MONTHLY GROWTH OPERATIONS REVIEW — `BLOCKED`.

## Stage 05 result

Stage 05 was explicitly requested with Target SHA `b54aa650cc03cf105d38be0f344e00db8a120dfd` and Environment `SHADOW-MODE-ONLY`.

The repository contains `automation/n8n/relax-fix-lead-preview-internal-alert.json`, which is inactive and uses synthetic data with external writes disabled. No independently approved isolated n8n runner, registered execution command, exact runtime/container identity, network-deny receipt or credential-empty instance receipt was available. Static JSON inspection cannot be represented as an n8n execution.

Authoritative evidence:

- `docs/governance/STAGE_05_N8N_SHADOW_MODE_REPORT.md`

PR #170 and archived Production-write/AI workflows remain frozen.

## Current program state

`FAIL-CLOSED / NOT AUTHORIZED FOR STAGE 06`

Stage 05 remains incomplete. A retry requires a new explicit instruction, a new target SHA and an approved isolated n8n runner with outbound networking disabled and no credentials. Stage 06 must not begin automatically.