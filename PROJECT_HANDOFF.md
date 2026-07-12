# PROJECT HANDOFF

Last verified: 2026-07-13 (Asia/Dubai)

This file is the operational source of truth for continuing the existing Relax Fix UAE / Swim Fluent UAE project. Read it together with `PROJECT_STRATEGY_HANDOFF.md` and the named project source documents. Do not restart or redesign the project without an approved reason.

## 1. Current repository state

- Repository: `aymanmahrous/swim-fluent-uae`
- Default branch: `main`
- PR #42: **Merged**
- PR #42 merge commit: `6643c66550d6edff771a376c7a7ac9707437b090`
- PR #40: Draft documentation-only PR for these Handoff files; do not merge automatically.
- PR #36: Draft, unmerged, and deferred International Phone application cutover.
- Issue #43: Open and isolated accessibility/mobile backlog.

## 2. Current Production state

Latest owner-approved verification after PR #42:

- Vercel Production: **Ready / Success**.
- Arabic public page verified.
- English public page verified.
- Booking form opens normally and displays the first step.
- No Production test booking was submitted.
- No Production migration or Production-writing workflow was run during the PR #42 verification.

### Approved public copy

Arabic:

- `طلب تقييم أولي`
- `مناقشة أولية لمعرفة نقطة البداية`

English:

- `Request an initial assessment`
- `Initial conversation to understand your starting point`

### Prohibited public claims

Do not publish or restore these claims without separate explicit approval:

- `مجاني`
- `مجانًا`
- `Free`
- `Complimentary`
- `Free assessment`
- `Free consultation`
- `Complimentary assessment`

## 3. Completed and verified work

### PR #42 — public free-claim removal

- Status: Merged.
- Merge commit: `6643c66550d6edff771a376c7a7ac9707437b090`.
- Removed unapproved free/complimentary claims from the public Arabic and English presentation boundary.
- Preserved the booking flow and valid dynamic Business Settings behavior.
- Added a static contract to prevent public free claims from returning.
- Production Arabic and English pages were verified after deployment.

### Earlier durable engineering work

- PR #39 made Production-writing and paid live verification workflows manual-only.
- PR #38 repaired disposable/fresh migration-chain compatibility without reconciling Production migration history.
- PR #37 added the International Phone Phase A database foundation to code, but it has not been applied to Production.
- Current booking protections include idempotency and duplicate-request handling.
- The repository contains Staff, content, media, scheduling, audit, and publishing contracts.
- Contract-tested integrations are not automatically Live integrations.

### Existing SEO foundations

The repository already contains or contract-tests:

- Canonical URLs.
- Arabic and English public routes.
- `hreflang`.
- `x-default`.
- Sitemap.
- Robots directives.
- Structured-data contracts.
- `noindex` protection for private routes.

SEO is **not complete**. Production crawling, metadata review, mobile validation, Local SEO, and Core Web Vitals evidence remain outstanding.

## 4. Incomplete work and parallel-track status

Approved strategy: **REVENUE-FIRST PARALLEL LAUNCH**.

### Track 1 — Close Batch A1

Status: **Not closed**.

- `WEEK 1 FINAL COPY` is approved.
- `Relax Fix UAE Final Brand Kit` is approved.
- Realistic water visual direction is approved.
- Batch A1 contains 23 PNG assets.
- Cairo font verification is still required.
- Actual font-weight verification is still required.
- Arabic visual review is still required.
- Asset inventory and Owner Approval Pack are still required.
- No Batch A1 asset may be published before final owner approval.
- Batch A2 must not begin before Batch A1 closure unless explicitly approved.

Closure requires: 23/23 inventory, visual/typography/export review, correction of all findings, re-verification, Owner Approval Pack, and explicit owner approval.

### Track 2 — SEO

Status: **Foundations exist; audit and implementation remain incomplete**.

Next read-only SEO pack:

- SEO Gap Report.
- URL and Indexation Map.
- Metadata Matrix in Arabic and English.
- Keyword-to-Page Map.
- Structured Data Plan.
- Internal Linking Plan.
- Technical SEO PR Plan.
- Production crawl validation.
- Mobile validation.
- Core Web Vitals baseline.

Do not change approved public copy or add unapproved offers, prices, claims, or keyword stuffing.

### Track 3 — Local SEO

Status: **Not completed**.

Next phase:

- Confirm NAP source of truth.
- Decide approved service-area-business representation.
- Decide public address policy.
- Prepare Google Business Profile readiness checklist.
- Prepare Local Keyword Map.
- Prepare Local Landing Page Recommendation.
- Prepare Local Structured Data Contract.
- Prepare UAE citation plan.
- Prepare review collection workflow.

Do not invent an address, service areas, opening hours, categories, phone numbers, or descriptions. Do not create or edit a Google Business Profile without approval.

### Track 4 — Analytics and attribution

Status: **Documentation only; implementation has not started**.

Approved decisions:

- GA4 through `gtag.js`.
- No GTM in the first phase.
- Analytics behind a feature flag.
- Feature flag disabled by default.
- No PII sent to Analytics.
- `booking_complete` is the Primary Conversion.
- `conversation_start`, `whatsapp_click`, and `call_click` are Secondary Conversions.
- Attribution will later use a separate table related to `booking_requests`.
- No GA4 Production activation before Privacy and Consent approval.

The Analytics Measurement Contract exists, but these owner decisions remain open:

1. Retention duration.
2. Consent UI format.
3. Privacy route structure.
4. `view_service` granularity.
5. Final CTA ID registry.
6. Staff attribution visibility.
7. Production booking test policy.
8. GCLID and FBCLID retention.
9. Attribution handling when Analytics consent is denied.

Do not implement `gtag.js`, environment variables, Consent UI, Analytics events, attribution storage, database migrations, or GA4 configuration before contract closure and approval.

### Track 5 — Publishing readiness

Status: **Partial engineering contracts exist; Live readiness is not proven**.

Remaining gates:

- Facebook Page verification.
- Instagram Professional account verification.
- Meta Business ownership.
- Account linkage.
- Required permissions.
- Server-only credential custody.
- Token expiry and rotation policy.
- Publication receipt operational verification.
- Retry and ambiguous-state procedure.
- Batch A1 approval.
- Pilot-post approval.
- UTM readiness.
- Explicit owner publishing approval.

Do not install Production credentials, publish, schedule, trigger Meta workflows, create Ads, or spend money.

### Track 6 — Organic Pilot

Status: **Blocked** until all of the following are true:

- Batch A1 is closed.
- Assets and captions are approved.
- Minimum Analytics and UTM measurement is ready.
- Publishing readiness is complete.
- Accounts are verified.
- Success criteria are approved.
- Owner explicitly approves publishing.

### Track 7 — Google Ads

Status: **Deferred** until:

- GA4 Production is approved.
- `booking_complete` is proven.
- Privacy and Consent are live.
- PII protection is verified.
- Conversion deduplication is verified.
- Booking stability is verified.
- Mobile performance is acceptable.
- Budget is approved.
- Keywords are approved.
- Stop-loss rules are approved.
- Owner gives separate launch approval.

Google Ads precedes Meta Ads. Do not create campaigns, connect billing, import conversions, or spend money now.

### Track 8 — Meta Ads

Status: **Later than Google Ads** and not approved to start.

## 5. Open PRs and issues

### PR #40 — Documentation baseline

- Branch: `docs/project-handoff-strategy`.
- Scope: `PROJECT_HANDOFF.md` and `PROJECT_STRATEGY_HANDOFF.md` only.
- Must remain Draft until owner review.
- Do not merge automatically.

### PR #36 — International Phone Phase B

- Draft and deferred.
- No merge.
- No Production deployment.
- No Production migration.
- No progression without explicit owner approval.
- Phase A is in repository code but is not applied to Production.

### Issue #43 — isolated accessibility/mobile backlog

