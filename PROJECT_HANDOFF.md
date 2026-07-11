# PROJECT HANDOFF

Last Updated: 2026-07-11 22:33 UTC

## 1. Project identity

- Project name: Relax Fix UAE
- Repository: `aymanmahrous/swim-fluent-uae`
- Default branch: `main`
- Confirmed current main merge commit at the end of the last completed engineering phase: `952cbe252147a6d56a1e8d5a86e48bd7af60f4b3`
- Public business: UAE swimming lessons and booking operations.
- Product scope: bilingual public website, secure booking, Staff Dashboard, CRM, content operations, AI media, publishing, automation, analytics, SEO, and future Stock Media management.

## 2. Final product goal

Build and operate a production-grade bilingual platform that can:

1. Attract local UAE customers through SEO, content, Google Business Profile, and advertising.
2. Accept secure swimming lesson booking requests.
3. Let staff manage leads, bookings, conversations, content, media, publishing, integrations, and audit history.
4. Generate, review, approve, schedule, publish, and measure marketing content.
5. Use existing media, stock providers, generated images, and Google Veo under explicit cost controls.
6. Add n8n later for notifications, follow-ups, review requests, and reports without replacing the internal Scheduler or Media Worker.
7. Add international phone booking through a staged zero-downtime rollout when a recoverable database backup exists.

## 3. Adopted platform and technology

### Frontend and application

- React
- TypeScript
- Vite / TanStack Start application architecture
- Tailwind CSS
- Shadcn UI / Radix primitives
- Lucide React icons
- React Hook Form
- Zod
- TanStack Query
- TanStack Table
- Recharts
- Project i18n layer for Arabic and English

### Backend and database

- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Edge Functions
- PostgreSQL RPC functions
- Row Level Security
- Security Definer functions with explicit `search_path`
- Background job and audit tables

### Testing and CI

- TypeScript typecheck
- ESLint
- Production build
- Playwright
- Node contract verification scripts
- Supabase Local / disposable PostgreSQL migration execution
- GitHub Actions

### Hosting and connected services

- GitHub repository: `https://github.com/aymanmahrous/swim-fluent-uae`
- Vercel project: `swim-fluent-uae-w532`
- Vercel project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Vercel team: `swimmingayman-8492s-projects`
- Supabase Production ref: `nmzxrjdxvmmzzmajrskm`
- Production domains known in the project:
  - `https://www.relaxfixuae.com`
  - `https://relaxfixuae.com`
  - `https://swim-fluent-uae-w532.vercel.app`

## 4. Decisions that must be preserved

### International phone rollout

The rollout is staged:

- Phase A: database compatibility foundation.
- Phase B: application and UI cutover.
- Phase C: retirement of the old public RPC after live verification.

Accepted reasons:

- Migration-first alone could break the currently deployed UAE-only client.
- Application-first alone could call database contracts that did not yet exist.
- Revoking the old RPC in the same migration would create a downtime risk.

Current decision:

- Phase A is merged into `main`.
- Phase A is not applied to Production.
- PR #36, the Phase B application cutover, remains deferred.
- Phase C has not been created.

### Production migration safety

Do not use these against Production without a separate approved migration-history plan:

```bash
supabase db push
supabase migration repair
```

Do not manually edit:

```text
supabase_migrations.schema_migrations
```

Reason: the repository contains historical migration filename prefixes that do not directly match the 14-digit versions recorded in Production.

### Backup decision

- Supabase is currently on the Free Plan.
- Supabase project backups are not available on the Free Plan.
- Do not upgrade to Supabase Pro now.
- Do not apply Phase A until a recoverable backup strategy is approved and completed.
- A future acceptable path is either:
  - a completed Supabase Pro backup, or
  - a verified encrypted logical backup with a successful disposable restore test.

### CI and live workflow safety

All Production-writing or paid live test workflows were changed to manual-only.

Manual-only workflows:

- AI Media E2E
- AI Media Current Production E2E
- AI Media Live Fallback
- Production Booking Smoke

Automatic CI must remain read-only with respect to Supabase booking data.

### Subscription policy

Do not buy subscriptions until they create direct value in the current phase.

Currently deferred:

- Supabase Pro
- Envato
- Canva Pro
- Freepik
- n8n Cloud

### Deferred scope

- Stock Media Provider management is a future independent scope.
- International phone Production rollout is deferred.
- n8n integration is deferred until product and marketing operations need it.

## 5. Work completed and verified

### PR #39 — Production-writing workflows made manual-only

Merged as:

```text
8c793bdb0f0f1cbe29a73ea173aaa8acd5510b3a
```

Implemented:

