# PROJECT HANDOFF

Last verified: 2026-07-15 (Asia/Dubai)

This file is the operational source of truth for continuing the existing Relax Fix UAE / Swim Fluent UAE project. Read it together with `PROJECT_STRATEGY_HANDOFF.md`, `docs/program/REVENUE_READINESS_SCORECARD_AND_OWNER_DECISION_QUEUE.md`, GitHub Program Board Issue #54, and the named project source documents. Do not restart or redesign the project without an approved reason.

## 1. Current repository state

- Repository: `aymanmahrous/swim-fluent-uae`
- Default branch: `main`
- Approved strategy: `REVENUE-FIRST PARALLEL LAUNCH`
- PR #52: **Merged** on 2026-07-15.
- PR #52 reviewed head: `d078bb1336272216f9011e8c1153dc28e1a51910`.
- PR #52 squash merge commit: `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`.
- PR #52 CI: run #333, completed successfully.
- PR #52 authoritative visual-evidence workflow: final run #23, completed successfully.
- PR #53: temporary visual-evidence tooling PR, closed without merge.
- PR #65: **Merged**.
- PR #65 merge commit: `4fb7efdc02b3298b95ff157d693e4926b60a75c7`.
- Issue #64: **Closed / completed**.
- PR #72: **Merged** after CI run #343 succeeded.
- PR #72 merge commit: `d4f53097ed960da075a2331eaabc61f6539dd0c3`.
- Issue #63: **Closed / completed**.
- PR #74: **Merged** after CI run #346 succeeded.
- PR #74 merge commit: `b36b35de2c6f23d46637f5fb61f3d2e4b6c1f767`.
- Issue #73: **Closed / completed**.
- Issue #66: closed as superseded by Issue #69.
- Issue #67: closed as superseded by Issue #68.
- PR #49: closed without merge as superseded by the broader merged PR #52.
- No database migration, booking submission, Production write, Analytics activation, publishing, scheduling, chatbot/n8n activation, Ads, billing, or spend was part of PR #52, PR #65, PR #72, PR #74, or the PR #49 administrative closure.

## 2. PR #52 completed scope and evidence

PR #52 aligned the Arabic and English public website with approved public-claims safety boundaries.

Completed changes include:

- preserved the approved CTA:
  - Arabic: `طلب تقييم أولي`
  - English: `Request an initial assessment`
- removed the unverified `15+ yrs` claim and replaced it with:
  - Arabic: `تدريب شخصي`
  - English: `Personal Coaching`
- removed the adaptive program card, supportive aquatic movement section, and People of Determination public booking category
- removed adaptive wording from public metadata and Person `knowsAbout`
- removed the unverified Organization `founder` relationship
- applied approved Arabic and English metadata descriptions
- strengthened public-claims and sanitizer contracts
- preserved legitimate words such as `Freestyle` and `Freedom of movement`

Authoritative visual evidence covered:

- Arabic home — desktop
- Arabic home — mobile
- English home — desktop
- English home — mobile

The isolated evidence run verified:

- exact target SHA
- successful Install and Build
- runnable local Node preview
- HTTP 200 for all four captures
- no Console warnings/errors recorded
- no failed network requests recorded
- no mutation requests recorded
- no Production deployment or Production secrets
- no booking or database write
- tracked source clean after capture

Final PR #52 QA state before merge:

`PR52_APPROVED_FOR_MERGE`

## 3. Current Production state

### PR #52 post-merge Production verification — completed

Read-only verification completed after merge.

Vercel evidence:

- Project: `swim-fluent-uae-w532`
- Project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Deployment ID: `dpl_BBBZzpwUqQe6eg9jxWRifY8rmG9z`
- State: `READY`
- Target: `production`
- Git source branch: `main`
- Git commit: `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`
- Production aliases include `www.relaxfixuae.com` and `relaxfixuae.com`.

Read-only public verification used cache-busting requests and confirmed fresh `x-vercel-cache: MISS` responses:

