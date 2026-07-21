# Production Readiness Audit — 2026-07-22

## Executive result

The repository is source-ready for a controlled Production release after GitHub CI succeeds on this phase. Runtime release certification remains intentionally pending because Preview, Deploy, Production writes, database writes, migrations, seeds, Cron/Worker execution, publishing, external-provider execution, and Production secrets were outside the authorized safety boundary.

Vercel `build-rate-limit` is an external release constraint. It was not retried or bypassed.

## Command audit

| Command | Reviewed definition | Side-effect assessment |
|---|---|---|
| `dev` | `vite dev` | Starts only the local development server. No migration, seed, Cron, Worker, publishing, provider call, or database write is embedded. |
| `build` | `vite build` | Compiles the application. No runtime task or external send is embedded. |
| `start` | `node .output/server/index.mjs` | Starts only the built Nitro/TanStack server entry. Cron and Worker modules are not invoked by the command. |
| `test` | `node --test tests/staff-rbac.test.ts` | Runs the audited RBAC unit suite only; it does not load Production secrets or execute external systems. |

The repository still contains an explicit `preview` script for human use, but neither this audit nor automatic CI invokes it.

No install/start lifecycle hooks are defined.

## Page and data-source inventory

| Page | Source classification | Boundary |
|---|---|---|
| Public `/` | Static UI plus API-backed business settings; reviewed static fallback | Public read-only API; fallback disables booking and uses approved public content |
| Legacy `/admin` | Static | Disabled by default with `VITE_ENABLE_LEGACY_ADMIN=false`; no browser-password authentication |
| AI OS shell `/os` | API | Disabled by default; requires a schema-validated active Staff session from `/api/staff-session` |
| Command Center `/os/` | Supabase through protected API | `/api/os-command-center`; real read model, no Demo snapshot |
| Analytics `/os/analytics` | Supabase through protected API | `/api/os-analytics`; recorded totals with attribution readiness stated explicitly |
| Automations `/os/automations` | Supabase through protected read APIs | Queue and automation status only; refresh does not execute Cron or Workers |
| Content `/os/content` | Supabase and provider APIs through protected server routes | Reads are protected; generation occurs only after an authenticated, RBAC-checked user action |
| CRM `/os/crm` | Supabase through protected API | Reads plus explicit user mutations through centralized validation/RBAC |
| Inbox `/os/inbox` | Supabase through protected API | Reads plus explicit conversation-mode mutation; no background send on page load |
| Integrations `/os/integrations` | Server configuration status | Returns readiness booleans/labels only; secret values never enter the browser |
| Media `/os/media` | Supabase Storage through protected API | Ownership checks and time-limited signed URLs; provider polling is server-isolated |
| Planner `/os/planner` | Supabase through protected API | Reads plus explicit validated/RBAC workflow transitions; no Demo month |

No AI OS route imports Demo, Mock, or fixture data. `VITE_AI_OS_DEMO_DATA` remains off by default.

## Environment and secret separation

- Browser-safe Supabase URL/anonymous key are the only client Supabase variables.
- AI OS, legacy Admin, Demo data, analytics, booking, email, and n8n flags default off.
- Booking automation test mode defaults on.
- Supabase secret, Worker/Cron tokens, OpenAI, Gemini, Alibaba, Meta, WhatsApp, and TikTok secrets remain server-only placeholders and have no `VITE_` aliases.
- Provider status responses expose configuration/executability state, not values.
- No Production secret was read during this audit.

## Error handling and observability

- Public SSR failures continue to return a generic HTML error page without stack traces.
- Added `src/lib/safe-error-log.server.ts`.
- SSR server and TanStack request middleware now emit bounded JSON error events containing only error name and a sanitized message.
- Bearer tokens, URLs, query credentials, password/credential fields, and long messages are redacted or bounded.
- Raw `Error` objects and stacks are no longer sent to `console.error` by the SSR boundary.

## SEO, localization, accessibility, and performance

Source contracts confirm:

- localized `lang` and RTL/LTR `dir` at the document root;
- viewport, canonical/SEO, sitemap, robots, OpenGraph, and Twitter metadata contracts;
- `noindex` headers/meta for API, Staff, Admin, and AI OS surfaces;
- accessible language-switch labels, generic error recovery, and 404 navigation;
- public root isolation from Staff/AI OS/Admin bundles;
- lazy route/bundle boundaries and content-visibility containment for long public sections.

No browser, Preview, Lighthouse, or live accessibility scanner was run under this phase’s constraints; these findings are source and build-contract based.

## Vercel and Supabase review

- `vercel.json` is restricted to schema, ignore policy, the existing recovery Cron declaration, and security headers.
- Agent branches remain ignored by the Vercel build policy.
- The Vercel install command is explicitly locked to `npm ci --ignore-scripts --no-audit --no-fund --loglevel=error`; no custom build command can insert migrations or runtime tasks.
- The existing Cron declaration was inspected only; it was not executed.
- Supabase automatic CI remains read-only, and Production-writing workflows remain manual-only with explicit confirmations.
- No Supabase request, migration, seed, RPC write, storage write, or database write was performed.

## Final CI contract

`scripts/verify-production-readiness.mjs` prevents regression in:

- safe `dev`, `build`, `start`, and `test` commands;
- lifecycle-hook absence;
- safe feature-flag defaults and server-only secret names;
- Admin/AI OS route authentication and data provenance;
- absence of Demo/Mock/fixture imports in AI OS pages;
- public localization/accessibility basics;
- sanitized SSR logging;
- Vercel source policy and non-implicit runtime commands.

It runs automatically inside the main read-only CI workflow.

## Post-audit Vercel package-manager correction

A live Production build attempt exposed that Vercel preferred the retained `bun.lock` and ran `bun install`, while GitHub CI and the canonical lock use npm. The repository now overrides only Vercel dependency installation with the reviewed deterministic npm command. This does not run Preview/Deploy and does not change runtime code, domains, secrets, data, or provider behavior.

## Closed software blockers

- Added missing explicit `start` and `test` commands.
- Removed raw SSR error-object logging and replaced it with bounded structured redaction.
- Added final Production readiness regression coverage.

## Remaining external/manual release steps

These steps are intentionally not executed:

1. Resolve the Vercel account `build-rate-limit` through the account/plan owner.
2. Review and set Production environment values in Vercel/Supabase without exposing them in tickets or logs.
3. Decide which feature flags to enable; defaults remain fail-closed.
4. Perform an explicitly authorized Production deployment.
5. After deployment, run read-only smoke, browser accessibility/performance, and localization checks.
6. Separately authorize any required database migration or seed after backup/change review.
7. Separately authorize provider connectivity and publishing tests with controlled test records.

## Readiness decision

- **Source and CI readiness:** ready after the latest phase commit passes all GitHub Actions and the PR is merged.
- **Production runtime certification:** pending the external/manual steps above.
- **Known external blocker:** Vercel `build-rate-limit`.
- **Open strategic software phase:** none after this PR is successfully merged and the final Handoff is recorded.
