# Seed-to-Real Data Mapping V1 — 2026-07-19

Status: `SEED_TO_REAL_DATA_MAPPING_READY`

## Objective

Replace misleading sample data gradually while preserving reversibility, auditability, and the current Command Center work.

## Mandatory display classification

Every module and record must expose one data-state label:

- `LIVE`: verified current source and connection.
- `SEED`: development/sample record.
- `STATIC`: hardcoded informational content.
- `DISCONNECTED`: intended integration without verified connection.

No integration may be described as live without evidence.

## Source mapping

| Command Center domain | Authoritative source now | Initial mode | Future mode |
|---|---|---|---|
| Tasks and workstreams | GitHub Issues | Read-only | scheduled read-only sync |
| Pull requests and delivery evidence | GitHub PRs and commits | Read-only | scheduled read-only sync |
| Risks and blockers | Program Board / governance Issues | Read-only | controlled internal records with source links |
| Owner decisions | Owner Decision Queue / approved receipts | Read-only | controlled decision workflow |
| Gates | Handoff and governance documents | Read-only | controlled gate lifecycle |
| Batch A1 status | merged PR #120 and final receipt | Live documentation | read-only synchronized record |
| Knowledge Base | approved repository documents | Static/Read-only | database-backed approved records |
| Lead Operations | architecture only | Disconnected | Preview sample data, then separately approved real data |
| Analytics | measurement contract only | Disconnected | verified read-only metrics after activation |
| Social publishing | release plan only | Disconnected | verified account integration after approval |
| SEO/GBP/Search Console | evidence pending | Disconnected | verified read-only evidence first |

## Migration rules

1. Never delete seed records before verified replacements exist.
2. Add `data_state`, `source_system`, `source_reference`, `environment`, and `verified_at` fields before migration.
3. Display seed and real data side by side during Preview verification.
4. Verify counts, identity, timestamps, permissions, and audit events.
5. Hide seed data from normal operational views only after acceptance.
6. Delete seed data only in development and only with separate approval.
7. Real customer data is excluded until Privacy, Consent, retention, and access decisions are approved.

## Priority order

### Wave 1 — low risk

- tasks;
- milestones;
- risks/blockers;
- owner decisions;
- gates;
- evidence links;
- repository status.

### Wave 2 — controlled content

- knowledge records;
- content-plan items;
- Batch A1 QA records;
- publishing readiness checklists.

### Wave 3 — sensitive operations

- leads;
- bookings;
- customer profiles;
- attribution;
- communications.

Wave 3 remains blocked until Privacy/Consent and Production-write gates are closed.

## Acceptance checks

- No operational page relies on localStorage as authoritative storage.
- Reload and separate clean session show the same approved records.
- Every record shows its data state and source.
- No sample metric is shown as real.
- Every mutation has actor, role, timestamp, entity, action, and safe before/after summary.
- Disconnected integrations have no action that can create an external write.

## Rollback

Each wave must be reversible by disabling the new read path and restoring the previous visible seed/static view. Rollback must not delete source data or modify Production.

## Explicit exclusions

No runtime change, database migration, Production data import, customer record, credential, external synchronization, destructive cleanup, deployment, publishing, or billing action is authorized here.