- `https://www.relaxfixuae.com/` — HTTP 200
- `https://www.relaxfixuae.com/en` — HTTP 200

Arabic Production evidence:

- `تدريب شخصي` appears.
- `طلب تقييم أولي` appears.
- `مناقشة أولية لمعرفة نقطة البداية` appears.
- only three approved program cards appear.
- the adaptive program and supportive movement sections are absent.
- the first booking-form step renders without submitting data.

English Production evidence:

- `Personal Coaching` appears.
- `Request an initial assessment` appears.
- `Initial conversation to understand your starting point` appears.
- only three approved program cards appear.
- `Adaptive Aquatic Coaching`, `Supportive Aquatic Movement`, and People of Determination sections are absent.
- the first booking-form step renders without submitting data.

Metadata and structured-data evidence:

- approved Arabic and English descriptions render.
- Person `knowsAbout` is limited to swimming coaching, water confidence, and swimming technique.
- the unverified Organization `founder` relationship is absent.

No Production booking, database mutation, migration, Analytics event, publishing action, chatbot/n8n action, or Ads action was performed.

Final Production verification state:

`PR52_PRODUCTION_READ_ONLY_VERIFIED`

### Approved Business Settings values

- `opening_offer_text_ar`: `طلب تقييم أولي`
- `opening_offer_text_en`: `Request an initial assessment`

Independent static assessment copy remains:

- Arabic: `مناقشة أولية لمعرفة نقطة البداية`
- English: `Initial conversation to understand your starting point`

## 4. Approved public-copy boundaries

Approved public wording includes:

Arabic:

- `طلب تقييم أولي`
- `مناقشة أولية لمعرفة نقطة البداية`
- `تدريب شخصي`

English:

- `Request an initial assessment`
- `Initial conversation to understand your starting point`
- `Personal Coaching`

Do not publish or restore unapproved claims without separate explicit approval, including:

- `مجاني`, `مجانًا`, `مجاناً`, `بدون مقابل`
- `Free`, `Complimentary`, `no-cost`, `no cost`
- unverified years-of-experience claims
- unverified founder relationships
- credentials or certifications not approved for publication
- Adaptive Swimming, Aquatic Rehabilitation, therapy, treatment, medical, diagnostic, or similar professional claims not separately approved

## 5. Program board and agent tasks

The owner approved the remaining execution plan and following workstreams on 2026-07-15.

### Issue #54 — Program Board

`PROGRAM_COORDINATION_AGENT`

Coordinates the approved `REVENUE-FIRST PARALLEL LAUNCH` tracks, dependencies, evidence, and owner gates.

### Issue #55 — PR #52 release package

`RELEASE_QA_AGENT`

Status: **Closed / completed**.

PR #52 is merged and Production read-only verification is complete.

### Issue #56 — Batch A1 closure

`BATCH_A1_VISUAL_QA_AGENT`

Required outcome:

- 23/23 asset inventory
- Cairo/font-weight verification
- Arabic visual review
- export and safe-margin review
- findings and corrections
- Owner Approval Pack

Current recovered evidence:

- manifests and file lists identify 23/23 PNG exports across five Content IDs
- automated records report 1080×1350, RTL, glyph, contrast, mobile 390px, safe-zone, and CTA-duplication checks as passed
- the final-correction manifest labels titles `Cairo Bold` and secondary copy `Cairo SemiBold`
- the available font binary evidence identifies only Cairo Regular / weight 400, so the actual Bold/SemiBold proof is contradictory and not accepted as complete
- individual PNGs or a complete contact sheet/Owner Approval Pack have not yet been recovered for 23/23 human visual inspection
- the rights record says no stock media and no people/children, but it does not claim completed trademark clearance or legal-rights review

Current status:

`BATCH_A1_23_OF_23_MANIFEST_EVIDENCE_RECOVERED_VISUAL_AND_FONT_WEIGHT_PROOF_BLOCKED`

No Batch A2, scheduling, or publishing.

### Issue #57 — 30-day content plan

`CONTENT_STRATEGY_AGENT`