- Removed automatic `push` triggers from the three live AI Media workflows.
- Added `workflow_dispatch` inputs and job guards.
- Added exact-main-SHA guards.
- Added execution reason checks.
- Added shared live AI Media concurrency with `cancel-in-progress: false`.
- Moved Production booking write smoke to a manual-only workflow.
- Replaced automatic Production booking write verification with read-only settings verification.
- Added a static regression script that prevents automatic Production write workflows from returning.

Important files:

```text
.github/workflows/ai-media-e2e.yml
.github/workflows/ai-media-current-production-e2e.yml
.github/workflows/ai-media-live-fallback.yml
.github/workflows/production-booking-smoke.yml
.github/workflows/ci.yml
scripts/verify-production-workflows-manual-only.mjs
scripts/verify-supabase-booking-readonly.mjs
scripts/verify-supabase-booking.mjs
```

### PR #38 — Fresh Supabase migration chain compatibility

Merged as:

```text
ef5d127fc3a053d653449bccf612dd21b64100a6
```

Implemented and tested on disposable databases:

- Fixed direct references to optional legacy `campaigns.title` and `campaigns.type`.
- Used catalog checks and Dynamic SQL only when optional legacy columns exist.
- Preserved valid `name` and `goal` values.
- Kept legacy columns and rows.
- Applied legacy `rls_auto_enable()` hardening only when the function exists.
- Created legacy/foundation indexes only when their exact table and column exist.
- Preserved RLS and grants.
- Added exact historical SQL execution and migration history audit.

Important files:

```text
supabase/migrations/20260708_000001b_legacy_campaigns_and_missing_ai_os_tables.sql
supabase/migrations/20260708_000004_lock_legacy_public_surface.sql
supabase/migrations/20260708_000005_add_foundation_foreign_key_indexes.sql
.github/workflows/fresh-supabase-migration-compatibility.yml
docs/supabase-migration-history-audit.md
scripts/audit-supabase-migration-history.mjs
scripts/test-campaigns-migration-compatibility.sh
scripts/test-fresh-supabase-history.sh
scripts/test-stacked-phase-a.sh
scripts/sql/verify-fresh-supabase-history.sql
scripts/sql/verify-stacked-phase-a-pre.sql
scripts/sql/verify-stacked-phase-a-post.sql
```

### PR #37 — Phase A international booking phone database foundation

Merged as:

```text
952cbe252147a6d56a1e8d5a86e48bd7af60f4b3
```

Migration:

```text
supabase/migrations/20260711003100_international_booking_phone_foundation.sql
```

Verified migration properties:

- Additive.
- Does not replace `submit_booking_request`.
- Does not revoke `anon` execute from the existing UAE booking RPC.
- Creates `normalize_international_phone`.
- Creates `submit_international_booking_request` as a service-role-only internal function.
- Updates protected ingress to call the international function.
- Broadens structural phone constraints to E.164-compatible digits.
- Does not update, delete, or backfill existing booking rows.
- Does not widen table grants or RLS.

Verified disposable test coverage:

- Full fresh SQL chain.
- Phase A over the existing booking schema.
- Existing UAE booking compatibility.
- International ingress under `service_role`.
- No public execute on international functions.
- Duplicate detection across equivalent formats.
- Phone rate limiting across equivalent formats.
- Idempotency.
- Grants and RLS.

Important files:

```text
supabase/migrations/20260711003100_international_booking_phone_foundation.sql
.github/workflows/booking-phone-foundation.yml
scripts/test-booking-phone-foundation-migrations.sh
scripts/sql/verify-booking-phone-pre-foundation.sql
scripts/sql/verify-booking-phone-foundation.sql
scripts/sql/verify-booking-phone-foundation-fresh.sql
scripts/sql/verify-booking-phone-foundation-readonly.sql
```

### Google Veo integration

Verified historical result:

- Numeric `durationSeconds` was fixed.
- A real Production Google Veo job succeeded.
- A video asset was persisted and played in the Production UI.

This is historical verification only. Do not run Veo without explicit approval.

### SEO contracts

Implemented and contract-tested:

- Canonical URL.
- Arabic and English public routes.
- `hreflang`.
- `x-default`.
- Sitemap.
- Robots directives.
- Structured data contracts.
- noindex protections for private routes.

### Booking security

Implemented:

- UAE phone normalization on the current Production path.
- Idempotency.
- Duplicate booking protection.
- Rate limiting.
- Honeypot.
- Form elapsed-time checks.
- Protected ingress.
- Staff booking display and WhatsApp flow contracts.

### Internal system contracts

Implemented or contract-tested:

- Staff authentication and RBAC.
- CRM and leads.
- Inbox and conversation mode.
- Content review, editing, approval, and scheduling.
- Content Brain cadence contracts.
- Media Worker contracts.
- AI media ownership/private storage.
- Publishing receipts.
- Scheduler contracts.
- Audit logs.
- Meta publishing contracts.

Do not interpret a contract-tested integration as live configured unless separate live evidence exists.

## 6. Problems encountered and resolutions

