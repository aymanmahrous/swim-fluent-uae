# PROJECT STRATEGY HANDOFF

Last verified: 2026-07-13 (Asia/Dubai)

This file records durable strategic decisions only. Operational facts, temporary blockers, current PR states, and implementation evidence belong in `PROJECT_HANDOFF.md`.

## 1. Strategy lock

Approved strategy:

**REVENUE-FIRST PARALLEL LAUNCH**

Do not change the strategy, track order, or approval gates without:

1. A documented reason.
2. Explicit owner approval.
3. An update to this file.

Do not rebuild the existing platform from scratch. Continue from the verified repository state and preserve the existing React, TypeScript, Supabase, GitHub, Vercel, bilingual Arabic/English, and human-approval architecture unless a separately approved technical reason requires change.

## 2. Approved parallel-track order

1. Close Batch A1.
2. SEO.
3. Local SEO.
4. Analytics and attribution.
5. Publishing readiness.
6. Organic Pilot after approval gates.
7. Google Ads after conversion proof.
8. Meta Ads later.

Parallel work is allowed only when boundaries remain isolated and the required gates are respected.

## 3. Batch sequencing

- WEEK 1 copy and the Relax Fix UAE brand direction are approved inputs.
- Batch A1 must be verified, corrected where required, re-verified, packaged for owner approval, and explicitly approved before it is considered closed.
- No Batch A1 asset may be published before final owner approval.
- Batch A2 must not begin before Batch A1 closure unless the owner explicitly approves an exception.

## 4. SEO strategy

- Existing SEO foundations must be audited before further implementation.
- Technical SEO, On-page SEO, and Local SEO must be documented and implemented through small isolated PRs.
- Do not mark SEO complete based only on static contracts.
- Production crawl, indexability, mobile behavior, metadata, structured data, and Core Web Vitals require evidence.
- Do not use keyword stuffing.
- Do not add unapproved claims, offers, prices, addresses, service areas, or business details.
- Do not generate thin or duplicated local-area pages.

## 5. Local SEO strategy

- NAP and service-area representation must use approved factual values only.
- Address visibility, service areas, opening hours, categories, descriptions, and phone details require verified sources and owner approval.
- Google Business Profile work begins with a readiness checklist and must not create or modify the profile without explicit approval.
- Local landing pages are created only when they serve distinct search intent with substantial unique value.
- Citation and review workflows must be genuine, controlled, and consistent.

## 6. Analytics, attribution, Privacy, and Consent

Durable decisions:

- GA4 uses `gtag.js` in the first phase.
- Google Tag Manager is not used in the first phase.
- Analytics is behind a feature flag.
- The feature flag is disabled by default.
- No PII is sent to Analytics.
- `booking_complete` is the Primary Conversion.
- `conversation_start`, `whatsapp_click`, and `call_click` are Secondary Conversions.
- Attribution will use a separate table related to `booking_requests` when database implementation is approved.
- Historical migrations are never edited for Analytics attribution work; any future database change uses a new migration.
- GA4 must not be activated on Production before Privacy and Consent are reviewed and approved.
- Rejecting Analytics must not prevent use of the website or booking form.
- Conversion and page-view deduplication must be proven before Production activation.
- Browser events must never contain names, phone numbers, emails, Booking IDs, idempotency keys, form values, detailed locations, selected dates/times, raw errors, or other sensitive identifiers.

Analytics implementation proceeds only after the Measurement Contract is fully approved, and through small isolated PRs with Preview evidence before Production activation.

## 7. Publishing readiness strategy

- Existing publishing contracts are foundations, not proof of Live readiness.
- Human approval is required before scheduling or publishing.
- Account ownership, account linkage, permissions, credential custody, token rotation, publication receipts, retry behavior, and ambiguous-state handling must be verified before a Pilot.
- Production credentials remain server-only and are installed only with explicit approval.
- Automatic republishing is forbidden after an ambiguous provider response until the real platform state is manually verified.
- Completed publication receipts must prevent duplicate posts.

## 8. Organic Pilot gate

Organic Pilot begins only after:

- Batch A1 is closed.
- Assets and captions are approved.
- Minimum Analytics and UTM measurement is ready.
- Publishing readiness is complete.
- Accounts are verified.
- Success criteria and correction procedures are approved.
- The owner explicitly approves publishing.

The Pilot is organic and limited. It precedes paid advertising.

## 9. Paid advertising order

- Organic publishing and conversion measurement precede paid advertising.
- Google Ads comes before Meta Ads.
- No paid campaign starts before `booking_complete` is proven, GA4 Production is approved, Privacy and Consent are live, PII and deduplication protections are verified, booking is stable, mobile performance is acceptable, and budget/keywords/stop-loss rules are approved.
- Meta Ads follow later, after creative and measurement performance are proven.
- No campaign, billing connection, conversion import, or spend is allowed without separate owner approval.

## 10. International Phone strategy

- International Phone remains a staged, separately controlled rollout.
- PR #36 remains deferred until its prerequisites and explicit owner approval are satisfied.
- No International Phone merge, Production deployment, or Production migration occurs implicitly through marketing, SEO, Analytics, accessibility, or publishing work.
- Production migration safety restrictions remain binding.

## 11. Production safety restrictions

- No Production migrations without explicit approval and an approved migration/backup plan.
- No `supabase db push` against Production.
- No `supabase migration repair` against Production.
- No manual modification of Production migration history.
- No Production test booking without explicit approval.
- No Production-writing workflow without explicit approval.
- No automatic merge.
- No automatic Production feature-flag activation.
- No automatic publishing, scheduling, advertising, or paid generation.
- Contract-tested integrations must not be described as Live unless Live evidence exists.
- A phase is not complete without explicit validation evidence.

## 12. Small isolated PR policy

Each PR must have one clear workstream and one review purpose.

Do not mix unrelated scopes such as:

- Batch assets and application code.
- SEO and Analytics.
- SEO and Accessibility.
- Analytics and International Phone.
- Publishing and Production migrations.
- Issue #43 and marketing implementation.

Every implementation PR must document:

- Scope.
- Explicit exclusions.
- Tests and evidence.
- Production impact.
- Required owner approval.
- Rollback or safe-stop boundary where relevant.

No PR is merged automatically.

## 13. Handoff maintenance policy

- `PROJECT_HANDOFF.md` is updated at the end of every major approved phase with current facts, commits, PRs, tests, Production status, blockers, and the next approved action.
- This file is updated only when a durable strategic decision changes.
- Temporary technical observations must not be promoted into strategy unless the owner approves them as lasting decisions.
- Any approved strategy change must record the reason and approval context.
- A new agent must be able to continue the project by reading both Handoff files and the mandatory project source documents without relying on prior chat history.
