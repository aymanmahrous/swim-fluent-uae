# Risk Ownership Matrix

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

Accountable role names below do not claim that a named individual has accepted the role. Activation remains blocked until named assignments and separation of duties are recorded under a later authorized stage.

| Risk domain | Responsible | Independent approver | Kill switch owner | Rollback owner | Current decision |
|---|---|---|---|---|---|
| Governance documents and branch commits | Governance Owner | Independent Governance Reviewer | Governance Owner | Governance Owner | Current on governance branch only |
| GitHub PR lifecycle and merge | Repository Owner | Independent Repository Approver | Repository Owner | Release Owner | Blocked during GOV-C |
| Public booking ingress and booking writes | Booking Product Owner | Independent Security/Operations Approver | Booking Product Owner | Booking Operations Owner | Current source path; no GOV-C execution |
| Staff booking status operations | Booking Operations Owner | Independent Operations Approver | Booking Operations Owner | Booking Operations Owner | Current source path; no GOV-C execution |
| CRM workflow writes | CRM Operations Owner | Independent Security/Operations Approver | CRM Operations Owner | CRM Operations Owner | Current source path; no GOV-C execution |
| Staff inbox conversation-mode writes | Staff Operations Owner | Independent Operations/Security Approver | Staff Operations Owner | Staff Operations Owner | Current source path; no GOV-C execution |
| Content editing and review/schedule transitions | Content Operations Owner | Independent Content/Publishing Approver | Content Operations Owner | Content Operations Owner | Current source path; publishing excluded |
| AI Content Brain generation | AI Operations Owner | Independent AI Risk Approver | AI Operations Owner | AI Operations Owner | Frozen; PR #170 non-merge-ready |
| AI media generation and provider jobs | AI Media Owner | Independent AI/Security Approver | AI Media Owner | AI Media Owner | Frozen/Blocked |
| Database migrations, RLS, grants, RPCs, cron | Database Owner | Independent Database/Security Approver | Database Owner | Database Recovery Owner | Frozen/Blocked |
| Disposable migration testing | Database Test Owner | Independent Database Reviewer | Database Test Owner | Database Test Owner | Definition exists; execution blocked by GOV-C |
| Storage writes and media assets | Media Operations Owner | Independent Security/Content Approver | Media Operations Owner | Media Operations Owner | Blocked |
| Publishing, scheduling, Meta/provider writes | Publishing Owner | Independent Brand/Compliance Approver | Publishing Owner | Publishing Incident Owner | Frozen/Blocked |
| Production workflows and promotion | Release Owner | Independent Production Approver | Release Owner | Release Owner | Blocked |
| Production read-only verification | Release Verification Owner | Independent Release Reviewer | Release Owner | Release Verification Owner | Definition exists; execution blocked by GOV-C |
| Privacy, consent and sensitive-data decisions | Privacy Owner | Independent Legal/Privacy Approver | Privacy Owner | Privacy/Incident Owner | Blocked pending decisions |
| Secrets and environment configuration | Security Owner | Independent Security Reviewer | Security Owner | Security Owner | Blocked without protected approval |

## Separation-of-duties rules

1. Responsible may prepare work but may not be the sole approver or sole Production operator.
2. Independent approver must be separate from author and operator.
3. Database, AI, publishing, Production, privacy and secret changes require explicit named approval before activation.
4. Kill switch may be activated immediately for safety; reason, time, actor and affected scope must be recorded.
5. Rollback owner must verify the before-state, rollback method, post-state and unresolved external side effects.
6. Repository Owner is final authorization authority but does not replace independent approval.
7. Missing named assignments keep the path blocked.
