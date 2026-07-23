# Stage 05 — n8n Shadow Mode Report

Document status: CURRENT
Authority: STAGE EXECUTION ATTEMPT RECEIPT
Applies to: swim-fluent-uae
Last verified: 2026-07-24 (Asia/Dubai)

## Decision

`STAGE-05-N8N-SHADOW-MODE: BLOCKED — NO AUTHORIZED SHADOW RUNNER`

`FAIL-CLOSED / NOT AUTHORIZED FOR STAGE 06`

## Authorization

- Target SHA: `b54aa650cc03cf105d38be0f344e00db8a120dfd`
- Owner / Operator: `AYMAN`
- Independent approver: `pixelreel2026`
- Allowed Environment: `SHADOW-MODE-ONLY`
- FREE-SAFE-MODE: `ACTIVE`
- External API calls ceiling: `0`
- Production n8n executions ceiling: `0`
- CRM writes ceiling: `0`
- Booking writes ceiling: `0`
- Publishing / Scheduling ceiling: `0`
- Webhooks ceiling: `0`
- Paid AI calls ceiling: `0`
- Generated images ceiling: `0`
- Generated videos ceiling: `0`

## Intended shadow flow

`Manual/Synthetic Event -> Schema Validate -> Consent Check -> Deduplication Check -> Lead Candidate -> Booking Request Candidate -> Staff Review Queue -> Shadow Receipt`

## Repository evidence reviewed

`automation/n8n/relax-fix-lead-preview-internal-alert.json` exists and is inactive. It uses a manual trigger, fictional preview data, prohibited-PII rejection, approved service/location validation, consent validation, an idempotency key, appointment confirmation false, preview-only flags and external writes disabled.

The artifact does not itself prove an n8n execution. No independently approved isolated n8n runner, registered execution command, network-deny receipt, credential-empty instance receipt or immutable execution output was available through the authorized environment.

## Gate result

Static repository prerequisites are present, but execution prerequisites are incomplete:

- no authorized isolated n8n runtime was supplied;
- no exact n8n version or container digest was approved;
- no outbound-network deny evidence was available;
- no credential-empty instance receipt was available;
- no registered runner or dispatch action was available;
- no genuine shadow execution receipt could be generated.

Under fail-closed governance, inspecting or preparing the workflow JSON is not an n8n execution.

## Preparation status

The existing artifact provides a safe starting point for a later retry:

- `active: false`;
- manual trigger only;
- synthetic data only;
- no real PII;
- no webhook node;
- no provider credential reference;
- no external write node;
- validation and consent checks;
- idempotency identity;
- appointment confirmation false;
- staff preview queue output;
- `external_write_performed: false`.

Before a later retry, the shadow workflow must also explicitly represent the Stage 03 sequence through Lead Candidate, Booking Request Candidate, Staff Review Queue and a durable local-only Shadow Receipt.

## Kill switch and rollback

- Kill switch owner: `AYMAN`.
- Kill action: leave the workflow inactive and do not import or execute it.
- Rollback: restore prior governance state in a new auditable branch commit.
- No remote rollback is required because no n8n instance or external state changed.

## Audit receipt

- n8n shadow executions: `0`;
- n8n production executions: `0`;
- external API calls: `0`;
- CRM writes: `0`;
- Booking writes: `0`;
- publishing / scheduling: `0`;
- webhooks: `0`;
- paid AI calls: `0`;
- generated images: `0`;
- generated videos: `0`;
- Production / Supabase / Storage connections: `0`;
- `main` modifications: `0`.

PR #170 and archived Production-write/AI workflows remain frozen.

## Final state

Stage 05 is not complete. Stage 06 must not begin. A retry requires a new explicit instruction, a new target SHA and an independently approved isolated n8n runner with outbound networking disabled and no credentials.