# Relax Fix UAE — Module Ownership Boundaries

Status: Phase 1 architecture control for Draft PR #152

## Purpose

This document defines ownership and dependency boundaries for the mixed Relax Fix UAE production platform. It does not move routes, rename the repository, change deployments, or authorize production execution. Its purpose is to make future changes auditable and prevent public, staff, AI OS, cron, worker, and publishing concerns from becoming more tightly coupled.

## Boundary principles

1. Public code must not reveal or navigate to internal workspaces.
2. Browser visibility is not authorization. Every protected server route must authenticate independently.
3. Staff and AI OS routes may share the verified Staff session and centralized RBAC policy.
4. Cron and internal worker routes must never use browser Staff-session authentication.
5. Public modules must not import server-secret clients, worker processors, publishing providers, or production-writing helpers.
6. UI modules must call documented API/read-model boundaries rather than importing database or worker implementations directly.
7. Production-writing operations remain manual-only or explicitly authenticated internal operations as documented by their contracts.
8. Feature flags control availability and discoverability; they do not replace server-side authorization.

## Layer A — Public website

### Owned surfaces

- `/`
- `/en`
- `/privacy`
- `/en/privacy`
- public booking and marketing components
- localized content, SEO metadata, analytics consent, and public business settings

### Allowed dependencies

- shared UI primitives
- localization utilities
- read-only public business settings
- public booking API contract
- analytics/consent adapters that do not expose internal credentials

### Forbidden dependencies

- `staff-session.server.ts`
- `staff-rbac.ts`
- Supabase secret/service-role clients
- AI provider adapters
- publishing providers
- cron authentication
- content automation processors
- internal worker processors
- direct links to `/os` or `/admin` in the public shell

## Layer B — Staff Portal

### Owned surfaces

- `/staff`
- `/staff/reset`
- `/api/staff-session`
- `/api/staff-bookings`
- staff password request/reset APIs

### Responsibilities

- Supabase Auth login/logout and verified active `staff_profiles` identity
- secure Staff cookies
- staff booking read/update workflows
- authenticated navigation entry to AI OS

### Rules

- UI controls may reflect permissions for usability, but API authorization is authoritative.
- Staff mutation APIs must use centralized RBAC where an audited permission exists.
- Staff routes must not call cron or worker routes to perform background work.

## Layer C — AI OS / Command Center

### Owned surfaces

- `/os` and all `/os/*` pages
- `/api/os-*` staff-facing APIs
- AI OS read models and schemas
- centralized Staff RBAC policy

### Responsibilities

- feature-gated internal workspace
- Staff-session verification
- permission-based access to CRM, content, media, automation, analytics, and operations
- presentation of real protected data through staff-scoped APIs/RPCs

### Rules

- `/os` must remain gated by `VITE_ENABLE_AI_OS` and Staff authentication.
- Every `/api/os-*` route must call `resolveStaffSession(request)` independently.
- Every privileged operation must use `hasStaffPermission` when an equivalent centralized permission exists.
- AI OS pages must not import Supabase secret clients or internal worker processors.
- Demo/fallback data must remain explicitly controlled and must not silently replace failed real-data authorization.

## Layer D — Shared server platform

### Owned modules

- Staff-session resolution and cookie handling
- centralized RBAC
- authenticated Supabase RPC wrappers
- provider registries and schemas
- media storage and read-model adapters

### Rules

- Server-only modules must use `.server.ts` naming where applicable.
- Secret access must be isolated to explicit server-only clients.
- Shared modules must not trigger work at import time.
- Shared modules must return typed results and must not hide authorization failures as demo data.

## Layer E — Internal workers

### Owned surfaces

- `/api/internal/content-media-worker`
- `/api/internal/publish-worker`
- `/api/internal/ai-media-e2e`
- worker processor modules

### Responsibilities

- claim and process bounded background jobs
- enforce idempotency and retry contracts
- record completion/failure through approved server-side RPCs

### Rules

- Internal routes authenticate with internal-worker credentials, never Staff cookies.
- Route wrappers delegate to processor modules and do not duplicate processor logic.
- Workers must not run automatically during dev, build, preview, tests, or module import.
- Worker execution is forbidden in the current audit lane.

## Layer F — Cron and automation scheduler

### Owned surfaces

- `/api/cron/content-automation`
- cron authentication
- content automation cycle orchestration
- scheduler leases and run records

### Responsibilities

- authenticate Vercel Cron, Supabase Cron, or explicitly approved internal manual sources
- acquire bounded leases
- orchestrate existing worker processors
- preserve human approval requirements

### Rules

- Cron routes delegate authentication and orchestration.
- Cron routes do not read Staff browser sessions.
- Scheduler code must not create Content Brain batches or publish needs-review items.
- High-frequency production scheduling remains disabled unless explicitly approved outside this PR.
- Cron execution is forbidden in the current audit lane.

## Layer G — Database and migrations

### Owned surfaces

- `supabase/migrations/*`
- RLS policies
- staff-scoped RPCs
- service-role worker RPCs
- storage policies

### Rules

- Migrations are versioned source artifacts only in this lane; they must not be applied.
- Staff RPCs must validate authenticated staff role/profile boundaries.
- Worker RPCs must be restricted to their intended server role.
- Security-definer functions require an explicit safe `search_path`, revocation, and grant contract.

## Dependency direction

Permitted direction:

`Public UI -> public APIs/read models`

`Staff UI -> Staff APIs -> Staff session/RBAC -> staff-scoped RPCs`

`AI OS UI -> AI OS APIs -> Staff session/RBAC -> staff-scoped RPCs/providers`

`Cron route -> cron auth -> automation orchestrator -> worker processors -> worker RPCs/providers`

`Internal route -> internal auth -> worker processor -> worker RPCs/providers`

Forbidden direction examples:

- Public UI -> internal worker processor
- Public UI -> secret Supabase client
- AI OS page -> database migration or service-role RPC helper
- Staff browser route -> cron route
- Worker processor -> Staff cookie/session resolver
- Shared module import -> automatic job execution

## Review checklist for future changes

Before approving a new route or module:

1. Identify its owning layer.
2. Confirm its authentication source.
3. Confirm whether it is read-only or writing.
4. Confirm the exact centralized permission for Staff-facing privileged actions.
5. Confirm it does not import across a forbidden boundary.
6. Confirm dev/build/test/preview cannot trigger it automatically.
7. Add or update a read-only contract verification when the boundary is security-relevant.
8. Keep production execution, migrations, cron, workers, and publishing outside ordinary PR validation.

## Current implementation status

- Public navigation no longer exposes `/os` or `/admin`.
- Staff Portal remains the intended discoverable entry to AI OS.
- `/os` has feature-gate and Staff-session protection.
- Staff-facing privileged actions are progressively centralized in `staff-rbac.ts`.
- Cron and internal workers retain separate authentication boundaries.
- No physical route reorganization is performed in Phase 1 because moving route files could change generated routing and deployment behavior.

## Deferred structural work

Physical separation into directories/packages may be considered only after:

- route ownership is fully inventoried;
- import dependencies are measured;
- CI contains boundary checks;
- deployment behavior is confirmed;
- a rollback plan is approved.

Until then, these documented ownership rules are the authoritative architecture boundary.
