# Relax Fix UAE — Legacy Repository Parity Review

Status: evidence-based comparison for PR #152. No repository has been archived, deleted, renamed, merged, deployed, or executed.

## Repositories reviewed

### `swim-fluent-uae` — retained candidate

- TanStack Start / Vite application.
- Localized public website, Staff Portal, AI OS / Command Center, protected APIs, password recovery, privacy routes, content/media operations, cron and worker surfaces.
- Supabase Auth and active `staff_profiles` are already integrated.
- Current consolidation work is isolated in `agent/relaxfix-architecture-consolidation`.
- This remains the only candidate currently carrying the complete mixed production surface.

### `relaxfix-2026`

Verified repository metadata:

- Default branch: `main`.
- Repository is public and not archived.
- Repository size observed: 2082 KB.
- Package name: `relaxfix-2026`.
- Runtime entry: `node server.js`.
- Node requirement: `>=18`.
- Direct dependencies: Express, Supabase client, Axios, CORS and dotenv.
- No build, typecheck, test, migration, cron or worker command is declared in `package.json`.

Assessment: this is a separate legacy server implementation, not the retained full production platform. Its use of Supabase does not establish parity with the retained TanStack application. It must not be deleted until its HTTP routes, environment-variable names, deployment target, webhooks, scheduled callers and data writes are compared against the retained repository.

### `relaxfix-pro`

Verified repository metadata:

- Default branch: `main`.
- Repository is public and not archived.
- Repository size observed: 1085 KB.
- Package name: `relaxfix-pro`.
- Development entry: `tsx watch server/_core/index.ts`.
- Production build combines Vite and an esbuild-bundled Express server.
- Production entry: `node dist/index.js`.
- Provides TypeScript checking and Vitest.
- Uses Express, tRPC, Drizzle ORM, MySQL and AWS S3.
- `db:push` runs `drizzle-kit generate && drizzle-kit migrate`.

Assessment: this is a distinct Manus-style application stack and database architecture. It is not safe to merge mechanically into the Supabase/TanStack retained platform. Its user-facing functions and deployment references must be inventoried, but its migration command must not be run during consolidation.

### `RelaxFix-PRO-OS`

Verified repository metadata:

- Default branch: `main`.
- Repository is public and not archived.
- Repository size observed: 775 KB.
- Repository name and internal package identity disagree: package name remains `relaxfix-2026`.
- Node engine is pinned to `18.x`.
- Development, build and production entries follow the same Express/Vite/esbuild pattern as `relaxfix-pro`.
- Uses tRPC, Drizzle ORM, MySQL and AWS S3.
- Includes the same destructive-risk `db:push` migration command.
- Dependency versions differ slightly from `relaxfix-pro`, so equivalence cannot be assumed from structure alone.

Assessment: this is likely a divergent or earlier sibling of `relaxfix-pro`, not an authoritative production source. It remains unsafe to delete until route, schema, assets, deployment and commit-history parity are checked.

## Verified command and persistence matrix

| Repository | Dev | Build | Start | Test/typecheck | Persistence model | Destructive-risk command |
| --- | --- | --- | --- | --- | --- | --- |
| `swim-fluent-uae` | Vite/TanStack | Vite | no generic start script | Typecheck, lint and specialized verification | Supabase Auth, REST/RLS and RPC | No migration command in ordinary runtime scripts |
| `relaxfix-2026` | none declared | none declared | `node server.js` | none declared | Supabase client from Express | None declared in `package.json`; route-level writes still require inspection |
| `relaxfix-pro` | Express/Vite via `tsx watch` | Vite + esbuild server bundle | `node dist/index.js` | TypeScript + Vitest | Drizzle/MySQL and AWS S3 | `db:push` generates and runs migrations |
| `RelaxFix-PRO-OS` | Express/Vite via `tsx watch` | Vite + esbuild server bundle | `node dist/index.js` | TypeScript + Vitest | Drizzle/MySQL and AWS S3 | `db:push` generates and runs migrations |

## Confirmed architectural incompatibilities

The retained platform uses TanStack Start and Supabase-based Staff Auth/RPC flows. The two PRO repositories use Express/tRPC with Drizzle/MySQL and S3. Consolidating them by copying server or database code would introduce a second authentication, persistence, storage and migration model.

Therefore:

- do not run `db:push` in either PRO repository;
- do not import Drizzle migrations into the retained Supabase project;
- do not copy credentials or environment files;
- do not treat matching folder structure as functional parity;
- compare user-facing features and assets, not database implementations;
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

## Deployment and repository rename gate

No repository rename is approved until all of the following have named owners and recorded evidence:

- authoritative production Vercel project and Git integration;
- production and preview domains;
- GitHub Actions references to repository names or URLs;
- external webhooks and OAuth callback URLs;
- Supabase redirect URLs and allowed origins;
- cron callers and worker endpoints;
- documentation badges and hard-coded GitHub links;
- developer remotes, deployment CLI links and local automation;
- rollback procedure and redirect behavior after rename.

A GitHub repository redirect alone is not sufficient evidence because deployment providers, webhooks, secrets, callback allowlists and local remotes may retain exact identifiers.

## Current disposition

- `swim-fluent-uae`: retain and consolidate.
- `relaxfix-2026`: hold; legacy server route and deployment parity review required.
- `relaxfix-pro`: hold; feature, database, storage and deployment parity review required.
- `RelaxFix-PRO-OS`: hold; compare against `relaxfix-pro` and retained platform.

No archive/delete/rename decision is approved by this document. The next safe action is read-only route, workflow and deployment inventory. Archival may be considered only after parity is evidenced. Deletion, if ever approved, must occur only after a recovery export or repository archive has been verified.