Preparing a bilingual 30-day operating calendar, captions, CTAs, media briefs, UTM placeholders, dependencies, and owner-review queue.

Planning only. No publishing, scheduling, or Batch A2 asset generation before Batch A1 closure.

### Issue #58 — SEO and Local SEO audit

`SEO_LOCAL_SEO_AUDIT_AGENT`

Preparing:

- Production crawl and indexation evidence
- Arabic/English metadata matrix
- keyword-to-page map
- technical SEO plan
- mobile/Core Web Vitals baseline
- NAP decision pack
- Google Business Profile readiness
- local keyword, citation, and review workflow plans

No Google profile/Search Console write and no invented business facts.

### Issue #59 — Privacy, Consent, and Analytics decisions

`PRIVACY_ANALYTICS_GOVERNANCE_AGENT`

Consolidating owner decisions for Privacy, Consent, retention, CTA IDs, attribution, GCLID/FBCLID, Staff visibility, and Production test policy.

No GA4 implementation or activation, cookies, browser storage, database migration, or Production booking.

### Issue #60 — Publishing readiness and Organic Pilot

`PUBLISHING_OPERATIONS_AGENT`

Auditing Meta account ownership/linkage, permissions, credential custody, token rotation, publication receipts, retry/ambiguous-state procedures, Post 2 receipts, Post 3 readiness, and Organic Pilot gates.

No credentials installation, scheduling, publishing, Boost, Ads, or spend.

### Issue #61 — Open PR and backlog triage

`REPOSITORY_HYGIENE_AGENT`

Reviewing PRs #51, #46, #36, and #28 plus Issue #43.

Completed disposition:

- PR #49 closed without merge because current `main` already contains its required sanitizer and public-claims contract through the broader merged PR #52

PR #28 finding:

- the one-line canonical URL fix is still relevant because `main` retains the stale deployment-specific URL
- the branch is 65 commits behind current `main` and must not be merged as-is
- recreate or refresh the isolated change from current `main`, then rerun CI and authorization-boundary review

### Issue #62 — Lead Operations and Automation

`LEAD_OPERATIONS_AUTOMATION_AGENT`

Approved strategic workstream:

`LEAD_OPERATIONS_AND_AUTOMATION`

Planning scope:

- bilingual Arabic/English chatbot for approved FAQs, service explanations, initial-assessment guidance, and lead routing
- explicit consent and data minimization
- Staff CRM/handoff design
- n8n new-lead alerts
- missed-follow-up reminders
- booking-status follow-up
- daily and weekly summaries
- idempotency, duplicate prevention, audit, retry, and safe-stop design

No chatbot deployment, credentials, Production workflow activation, automatic messaging, or database migration.

### Issue #63 — Revenue Readiness Scorecard and Owner Decision Queue

`PROGRAM_OPERATIONS_AGENT`

Status: **Closed / completed**.

PR #72 merged the evidence-based scorecard and recurring Owner Decision Queue at commit `d4f53097ed960da075a2331eaabc61f6539dd0c3` after CI run #343 succeeded.

### Issue #64 — Handoff synchronization after PR #52

`DOCUMENTATION_HANDOFF_AGENT`

Status: **Closed / completed**.

PR #65 merged at `4fb7efdc02b3298b95ff157d693e4926b60a75c7`.

### Issue #68 — Integrated 90-day digital growth strategy

`DIGITAL_GROWTH_STRATEGY_AGENT`

Active consolidated strategy task. Issue #67 is closed as superseded by #68.

Required output includes the 0–30, 31–60, and 61–90 day roadmap for website conversion, SEO, Local SEO, content, social, measurement, lead follow-up, Organic Pilot, and later paid acquisition.

### Issue #69 — Replit Operations Command Center

`OPERATIONS_PRODUCT_ARCHITECT`

Active consolidated product task. Issue #66 is closed as superseded by #69.

The separate management application is named `Command Center Hub`. The owner reports that its build has started. GitHub and Vercel remain the production-site sources of truth; Replit is not a replacement for the Production website.

