# Write and Workflow Registry

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Rule

Browser code is deny-by-default for writes. No direct table write, service-role credential, provider credential, Storage mutation, publication, messaging, migration or deployment action may originate in the browser. Only named server-enforced RPC transitions may be considered, and GOV-F does not authorize their execution.

## Registered paths

| Path | Classification | Target | Status |
|---|---|---|---|
| Public booking ingress / `submit_booking_request` | Server-mediated write | Database | Current product path; no GOV-F call |
| `update_booking_request_status` | Controlled staff RPC write | Database | BLOCKED for activation |
| `update_staff_lead_workflow` | Controlled staff RPC write | Database | BLOCKED for activation |
| `set_staff_conversation_mode` | Controlled staff RPC write | Database | BLOCKED for activation |
| `update_staff_content_item` | Controlled staff RPC write | Database | BLOCKED for activation |
| `transition_staff_content_item` | Controlled state/schedule write | Database | BLOCKED; publishing excluded |
| Disposable migration workflows | Disposable write | Isolated database | BLOCKED pending explicit authorization |
| `production-smoke-readonly.yml` | Read | Public Production website | Current definition; not dispatched |
| Production booking smoke | Production write | Database | DEPRECATED/ARCHIVED by GOV-F |
| AI media live/current workflows | Provider/Storage/Database write | AI/Storage/Database | DEPRECATED/ARCHIVED by GOV-F |
| Content Brain / PR #170 | AI/Database write | Provider/Database | FROZEN |
| Migrations/RLS/grants/RPCs/cron | Write | Database | FROZEN/BLOCKED |
| Publishing/Meta/scheduler | Write | Provider/Database | FROZEN/BLOCKED |
| Storage upload/update/delete | Write | Storage | BLOCKED |
| Governance branch commits | Git write | Repository branch | Current only under explicit instruction |
| PR metadata/merge/labels/comments | GitHub write | Repository metadata | BLOCKED without separate authority |

## Browser runtime write blocklist

Explicitly prohibited from browser/client execution:

- direct `/rest/v1/<table>` POST/PATCH/PUT/DELETE;
- service-role, database-password, secret, provider, publishing or webhook credentials;
- direct elevated Storage upload/update/delete;
- migration, DDL, RLS, grant, cron or worker administration;
- AI/provider calls using protected credentials;
- direct Meta/publication/scheduling/outbound messaging;
- arbitrary RPC invocation not named and approved in this registry;
- use of Production hosts for any method other than allowlisted GET/HEAD verification.

## GOV-F workflow decision

The former active Production-write definitions were archived and removed from `.github/workflows/` on this branch:

- `production-booking-smoke.yml`;
- `ai-media-e2e.yml`;
- `ai-media-current-production-e2e.yml`;
- `ai-media-live-fallback.yml`.

Their exact blob SHAs and recovery rules are recorded in `docs/history/GOV_F_ARCHIVED_PRODUCTION_WRITE_WORKFLOWS.md`.

Kill switches, owners, independent approvers and rollback evidence remain governed by `RISK_OWNERSHIP_MATRIX.md`. Every rollback must be a new auditable action; history rewriting and undocumented direct database correction are prohibited.