# Relax Fix UAE Architecture Execution Baseline

This document establishes the safety boundary for consolidating the Relax Fix UAE public website and Command Center.

## Non-destructive execution rules

- Work only on `agent/relaxfix-architecture-consolidation` until reviewed.
- Do not run production database migrations, seeds, cron jobs, workers, or outbound publishing.
- Do not use production secrets in previews or tests.
- Do not delete or archive legacy repositories until feature, deployment, and data-flow parity are documented.
- Do not rename the production repository until deployment integrations and redirects are mapped.
- Open changes as a draft pull request; do not merge automatically.

## Target architecture

- One production repository for the Relax Fix UAE public website and internal Command Center.
- Clear route and module boundaries between public and staff-only areas.
- AI OS protected by staff authentication and server-side role-based access control.
- Legacy Admin disabled only after every required capability has an approved replacement.
- External writes and publishing disabled by default in non-production environments.

## Planned sequence

1. Inventory routes, pages, auth boundaries, data sources, feature flags, and external-write integrations.
2. Add explicit architecture and security boundaries without moving production routes prematurely.
3. Enforce staff authentication and RBAC around AI OS server endpoints and pages.
4. Map Legacy Admin capabilities to Command Center replacements, then disable legacy navigation and access.
5. Compare `relaxfix-2026` and `relaxfix-pro` against the retained platform before archival or deletion.
6. Rename the repository only after deployment and integration references are verified.