The MVP remains read-only by default, with no Production database, booking, publishing, Ads, billing, credentials, PII, secrets in the browser, or automatic merge/deploy action.

### Issue #70 — Delegated project-director authority

Status: `DELEGATED_AUTHORITY_ACTIVE_WITH_PROTECTED_BOUNDARIES`.

Routine reversible, evidence-backed work may proceed without repeated owner confirmation. Financial, legal, credential, PII, destructive Production, migration, customer-record, and automatic outbound-messaging actions remain protected.

### Issue #71 — Integrated Quality Department

`QUALITY_GOVERNANCE_AGENT`

Active task to establish QA policy, severity model, checklists, evidence receipts, rework SLA, and approval/rejection states for design, video, content, website, and product.

QA approval does not itself authorize publishing or Production deployment.

### Issue #73 — Post-PR #65 Handoff correction

`DOCUMENTATION_HANDOFF_AGENT`

Status: **Closed / completed**.

PR #74 merged at `b36b35de2c6f23d46637f5fb61f3d2e4b6c1f767` after CI run #346 succeeded. This task changed no application code or durable strategy.

## 6. Approved execution order

Approved parallel-track order:

1. Close Batch A1.
2. SEO.
3. Local SEO.
4. Analytics and attribution.
5. Publishing readiness.
6. Lead Operations and Automation planning; implementation remains gated.
7. Organic Pilot after all required gates.
8. Google Ads after conversion proof.
9. Meta Ads later.

The Owner Decision Queue operates across all tracks.

The 90-day strategy, Replit Command Center architecture, Quality Department, content planning, and read-only audits may proceed in parallel without crossing their protected gates.

## 7. Track status

### Batch A1

Status: **Not closed**.

Verified partial evidence:

- 23/23 filenames and manifest entries recovered
- automated records claim all 23 are 1080×1350 and pass RTL, glyph, contrast, safe-zone, and mobile checks
- source/rights record recovered

Blocking evidence:

- individual PNG/contact-sheet evidence for 23/23 human Arabic visual review is not available in the recovered File Library results
- Cairo Bold/SemiBold declarations conflict with available Cairo Regular / weight 400 binary evidence
- final export review and finding log are not independently re-verified
- Owner Approval Pack is not complete

Batch A2 remains prohibited until Batch A1 closure unless the owner approves a specific exception.

### Content plan

Status: **Authorized and in preparation**.

The 30-day calendar may be planned now. New Batch A2 production, scheduling, and publishing remain gated.

### SEO

Status: **Foundations exist; audit and implementation incomplete**.

Production crawl, metadata review, mobile evidence, structured-data validation, internal linking, and Core Web Vitals baseline remain required.

### Local SEO

Status: **Not completed**.

NAP, public-address policy, service-area representation, hours, categories, Google Business Profile readiness, citations, and review workflow decisions remain outstanding.

### Privacy, Consent, Analytics, and attribution

Status: **Documentation and owner decisions only**.

Durable decisions remain:

- GA4 via `gtag.js`
- no GTM in Phase 1
- feature flag off by default
- no PII in Analytics
- `booking_complete` primary conversion
- `conversation_start`, `whatsapp_click`, and `call_click` secondary conversions

No Production Analytics activation before Privacy and Consent approval.

### Publishing readiness

Status: **Partial contracts exist; Live readiness unproven**.

Account ownership, linkage, permissions, credentials, token lifecycle, receipts, retries, ambiguous states, and duplicate prevention require evidence.

### Lead Operations and Automation

Status: **Strategically approved; architecture/planning started; implementation not authorized**.

Privacy, Consent, security, human handoff, credential custody, and safe-stop gates remain mandatory.

### Revenue Readiness Scorecard

Status: **Completed and merged**.

Source: `docs/program/REVENUE_READINESS_SCORECARD_AND_OWNER_DECISION_QUEUE.md`.

### Integrated 90-day growth strategy

Status: **Active / planning** under Issue #68.

