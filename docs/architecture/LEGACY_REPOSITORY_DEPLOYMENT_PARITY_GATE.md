# Relax Fix UAE — Legacy Repository and Deployment Parity Gate

Status: enforced hold gate. Read-only source review completed on 2026-07-21. No repository was archived, deleted, renamed, merged into another repository, deployed, or executed.

## Authoritative retained repository

`aymanmahrous/swim-fluent-uae` remains the retained mixed production-platform repository because it contains the localized public website, Staff Portal, AI OS / Command Center, protected APIs, Supabase authentication and RBAC, content/media operations, cron contracts, and worker contracts.

This designation is a consolidation decision for source ownership only. It does not prove that every legacy deployment, route, webhook, asset, or data store has been retired.

## Legacy repositories under hold

### `aymanmahrous/relaxfix-2026`

Verified source facts:

- Public, active repository; default branch `main`.
- Package identity: `relaxfix-2026`.
- Runtime: Express with Supabase client, Axios, CORS, and dotenv.
- Only declared command: `start: node server.js`.
- No declared build, test, typecheck, migration, cron, or worker script.

Disposition: **HOLD — NOT ARCHIVE-READY**.

Reason: it is a separate Express/Supabase server implementation. Route-level writes, environment-variable names, deployment ownership, webhooks, scheduled callers, domains, callback URLs, and data ownership have not all been proven obsolete.

### `aymanmahrous/relaxfix-pro`

Verified source facts:

- Public, active repository; default branch `main`.
- Package identity: `relaxfix-pro`.
- Development runtime: Express/Vite through `tsx watch`.
- Production build: Vite plus esbuild server bundle.
- Production start: `node dist/index.js`.
- Persistence stack: Drizzle ORM, MySQL, and AWS S3.
- `db:push` executes `drizzle-kit generate && drizzle-kit migrate`.

Disposition: **HOLD — NOT ARCHIVE-READY**.

Reason: it uses a different authentication, persistence, storage, and migration architecture. Its user-facing features, routes, database ownership, buckets/assets, and deployment references require parity evidence. `db:push` must not be run during consolidation.

### `aymanmahrous/RelaxFix-PRO-OS`

Verified source facts:

- Public, active repository; default branch `main`.
- Repository name and package identity disagree; package name remains `relaxfix-2026`.
- Node engine: `18.x`.
- Express/Vite/esbuild runtime similar to `relaxfix-pro`.
- Persistence stack: Drizzle ORM, MySQL, and AWS S3.
- `db:push` executes `drizzle-kit generate && drizzle-kit migrate`.
- Dependency versions differ from `relaxfix-pro`; structural similarity is not proof of equivalence.

Disposition: **HOLD — NOT ARCHIVE-READY**.

Reason: it may be a divergent sibling, but commit, route, schema, asset, deployment, and external-caller parity are not proven. `db:push` must not be run during consolidation.

## Mandatory deployment parity evidence

Archival, deletion, or repository rename is blocked until every legacy repository has recorded evidence for all of the following:

1. Public pages and localized content.
2. Booking, Staff/Admin, CRM, billing, messaging, media, and automation features.
3. HTTP/API routes, webhooks, cron callers, and workers.
4. Database schemas, tables, writes, and authoritative data owner.
5. Storage buckets, uploaded assets, and recovery/export location.
6. Environment-variable names without exposing values.
7. Deployment projects and Git integrations across Vercel, Render, Railway, Replit, or other providers.
8. GitHub Actions, branch protection, deployment hooks, and repository webhooks.
9. DNS records, production/preview domains, OAuth callbacks, Supabase redirects, and allowed origins.
10. Commit-history fixes absent from the retained repository.
11. Developer remotes, CLI project links, local automation, and rollback procedure.
12. Verified recovery export or repository archive before any deletion decision.

## Safety decisions enforced by this gate

- Do not run legacy `dev`, `start`, `build`, test, migration, cron, worker, or publishing commands as part of parity review.
- Never run `db:push` in either PRO repository.
- Do not copy Drizzle/MySQL migrations into the retained Supabase project.
- Do not copy environment files, credentials, secrets, or production data.
- Do not mechanically merge legacy server/database code into the retained repository.
- Do not archive, delete, rename, or transfer a legacy repository based only on source similarity.
- A GitHub redirect is not sufficient evidence for deployment, webhook, callback, DNS, or local-remote parity.

## Current gate result

- `swim-fluent-uae`: **RETAIN**.
- `relaxfix-2026`: **HOLD — NOT ARCHIVE-READY**.
- `relaxfix-pro`: **HOLD — NOT ARCHIVE-READY**.
- `RelaxFix-PRO-OS`: **HOLD — NOT ARCHIVE-READY**.

The source-level repository comparison is complete for this phase. External deployment parity remains a separate evidence-gathering gate and no destructive repository action is authorized.