### Fresh migration failure: `column "title" does not exist`

Cause:

- Fresh `campaigns` schema contained `name` and `goal`.
- A compatibility migration directly referenced legacy `title` and `type` columns.

Resolution:

- Added catalog checks.
- Used Dynamic SQL only when each legacy column exists.
- Preserved valid new and old values.

### Fresh migration failure: missing `rls_auto_enable()`

Cause:

- A hardening migration assumed a legacy helper existed.

Resolution:

- Harden the helper only when `to_regprocedure(...)` confirms it exists.

### Fresh migration failure: missing legacy index dependencies

Cause:

- Index migration assumed legacy tables/columns such as `campaigns.user_id`, `invoices`, and `sessions` existed.

Resolution:

- Create each index only when its exact table and column exist.

### Historical migration version collisions

Observed repository parsing:

```text
20260708 -> 25 files
20260709 -> 1 file
20260710 -> 6 files
```

Production records distinct 14-digit versions, so repository and Production migration histories are not directly aligned.

Resolution for CI only:

- Preserve historical filenames.
- Execute the exact SQL files in deterministic full-filename order on disposable PostgreSQL.
- Do not claim this is a safe Production `db push` strategy.

Open issue:

- A future formal baseline/history reconciliation remains unapproved.

### Automatic Production writes on merge

Cause:

- AI Media workflows and booking verification ran automatically on pushes or PR CI.

Resolution:

- Converted live workflows to manual-only.
- Replaced booking write verification in automatic CI with GET/read-only checks.
- Added static regression verification.

### Phase A Production rollout blocked by backups

Cause:

- Supabase Free Plan has no project backups.
- No manual logical backup and restore test exists.

Resolution:

- Defer Phase A Production application.
- Defer PR #36 deployment.
- Continue other product and marketing work.

## 7. Current open issues

1. Phase A exists in code but is not applied to Production.
2. PR #36 remains deferred and must not be merged or deployed.
3. No recoverable Production database backup exists.
4. No formal Production migration-history reconciliation exists.
5. Product Completion and Marketing Readiness Audit has not yet been executed as a complete factual audit.
6. Analytics, attribution, Search Console, Local SEO, Google Business Profile, and paid advertising readiness require a current audit.
7. Meta publishing contracts exist, but live publishing readiness must be verified separately.
8. Supabase Cron is not to be activated without explicit approval.
9. n8n is not connected.
10. Stock Media management is not implemented.

## 8. Important repository paths

### Public website and SEO

```text
src/components/public-home.tsx
src/routes/index.tsx
src/routes/en.tsx
src/routes/__root.tsx
src/lib/i18n.tsx
src/platform/public-seo.ts
public/robots.txt
public/sitemap.xml
scripts/verify-public-seo.mjs
```

### Booking

```text
src/platform/booking-request.ts
src/routes/api.booking-request.ts
scripts/verify-supabase-booking.mjs
scripts/verify-supabase-booking-readonly.mjs
```

The international phone UI/application files belong to the deferred PR #36 branch. Verify their presence on that branch before using them; do not assume they are on `main`.

### Staff and platform logic

```text
src/routes/staff.tsx
src/platform/
src/components/
```

### Supabase

```text
supabase/migrations/
supabase/functions/
```

### Workflows

```text
.github/workflows/ci.yml
.github/workflows/ai-media-e2e.yml
.github/workflows/ai-media-current-production-e2e.yml
.github/workflows/ai-media-live-fallback.yml
.github/workflows/production-booking-smoke.yml
.github/workflows/fresh-supabase-migration-compatibility.yml
.github/workflows/booking-phone-foundation.yml
```

### Contracts and migration tests

```text
scripts/verify-content-brain.mjs
scripts/verify-meta-publishing.mjs
scripts/verify-content-media-worker.mjs
scripts/verify-content-automation-scheduler.mjs
scripts/verify-supabase-server-key-compatibility.mjs
scripts/verify-password-recovery.mjs
scripts/verify-vercel-build-policy.mjs
scripts/verify-ai-os-contracts.mjs
scripts/verify-ai-media-hardening.mjs
scripts/verify-ai-media-e2e-admin-contracts.mjs
scripts/verify-production-workflows-manual-only.mjs
scripts/audit-supabase-migration-history.mjs
```

## 9. Database summary

Key tables include:

```text
booking_requests
booking_ingress_attempts
business_settings
leads
conversations
messages
follow_up_jobs
campaigns
content_items
content_metrics
brand_brain
knowledge_entries
media_assets
background_jobs
webhook_events
content_publication_receipts
content_automation_runs
content_automation_leases
staff_profiles
audit_logs
```

Key relationships:

- Conversations belong to leads.
- Messages belong to conversations.
- Follow-up jobs belong to leads and can reference conversations.
- Content items can belong to campaigns.
- Content metrics belong to content items.
- Media assets can belong to content items.
- Publication receipts record real publishing outcomes.

