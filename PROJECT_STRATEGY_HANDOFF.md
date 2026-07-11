# PROJECT STRATEGY HANDOFF

Last Updated: 2026-07-11 22:33 UTC

## Project and commercial goal

Relax Fix UAE is a bilingual Arabic/English platform for swimming lesson customer acquisition and operations in the UAE. The final commercial goal is to attract qualified local customers, convert them into booking requests, manage them through a Staff Dashboard and CRM, operate measurable content and advertising, and automate follow-up without weakening security or human control.

Repository: `aymanmahrous/swim-fluent-uae`

## Approved vision

The approved platform vision includes:

- Public booking website.
- CRM.
- Staff Dashboard.
- Content Brain.
- Media Worker.
- Human approval before publishing.
- Technical SEO and Local SEO.
- Analytics and UTM attribution.
- Target cadence of three posts per day.
- Smart Media Router.
- Stock Media Provider support.
- n8n for notifications, follow-up, review requests, and reports.
- Google Ads first, then Meta Ads after tracking is complete.

## Approved phase order

### PHASE 1 — Product Completion

Complete and verify the current UAE-only product: public pages, booking, staff access, CRM, follow-up, mobile, accessibility, notifications, monitoring, and audit visibility.

### PHASE 2 — SEO and Attribution

Complete Technical SEO, Local SEO, service and area pages, Search Console, Bing Webmaster, Structured Data, GA4, booking events, WhatsApp and phone-click events, UTM conventions, first-touch attribution, and last-touch attribution.

### PHASE 3 — Content Operations

Prepare a 30-day plan targeting three posts daily:

1. Educational or trust content.
2. Short-form video or visual demonstration.
3. Booking-conversion content.

Every post requires human review before scheduling or publishing.

### PHASE 4 — Automation

Use n8n later for:

- New booking notifications.
- Lead follow-up reminders.
- Review requests.
- Publishing failure alerts.
- Daily reports.
- Weekly reports.

n8n must not replace the internal Scheduler or Media Worker.

### PHASE 5 — Paid Advertising

No paid ads before tracking is complete.

Order:

1. Google Search Ads.
2. Meta Ads.
3. Retargeting after consent and tracking are ready.

### PHASE 6 — International Phone Rollout

Required order:

1. Obtain a recoverable Production database backup.
2. Apply Phase A only with explicit approval.
3. Perform post-apply read-only verification.
4. Update and test PR #36.
5. Deploy Phase B.
6. Perform live verification.
7. Create a separate Phase C for legacy RPC retirement.

## Work completed in fact

### PR #39 — Production-writing workflows manual-only

Merged commit:

`8c793bdb0f0f1cbe29a73ea173aaa8acd5510b3a`

Completed:

- Live AI Media workflows changed to `workflow_dispatch` only.
- Production Booking Smoke changed to manual-only.
- Automatic CI booking verification changed to read-only.
- Added confirmation, main-only, exact-SHA, reason, and concurrency guards.

### PR #38 — Fresh migration chain compatibility

Merged commit:

`ef5d127fc3a053d653449bccf612dd21b64100a6`

Completed and tested on disposable databases:

- Optional legacy campaign columns handled with catalog checks and Dynamic SQL.
- Legacy helper hardening made conditional.
- Index creation made conditional on exact table and column existence.
- Fresh historical SQL chain and migration audit added.

### PR #37 — International phone Phase A

Merged commit and last confirmed `main`:

`952cbe252147a6d56a1e8d5a86e48bd7af60f4b3`

Migration in code:

`supabase/migrations/20260711003100_international_booking_phone_foundation.sql`

Verified on disposable databases:

- Additive migration.
- Existing UAE RPC retained.
- `anon` execute on the old RPC retained.
- International normalizer and internal booking function added in code.
- International function and ingress restricted to `service_role`.
- E.164 structural constraints added without rewriting existing rows.
- Duplicate detection, rate limiting, idempotency, RLS, and grants tested.

Important: Phase A is not applied to Production.

### Other completed capabilities

Implemented or contract-tested:

- Bilingual public site architecture.
- Current UAE booking security.
- Staff authentication and RBAC.
- CRM and lead models.
- Content Brain contracts.
- Media Worker contracts.
- Human approval, scheduling, and publication receipt contracts.
- Canonical, hreflang, sitemap, robots, structured data, and private-route noindex contracts.
- A historical real Google Veo success after fixing numeric `durationSeconds`.

Contract tests do not automatically prove a service is live-configured.

## Current work

No application implementation is currently active. The current stage is documentation followed by a read-only Product Completion and Marketing Readiness Audit.

This documentation branch adds:

- `PROJECT_HANDOFF.md`
- `PROJECT_STRATEGY_HANDOFF.md`

## Deferred work

### International phone rollout

- Phase A exists in code.
- Phase A is not applied to Production.
- PR #36 is deferred.
- Reason: Supabase Free has no recoverable project backup, and no verified manual logical backup and restore test exists.

### Other deferred scopes

- Stock Media Provider management.
- n8n integration.
- Paid advertising.
- Meta live publishing verification.

These are deferred to their approved phases rather than cancelled.

## Subscription decisions

Not approved now:

- Supabase Pro.
- Envato.
- Canva Pro.
- Freepik.
- n8n Cloud.

A subscription is purchased only when it provides direct value in the active phase.

## SEO plan

Technical SEO:

- Canonical URLs.
- Arabic/English alternates.
- `hreflang` and `x-default`.
- Sitemap and robots.
- Private-route noindex.
- Structured Data.
- Page titles and descriptions.
- Mobile performance and Core Web Vitals.

Local SEO:

- Google Business Profile readiness.
- Consistent business and service-area information.
- Useful service pages.
- Useful area pages without thin duplication.
- Genuine review collection.
- Local trust signals and booking calls to action.

Search platforms:

- Google Search Console.
- Bing Webmaster Tools.
- Sitemap submission and indexing monitoring.

## Analytics plan

Planned GA4 events:

- Booking started.
- Booking completed.
- WhatsApp click.
- Phone-call click.
- Service-page engagement.

UTM fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

Attribution target:

- First-touch source, medium, and campaign.
- Last-touch source, medium, and campaign.
- Landing page and referrer where permitted.

The current deployed analytics status must be verified; do not assume it is complete.

## Content plan

Target: 30 days, three posts daily, subject to quality and approval capacity.

Content mix:

- Educational content.
- Short video.
- Booking-conversion post.

Flow:

`Idea -> Draft -> Media -> Human review -> Approval -> Schedule -> Publish -> Receipt -> Measurement`

## Smart Media plan

Routing order:

1. Existing approved media.
2. Licensed stock media.
3. Generated image.
4. Google Veo for selected premium content only.

Cost controls required:

- Provider budgets.
- Daily and monthly limits.
- Estimated cost per job.
- Retry limits.
- Reuse of approved assets.
- Explicit approval for paid generation.

Stock Media Provider is a future independent workstream covering search, import, licensing, attribution, cost, deduplication, and approval.

## n8n plan

n8n will be an orchestration and notification layer only. It must not own core state transitions or replace Scheduler or Media Worker. It should be added only after exact triggers, owners, retry rules, and failure handling are approved.

## Advertising plan

Paid ads remain blocked until:

- Analytics is verified.
- Booking conversion tracking works.
- WhatsApp and phone clicks are tracked.
- UTM attribution works.
- Landing pages and mobile experience are ready.
- Consent and privacy requirements are satisfied.

Google Search Ads are first because they capture high-intent demand. Meta Ads follow after creative and conversion measurement are proven.

## Current risks

1. No recoverable Supabase Production backup.
2. Phase A is in code but not Production.
3. PR #36 is deferred and may require updating against current `main`.
4. Repository and Production migration histories are not formally reconciled.
5. Analytics and attribution readiness has not been fully audited.
6. Search Console, Bing, and Google Business Profile readiness has not been fully audited.
7. Contract-tested Meta publishing is not proof of live readiness.
8. Three posts daily may exceed media or human approval capacity.
9. Paid AI generation needs strict budget controls.
10. Free Plan backup limitations are an ongoing business continuity risk.

## Decisions not to change without a strong documented reason

- Do not rebuild the platform from scratch.
- Preserve React, TypeScript, Supabase, GitHub, and Vercel architecture.
- Preserve Arabic RTL and English LTR.
- Preserve human approval before publication.
- Do not apply Phase A without a recoverable backup and explicit approval.
- Do not merge or deploy PR #36 before Phase A is applied and verified.
- Do not use Production `db push`, migration repair, or manual migration-history edits under the current history state.
- Keep live AI Media and Production Booking workflows manual-only.
- Keep automatic CI read-only for booking verification.
- Do not launch paid ads before tracking.
- Do not buy subscriptions without direct value.
- Do not use n8n to replace Scheduler or Media Worker.
- Do not start Stock Media work before product and marketing readiness.
- Do not merge or change Production without explicit approval.

## Last merge commit

Last confirmed `main` before this documentation branch:

`952cbe252147a6d56a1e8d5a86e48bd7af60f4b3`

A new agent must verify current `main` because this value becomes historical after later merges.

## Production status

- Vercel project: `swim-fluent-uae-w532`.
- Last documented Production deployment after PR #37: READY.
- Supabase Production ref: `nmzxrjdxvmmzzmajrskm`.
- Supabase plan: Free.
- Production backups: unavailable.
- Phase A: not applied.
- Current booking path at the last read-only check: UAE-only.
- No Production migration, booking, paid generation, or live publishing was executed in the final completed phase.

## Pull request status

- PR #36: last known OPEN, DRAFT, UNMERGED, deferred. Do not merge or deploy.
- PR #37: MERGED.
- PR #38: MERGED.
- PR #39: MERGED.

Verify PR states directly before acting.

## Next single step

Perform a factual, read-only Product Completion and Marketing Readiness Audit. Do not modify code or Production during the audit.

## NEW CHAT STARTER

```text
Continue the existing Relax Fix UAE project in repository aymanmahrous/swim-fluent-uae.

Before doing anything:
1. Read PROJECT_HANDOFF.md completely.
2. Read PROJECT_STRATEGY_HANDOFF.md completely.
3. Review the latest agent report and verify current main, PRs, Vercel, and relevant Supabase state read-only.
4. Do not rebuild the project.
5. Do not change previous architecture, rollout, security, subscription, or marketing decisions without a strong documented reason.
6. Give one safe next step at a time.
7. Do not merge, apply SQL, run manual workflows, trigger paid generation, publish, change settings, or modify Production without explicit approval.
8. Phase A is merged in code but not applied to Production.
9. PR #36 is deferred until a recoverable backup exists and Phase A is applied and verified.

Start with a read-only Product Completion and Marketing Readiness Audit.
```