### Replit Command Center

Status: **Build reported started; authoritative build evidence and architecture review still required** under Issue #69.

### Integrated Quality Department

Status: **Active / operating-model design** under Issue #71.

### Organic Pilot

Status: **Blocked** until Batch A1, content approval, minimum measurement/UTM, publishing readiness, account verification, success/stop rules, follow-up ownership, and explicit owner publishing approval are complete.

### Google Ads

Status: **Deferred** until conversion proof, Privacy/Consent, GA4 Production approval, booking stability, mobile performance, PII/deduplication verification, lead follow-up readiness, budget, keywords, and stop-loss rules are approved.

### Meta Ads

Status: **Later than Google Ads** and not approved to launch.

## 8. Open PRs and deferred backlog

### PR #72 — Revenue Readiness Scorecard

- Merged.
- Merge commit: `d4f53097ed960da075a2331eaabc61f6539dd0c3`.
- CI run #343 succeeded.
- Documentation only.

### PR #74 — final post-PR #65 Handoff correction

- Merged.
- Merge commit: `b36b35de2c6f23d46637f5fb61f3d2e4b6c1f767`.
- CI run #346 succeeded.
- Documentation only.

### PR #65 — Handoff synchronization

- Merged.
- Merge commit: `4fb7efdc02b3298b95ff157d693e4926b60a75c7`.
- Issue #64 closed.

### PR #51 — earlier Handoff refresh

- Open Draft.
- Predates PR #52 final evidence, merge, Production verification, PR #65, PR #72, PR #74, and the current governance extensions.
- Requires triage; do not merge in its current stale state without review.

### PR #49 — Production prohibited-claims regression

- Closed without merge as superseded by PR #52.
- Current `main` contains the approved Arabic/English replacements, expanded sanitizer, direct tests, and broader public-claims/schema protections.

### PR #46 — Privacy and Consent copy pack

- Open Draft.
- Remains a documentation source for owner decisions.
- Do not merge as publication/legal approval until factual and legal-review requirements are resolved.

### PR #36 — International Phone Phase B

- Open Draft and deferred.
- PR #37 Phase A was merged, but no Production application or current stacked compatibility proof is established.
- The Phase B branch is 34 commits behind current `main` and must not be merged as-is.
- Must remain isolated from content, SEO, Analytics, chatbot, n8n, accessibility, publishing, and advertising work.
- No Production migration or deployment.

### PR #28 — AI media fallback canonical target

- Open and technically relevant.
- Current branch is stale and diverged: 65 commits behind current `main`, 1 commit ahead.
- Do not merge as-is.
- Recreate or refresh the one-line change from current `main`, rerun CI, and preserve the manual Production authorization boundary.

### Issue #43 — Accessibility/mobile backlog

Isolated scope:

1. Form-label accessibility.
2. Color contrast.
3. Sticky-header booking offset on mobile.

Do not mix with marketing or Production migration work.

### Closed duplicate administration

- Issue #66 closed as superseded by Issue #69.
- Issue #67 closed as superseded by Issue #68.

## 9. Current blockers

- Batch A1 23/23 human visual review and Cairo Bold/SemiBold proof are incomplete.
- Local SEO factual decisions are incomplete.
- Privacy/Consent and Analytics owner decisions remain open.
- Publishing account and Live receipt evidence are incomplete.
- Organic Pilot gates are not satisfied.
- Conversion proof does not exist for paid advertising.
- Lead Operations and Automation is planning-only; implementation gates remain closed.
- Replit Command Center authoritative build/link/security evidence is incomplete.
- International Phone Production rollout remains blocked and deferred.
- Production migration history is not approved for `db push` or repair.

PR #52 Production verification, PR #65 and PR #74 Handoff synchronization, and PR #72 Revenue Readiness Scorecard are complete and are no longer blockers.

## 10. Mandatory safety rules