Key security expectations:

- RLS enabled on sensitive tables.
- No direct public table writes for bookings.
- Public booking goes through approved RPC contracts.
- Internal international booking and ingress are service-role-only after Phase A is applied.

Last read-only Production Phase A preflight facts recorded before this handoff:

- `normalize_international_phone` absent.
- `submit_international_booking_request` absent.
- Existing `submit_booking_request` present.
- `anon EXECUTE` on the old UAE RPC present.
- Ingress service-role-only.
- Ingress constraint still UAE-only.
- Phase A version `20260711003100` not recorded.
- Phase A was not applied.

Do not treat these as current without a fresh read-only verification.

## 10. Environment variable names

Never store values in this file.

### Vercel Production / server runtime

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
INTERNAL_WORKER_TOKEN
CRON_SECRET
META_GRAPH_VERSION
META_PAGE_ACCESS_TOKEN
META_PAGE_ID
INSTAGRAM_BUSINESS_ACCOUNT_ID
```

AI provider variables may also exist. Verify names from `.env.example` and provider modules before changing anything.

Locations:

- Vercel project settings -> Environment Variables -> Production scope.
- Supabase Edge Function Secrets when an Edge Function explicitly requires one.
- GitHub repository secrets only for explicitly approved workflows.

Rules:

- Do not expose values.
- Do not place server secrets in browser code.
- An Environment Variable change affects only new deployments.

## 11. Design and UX constraints

- Arabic uses RTL.
- English uses LTR.
- Public routes include `/` and `/en`.
- Preserve the current visual system and page architecture.
- Mobile-first.
- Keyboard accessible.
- Screen-reader labels required.
- Do not rebuild the public site from scratch.
- Read exact colors and fonts from the repository before any design change; no authoritative standalone palette or font name was recorded in the completed work.

## 12. Security and operations rules

Do not perform without explicit approval:

```text
Production SQL
supabase db push
supabase migration repair
manual migration-history edits
Production Booking Smoke
AI Media E2E workflows
Google Veo generation
AI image/video generation
Meta publishing
Supabase Cron activation
set_content_automation_pulse_active(true)
Environment Variable changes
manual redeploy
```

Do not:

- Print secrets or tokens.
- Print customer phone numbers.
- Create fake publication receipts.
- Expand RLS or public table grants for convenience.
- Add unauthenticated temporary endpoints.
- Claim live readiness from static contract tests alone.

## 13. Commands used and important validation commands

Core validation:

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:public-seo
npm run verify:content-brain
npm run verify:meta-publishing
npm run verify:content-media-worker
npm run verify:content-automation-scheduler
npm run verify:supabase-server-key
npm run verify:password-recovery
node scripts/verify-vercel-build-policy.mjs
node scripts/verify-ai-os-contracts.mjs
node scripts/verify-ai-media-hardening.mjs
node scripts/verify-ai-media-e2e-admin-contracts.mjs
node scripts/verify-production-workflows-manual-only.mjs
node scripts/verify-supabase-booking-readonly.mjs
```

Disposable migration validation:

```bash
bash scripts/test-campaigns-migration-compatibility.sh
bash scripts/test-fresh-supabase-history.sh
bash scripts/test-stacked-phase-a.sh
bash scripts/test-booking-phone-foundation-migrations.sh
```

Never run disposable migration commands against Production.

## 14. Current stage and exact stopping point

The completed engineering sequence is:

1. PR #39 merged: automatic Production-writing tests were made manual-only.
2. PR #38 merged: Fresh migration chain compatibility was repaired and tested.
3. PR #37 merged: Phase A international booking database foundation entered `main`.
4. Production Phase A preflight was performed read-only.
5. Supabase Free backup limitation was confirmed.
6. Decision adopted: defer Phase A Production application and PR #36 deployment; continue the rest of the product.
7. No backup, migration, Production booking, paid AI generation, or live publishing was executed in the final phase.
8. This documentation branch creates `PROJECT_HANDOFF.md` and `PROJECT_STRATEGY_HANDOFF.md`; it does not modify application or Production behavior.

## 15. Next work in priority order

1. Product Completion and Marketing Readiness Audit, read-only.
2. Product completion for current UAE-only customer acquisition.
3. SEO, Local SEO, analytics, and attribution readiness.
4. Content operations and a realistic 30-day plan.
5. n8n automation only when operational triggers are defined.
6. Paid advertising only after tracking is complete.
7. International phone rollout only after recoverable backup and explicit approval.
8. Stock Media Provider management as a later independent enhancement.

## 16. Next single task

Perform a factual, read-only Product Completion and Marketing Readiness Audit against the current `main`, public site, Vercel, Supabase, and repository contracts.

Do not change code or Production during that audit.
