# Relax Fix UAE — Legacy Repository Parity Review

Status: evidence-based comparison for PR #152. No repository has been archived or deleted.

## Repositories reviewed

### `swim-fluent-uae` — retained candidate

- TanStack Start / Vite application.
- Localized public website, Staff Portal, AI OS / Command Center, protected APIs, password recovery, privacy routes, content/media operations, cron and worker surfaces.
- Supabase Auth and active `staff_profiles` are already integrated.
- Current consolidation work is isolated in `agent/relaxfix-architecture-consolidation`.

### `relaxfix-2026`

- Small Node/Express service.
- Runtime entry: `node server.js`.
- Direct dependencies: Express, Supabase client, Axios, CORS and dotenv.
- No build, typecheck, test or migration command is declared in `package.json`.
- Repository size observed: 2082 KB.

Assessment: this is a separate legacy server implementation, not the retained full production platform. It must not be deleted until its routes, environment variables, deployment target, webhooks and data writes are compared against the retained repository.

### `relaxfix-pro`

- Vite frontend plus bundled Express server.
- tRPC, Drizzle ORM, MySQL and AWS S3 dependencies.
- Includes `db:push` that runs `drizzle-kit generate && drizzle-kit migrate`.
- Includes build, production start, typecheck and Vitest commands.
- Repository size observed: 1085 KB.

Assessment: this is a distinct Manus-style application stack and database architecture. It is not safe to merge mechanically into the Supabase/TanStack retained platform. Its user-facing functions and deployment references must be inventoried, but its migration command must not be run during consolidation.

### `RelaxFix-PRO-OS`

- Closely related to `relaxfix-pro`: Vite frontend, Express server, tRPC, Drizzle, MySQL and AWS S3.
- Its internal package name remains `relaxfix-2026`, indicating repository identity drift.
- Includes the same destructive-risk `db:push` migration command.
- Repository size observed: 775 KB.

Assessment: likely a divergent or earlier sibling of `relaxfix-pro`, not an authoritative production source. It remains unsafe to delete until route, schema, assets, deployment and commit-history parity are checked.

## Confirmed architectural incompatibilities

The retained platform uses TanStack Start and Supabase-based Staff Auth/RPC flows. The two PRO repositories use Express/tRPC with Drizzle/MySQL and S3. Consolidating them by copying server or database code would introduce a second authentication, persistence and migration model.

Therefore:

- do not run `db:push` in either PRO repository;
- do not import Drizzle migrations into the retained Supabase project;
- do not copy credentials or environment files;
- compare features and assets, not database implementations;
- preserve repository history until deployment ownership is known.

## Required parity checks before archival

For each legacy repository, verify:

1. Public pages and localized content not present in the retained platform.
2. Admin, booking, CRM, billing, messaging and media functions.
3. API routes, webhooks, scheduled jobs and workers.
4. Database schemas, tables and data ownership.
5. Storage buckets and uploaded assets.
6. Environment-variable names without exposing values.
7. Vercel, Render, Railway, Replit or other deployment links.
8. GitHub Actions, branch protections and webhooks.
9. DNS, custom domains and callback URLs.
10. Commit history containing fixes not represented in the retained repository.

## Current disposition

- `swim-fluent-uae`: retain and consolidate.
- `relaxfix-2026`: hold; legacy server parity review required.
- `relaxfix-pro`: hold; feature and deployment parity review required.
- `RelaxFix-PRO-OS`: hold; compare against `relaxfix-pro` and retained platform.

No archive/delete decision is approved by this document. The next safe action is route and deployment inventory, followed by archival before deletion. Deletion, if ever approved, must happen only after a recovery export or repository archive has been verified.
