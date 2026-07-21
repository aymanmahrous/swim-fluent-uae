# Relax Fix UAE — Current State Inventory

Status: implementation inventory for PR #152

## Safety boundary

This inventory was produced without running Preview, build, tests, migrations, seeds, cron routes, background workers, publishing actions, booking submissions, or production writes.

## Repository identity

The repository is a mixed production platform rather than a standalone Command Center. It currently contains:

- the Arabic and English Relax Fix UAE public website;
- public privacy and password-recovery routes;
- a secure Staff portal;
- the Relax Fix AI OS / Command Center;
- staff and AI OS server APIs;
- content generation, media generation, CRM, analytics, integration, automation, cron, and worker routes.

## Public routes confirmed

- `/`
- `/en`
- `/privacy`
- `/en/privacy`
- `/forgot-password`
- `/reset-password`

The public home is implemented through `src/components/public-home.tsx` and the localized route files.

## Staff and legacy routes confirmed

- `/staff` — Supabase Auth-backed staff portal and booking operations.
- `/staff/reset` — staff password-reset completion.
- `/admin` — legacy route controlled by `VITE_ENABLE_LEGACY_ADMIN`.

The `/admin` implementation no longer contains the former browser-password dashboard. When enabled, it displays a retirement notice; when disabled, it redirects to the public home. The actual operational replacement is `/staff` plus `/os`.

## AI OS routes confirmed

- `/os` — Command Center layout and dashboard.
- `/os/inbox` — AI Inbox.
- `/os/crm` — CRM.
- `/os/automations` — Automations.
- `/os/content` — AI Content Studio.
- `/os/planner` — 30-Day Planner.
- `/os/media` — Media Library.
- `/os/analytics` — Analytics.
- `/os/integrations` — Integrations.

The OS layout verifies `/api/staff-session` before rendering its navigation or child routes. Active staff roles currently recognized are:

- `super_admin`
- `admin`
- `reception`
- `coach`
- `content_manager`

PR #152 now also enforces `VITE_ENABLE_AI_OS` at the `/os` route boundary. When the feature is disabled, the session endpoint is not queried and the internal workspace remains closed.

## Authentication and authorization

`src/platform/staff-session.server.ts`:

- signs in through Supabase Auth;
- stores access and refresh tokens in Secure, HttpOnly, SameSite=Lax cookies;
- checks for an active row in `staff_profiles`;
- resolves and refreshes sessions server-side;
- forwards the staff JWT to protected Supabase RPCs.

`src/routes/api.staff-session.ts` exposes session verification, login, and logout.

AI OS pages are client-gated by the verified Staff session. AI OS APIs independently call `resolveStaffSession(request)`.

The initial centralized permission map is implemented in `src/platform/staff-rbac.ts`. The following permissions have been migrated without broadening access:

- `booking.status.update`
- `crm.workflow.update`
- `content.item.update`
- `content.item.transition`

The booking update API previously depended on the UI disabling the control for unauthorized roles plus downstream RPC enforcement. It now also rejects unauthorized roles directly at the server API boundary.

## Feature flags

- `VITE_ENABLE_AI_OS` — controls AI OS availability and navigation exposure.
- `VITE_ENABLE_LEGACY_ADMIN` — controls the retired legacy route and link.
- `VITE_AI_OS_DEMO_DATA` — selects demo/fallback data in the platform data layer.

All three are disabled in `.env.example`.

## Data sources

The platform is not purely demo/static. Confirmed sources include:

- Supabase Auth for staff identity;
- `staff_profiles` through Supabase REST/RLS;
- protected Supabase RPCs for staff and OS operations;
- API routes under `src/routes/api.*`;
- optional demo/fallback data selected by `VITE_AI_OS_DEMO_DATA`;
- static/localized public content and UI configuration.

## Server/API surface confirmed

### Staff

- `/api/staff-session`
- `/api/staff-bookings`
- `/api/staff-password-request`
- `/api/staff-password-reset`

### AI OS reads and operations

- `/api/os-command-center`
- `/api/os-inbox`
- `/api/os-crm`
- `/api/os-operations`
- `/api/os-analytics`
- `/api/os-integrations`
- `/api/os-automation-status`

### AI OS content and media

- `/api/os-content-items`
- `/api/os-content-generate`
- `/api/os-content-update`
- `/api/os-content-transition`
- `/api/os-media`
- `/api/os-media-copy`
- `/api/os-media-generate-image`
- `/api/os-media-generate-video`
- `/api/os-media-video-jobs`

### Internal, cron, and worker routes

- `/api/internal/content-media-worker`
- `/api/internal/publish-worker`
- `/api/internal/ai-media-e2e`
- `/api/cron/content-automation`

These routes must remain excluded from local Preview and manual testing unless a separate disposable environment and explicit non-production credentials are provided.

## Package scripts

Confirmed scripts include:

- `dev`: `vite dev`
- `build`: `vite build`
- `build:dev`: `vite build --mode development`
- `preview`: `vite preview`
- `typecheck`: development Vite build followed by `tsc --noEmit`
- `lint`: `eslint .`

There is no `start` script and no generic `test` script. Specialized Playwright and verification scripts exist. The ordinary dev/build/preview scripts do not declare migrations, seeds, cron execution, worker execution, database writes, publishing, or outbound sends.

## Current architectural risks

1. The public root shell knows about AI OS and legacy admin feature flags and can expose links to internal surfaces.
2. Staff, AI OS, public site, cron, workers, and publishing concerns coexist in one route tree.
3. Several remaining role policies are still repeated in individual API handlers and must be migrated incrementally.
4. The repository name does not represent the production platform.
5. Legacy repository removal is unsafe until feature and deployment parity is documented.

## Safe implementation order

1. Keep the public URLs unchanged.
2. Make Staff Portal the only discoverable entry point to AI OS.
3. Enforce the AI OS feature gate in addition to staff-session verification. **Completed in PR #152.**
4. Continue migrating RBAC policy incrementally while preserving existing allowed roles.
5. Keep the retired `/admin` compatibility route until external bookmarks and deployment references are checked, then remove it separately.
6. Compare legacy repositories and deployments before archival; do not delete first.
7. Rename the production repository only after Vercel, Actions, webhooks, documentation, and local remotes are verified.

## Current execution status

- Safe branch created: `agent/relaxfix-architecture-consolidation`.
- Draft PR created: #152.
- Current architecture inventory committed.
- Route-level AI OS feature gate committed.
- Initial centralized RBAC policy committed and applied to four write permissions.
- Both Vercel deployment statuses succeeded for the latest RBAC batch.
- No production merge performed.
- No repository renamed, archived, or deleted.