- No Production migration without explicit approval and an approved plan.
- No `supabase db push` against Production.
- No `supabase migration repair` against Production.
- No manual editing of Production migration history.
- No Production test booking without explicit approval.
- No Production-writing workflow without explicit approval.
- No automatic Production feature-flag activation.
- No Batch A2 before Batch A1 closure unless explicitly approved.
- No publishing or scheduling without its explicit gate and evidence.
- No automatic outbound chatbot, WhatsApp, email, or SMS messaging.
- No Ads, billing connection, conversion import, or budget spend without a real budget ceiling and separate approval.
- No unapproved public claims or credentials.
- No PII in Analytics or advertising systems.
- No mixing unrelated workstreams in one PR.
- Do not describe contract-tested integrations as Live without Live evidence.
- Do not mark a phase complete without validation evidence.
- Routine reversible work may proceed under Issue #70, but protected financial, legal, credential, PII, customer-record, destructive Production, and outbound-messaging actions may not.

## 11. Owner Decision Queue

The owner approved a recurring decision package to reduce agent blocking.

Current source:

`docs/program/REVENUE_READINESS_SCORECARD_AND_OWNER_DECISION_QUEUE.md`

Every queued decision must contain:

- decision
- recommendation
- alternatives
- risks/costs
- safe default while unanswered
- dependency/deadline
- impact of delay

Silence does not authorize Production, migration, credentials, Analytics activation, publishing, scheduling, messaging, Ads, billing, or spend.

## 12. Next approved actions

1. Recover/open the actual Batch A1 final-correction PNG package or contact sheet, inspect 23/23, and resolve the Cairo weight contradiction.
2. Continue the 30-day content plan in Issue #57 without Batch A2 production or publishing.
3. Continue read-only SEO, Local SEO, Privacy/Analytics, publishing-readiness, repository-hygiene, and Lead Operations work in Issues #58–#62.
4. Continue the integrated 90-day strategy, Replit Command Center, and Quality Department work in Issues #68, #69, and #71.
5. Bring only consolidated protected decisions and evidence-backed approval packs to the owner.
6. Do not begin Organic Pilot, Production chatbot/n8n implementation, Analytics activation, publishing, or Ads until their documented gates are satisfied.

## 13. Exact references

- PR #52: `https://github.com/aymanmahrous/swim-fluent-uae/pull/52`
- PR #52 merge commit: `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`
- PR #65: `https://github.com/aymanmahrous/swim-fluent-uae/pull/65`
- PR #65 merge commit: `4fb7efdc02b3298b95ff157d693e4926b60a75c7`
- PR #72: `https://github.com/aymanmahrous/swim-fluent-uae/pull/72`
- PR #72 merge commit: `d4f53097ed960da075a2331eaabc61f6539dd0c3`
- PR #74: `https://github.com/aymanmahrous/swim-fluent-uae/pull/74`
- PR #74 merge commit: `b36b35de2c6f23d46637f5fb61f3d2e4b6c1f767`
- PR #51: `https://github.com/aymanmahrous/swim-fluent-uae/pull/51`
- PR #49: `https://github.com/aymanmahrous/swim-fluent-uae/pull/49`
- PR #46: `https://github.com/aymanmahrous/swim-fluent-uae/pull/46`
- PR #36: `https://github.com/aymanmahrous/swim-fluent-uae/pull/36`
- PR #28: `https://github.com/aymanmahrous/swim-fluent-uae/pull/28`
- Issue #43: `https://github.com/aymanmahrous/swim-fluent-uae/issues/43`
- Program Board: Issue #54
- Active execution tasks: Issues #56–#62 and #68–#71
- Completed execution tasks: Issues #55, #63, #64, #66, #67, and #73

## 14. Handoff maintenance

At the end of every major approved phase:

1. Update `PROJECT_HANDOFF.md` with current facts, commits, PRs, tests, Production status, blockers, and next approved action.
2. Update `PROJECT_STRATEGY_HANDOFF.md` only when a durable approved strategy decision changes.
3. Record evidence and distinguish contract-tested, Preview-tested, and Production-verified states.
4. Ensure a new agent can continue without relying on previous chat history.