Scope only:

1. Form labels accessibility.
2. Color contrast.
3. Sticky-header booking offset on mobile.

Must not be mixed with:

- Analytics.
- SEO.
- Local SEO.
- Batch A1.
- International Phone.
- Publishing.
- Production migrations.

## 6. Current blockers

- Batch A1 lacks completed typography, Arabic, export, and owner-approval evidence.
- Analytics Contract owner decisions remain open.
- Privacy and Consent are not approved for GA4 Production use.
- Local SEO NAP/address/service-area decisions are not confirmed.
- Publishing accounts, ownership, permissions, and Production credential custody are not verified.
- Organic Pilot gates are not satisfied.
- Conversion proof does not yet exist for Google Ads.
- International Phone Production rollout remains blocked and deferred.
- Production migration history is not approved for `db push` or repair.

## 7. Mandatory safety rules

- No Production migrations.
- No `supabase db push`.
- No `supabase migration repair`.
- No manual editing of Production migration history.
- No Production test booking.
- No Production-writing workflow without explicit approval.
- No automatic merge.
- No automatic Production feature-flag activation.
- No Batch A2.
- No publishing.
- No scheduling.
- No advertising.
- No budget spending.
- No unapproved public claims.
- No PII in Analytics.
- No mixing unrelated workstreams in one PR.
- No treating contract-tested integrations as Live integrations.
- No marking a phase complete without validation evidence.
- No changing the approved strategy or sequence without documented reason, explicit owner approval, and a strategy-Handoff update.

## 8. Approved strategy and execution order

**REVENUE-FIRST PARALLEL LAUNCH**

Approved parallel tracks:

1. Close Batch A1.
2. SEO.
3. Local SEO.
4. Analytics and attribution.
5. Publishing readiness.
6. Organic Pilot after approval gates.
7. Google Ads after conversion proof.
8. Meta Ads later.

Durable sequencing rules are maintained in `PROJECT_STRATEGY_HANDOFF.md`.

## 9. Actions requiring owner approval

Owner approval is required before:

- Merging PR #40 or any other PR.
- Correcting or finally approving Batch A1.
- Starting Batch A2.
- Changing public copy or claims.
- Implementing or merging SEO changes.
- Creating Local SEO pages or editing Google Business Profile.
- Closing Analytics Contract decisions.
- Implementing Analytics, Consent, attribution, or database changes.
- Configuring GA4 on Preview or Production.
- Applying any Production migration.
- Progressing PR #36.
- Installing Meta Production credentials.
- Selecting, scheduling, or publishing Pilot posts.
- Running Production-writing workflows.
- Creating or launching advertising.
- Spending any budget.

## 10. Exact references

- PR #42: `https://github.com/aymanmahrous/swim-fluent-uae/pull/42`
- PR #42 merge commit: `6643c66550d6edff771a376c7a7ac9707437b090`
- PR #40: `https://github.com/aymanmahrous/swim-fluent-uae/pull/40`
- PR #36: `https://github.com/aymanmahrous/swim-fluent-uae/pull/36`
- Issue #43: `https://github.com/aymanmahrous/swim-fluent-uae/issues/43`

## 11. Next approved task

Current approved task is limited to preparing and reviewing this Documentation Baseline in PR #40.

After owner approval of this baseline, the recommended next single action is a **read-only Batch A1 inventory and verification audit of all 23 PNG assets**, producing per-asset `Approved`, `Needs correction`, or `Blocked` status and an Owner Approval Pack draft. Do not correct, publish, or start Batch A2 without a separate approval.

## 12. Handoff maintenance

At the end of every major approved phase:

1. Update `PROJECT_HANDOFF.md` with current facts, PRs, commits, tests, Production state, blockers, and next approved action.
2. Update `PROJECT_STRATEGY_HANDOFF.md` only if a durable approved strategy decision changed.
3. Record evidence and distinguish contract-tested, Preview-tested, and Production-verified states.
4. Ensure a new agent can continue without relying on previous chat history.
