# PROJECT STRATEGY HANDOFF

Last verified: 2026-07-15 (Asia/Dubai)

This file records durable strategic decisions only. Operational facts, temporary blockers, current PR states, and implementation evidence belong in `PROJECT_HANDOFF.md`.

## 1. Strategy lock

Approved strategy:

**REVENUE-FIRST PARALLEL LAUNCH**

Do not change the strategy, track order, or approval gates without:

1. A documented reason.
2. Explicit owner approval.
3. An update to this file.

Do not rebuild the existing platform from scratch. Continue from the verified repository state and preserve the existing React, TypeScript, Supabase, GitHub, Vercel, bilingual Arabic/English, and human-approval architecture unless a separately approved technical reason requires change.

Owner approval recorded on 2026-07-15 added two durable operating decisions:

- `LEAD_OPERATIONS_AND_AUTOMATION` is an approved strategic workstream.
- `OWNER_DECISION_QUEUE` is an approved recurring governance mechanism.

## 2. Approved parallel-track order

1. Close Batch A1.
2. SEO.
3. Local SEO.
4. Analytics and attribution.
5. Publishing readiness.
6. Lead Operations and Automation planning, with implementation gated by Privacy, Consent, security, and human-approval requirements.
7. Organic Pilot after approval gates.
8. Google Ads after conversion proof.
9. Meta Ads later.

Parallel work is allowed only when boundaries remain isolated and the required gates are respected.

The Owner Decision Queue operates across all tracks and does not replace the required approval gates.

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

## 8. Lead Operations and Automation strategy

Approved workstream name:

`LEAD_OPERATIONS_AND_AUTOMATION`

Purpose:

- Connect approved content, SEO, Local SEO, WhatsApp, and booking journeys to controlled Staff follow-up.
- Provide a bilingual Arabic/English chatbot for approved FAQs, service explanations, initial-assessment guidance, and lead routing.
- Use n8n for controlled operational alerts, missed-follow-up reminders, booking-status follow-up, and daily/weekly summaries.
- Improve follow-up speed without weakening human approval, Privacy, Consent, or data-minimization requirements.

Durable rules:

- Planning may proceed in parallel now.
- Chatbot or n8n Production implementation requires separate approval.
- Privacy and Consent decisions must be closed before collecting or retaining new chatbot data.
- No PII is sent to Analytics or advertising systems.
- The chatbot must not provide medical, therapeutic, diagnostic, emergency, rehabilitation, or credential-based advice.
- Human escalation is mandatory for uncertain, sensitive, complaint, safeguarding, health, or booking-exception cases.
- Outbound messaging beyond a user-initiated conversation requires explicit approval and an approved consent basis.
- Production credentials remain server-only.
- Workflow idempotency, duplicate prevention, audit logs, retry rules, ambiguous-state handling, and safe-stop behavior are required.
- Any database change uses a new migration and separate approval; historical migrations are never edited.
- Contract-tested automation must not be described as Live without Live evidence.

Implementation must use small isolated PRs with Preview-only evidence first.

## 9. Owner Decision Queue governance

Approved governance mechanism:

`OWNER_DECISION_QUEUE`

Purpose:

- Prevent agents from repeatedly stopping for scattered owner questions.
- Group decisions into a short, prioritized review package.
- Make the safest default state explicit while a decision is unanswered.

Every decision entry must include:

- Decision statement.
- Recommended option.
- Alternatives.
- Risks and costs.
- Safe default while unanswered.
- Dependency or deadline.
- Impact of delay.

Operating rules:

- The queue may be prepared weekly or at the end of a major phase.
- The queue does not grant approval by itself.
- Silence never authorizes Production, publishing, scheduling, migration, credentials, Analytics activation, Ads, spend, or merge.
- Urgent safety or Production-risk decisions must be escalated immediately rather than waiting for the weekly queue.
- Approved decisions must be recorded in the appropriate Handoff or source-of-truth document.

## 10. Organic Pilot gate

Organic Pilot begins only after:

- Batch A1 is closed.
- Assets and captions are approved.
- Minimum Analytics and UTM measurement is ready.
- Publishing readiness is complete.
- Accounts are verified.
- Success criteria and correction procedures are approved.
- Lead-routing and follow-up ownership are clear.
- The owner explicitly approves publishing.

The Pilot is organic and limited. It precedes paid advertising.

## 11. Paid advertising order

- Organic publishing and conversion measurement precede paid advertising.
- Google Ads comes before Meta Ads.
- No paid campaign starts before `booking_complete` is proven, GA4 Production is approved, Privacy and Consent are live, PII and deduplication protections are verified, booking is stable, mobile performance is acceptable, lead follow-up ownership is ready, and budget/keywords/stop-loss rules are approved.
- Meta Ads follow later, after creative and measurement performance are proven.
- No campaign, billing connection, conversion import, or spend is allowed without separate owner approval.

## 12. International Phone strategy

- International Phone remains a staged, separately controlled rollout.
- PR #36 remains deferred until its prerequisites and explicit owner approval are satisfied.
- No International Phone merge, Production deployment, or Production migration occurs implicitly through marketing, SEO, Analytics, accessibility, publishing, chatbot, or n8n work.
- Production migration safety restrictions remain binding.

## 13. Production safety restrictions

- No Production migrations without explicit approval and an approved migration/backup plan.
- No `supabase db push` against Production.
- No `supabase migration repair` against Production.
- No manual modification of Production migration history.
- No Production test booking without explicit approval.
- No Production-writing workflow without explicit approval.
- No automatic merge.
- No automatic Production feature-flag activation.
- No automatic publishing, scheduling, messaging, advertising, or paid generation.
- Contract-tested integrations must not be described as Live unless Live evidence exists.
- A phase is not complete without explicit validation evidence.

## 14. Small isolated PR policy

Each PR must have one clear workstream and one review purpose.

Do not mix unrelated scopes such as:

- Batch assets and application code.
- SEO and Analytics.
- SEO and Accessibility.
- Analytics and International Phone.
- Publishing and Production migrations.
- Chatbot/n8n and Ads.
- Lead automation and Production migration history.
- Issue #43 and marketing implementation.

Every implementation PR must document:

- Scope.
- Explicit exclusions.
- Tests and evidence.
- Production impact.
- Required owner approval.
- Rollback or safe-stop boundary where relevant.

No PR is merged automatically.

## 15. Handoff maintenance policy

- `PROJECT_HANDOFF.md` is updated at the end of every major approved phase with current facts, commits, PRs, tests, Production status, blockers, and the next approved action.
- This file is updated only when a durable strategic decision changes.
- Temporary technical observations must not be promoted into strategy unless the owner approves them as lasting decisions.
- Any approved strategy change must record the reason and approval context.
- A new agent must be able to continue the project by reading both Handoff files and the mandatory project source documents without relying on prior chat history.

## 16. Complete Digital Ecosystem strategy

Owner approval recorded on 2026-07-15 establishes:

`RELAX_FIX_GROWTH_OS / COMPLETE_DIGITAL_ECOSYSTEM`

This is a durable long-term product and operating direction. It expands the capability map without replacing `REVENUE-FIRST PARALLEL LAUNCH`, bypassing current gates, or requiring all modules to be built immediately.

Canonical detailed architecture:

- `docs/program/COMPLETE_DIGITAL_ECOSYSTEM.md`
- Ecosystem architecture Issue #80.

Approved ecosystem domains include:

- the customer website and conversion system;
- SEO, Local SEO, content, publishing, Social Media Intelligence, and later paid acquisition;
- CRM, Lead Operations, controlled chatbot/n8n, and human follow-up;
- Agent Management, Quality Department, Owner Dashboard, notifications, analytics, and Knowledge Base;
- AI Swimming Education and evidence-referenced coach-reviewed lesson planning;
- Adaptive Aquatics educational planning based on individual needs and observations rather than diagnosis stereotypes;
- anonymous-first learner progress and family educational reports;
- general aquatic exercise guidance within verified competence;
- explicit separation of swimming education, general exercise, and clinician-supervised rehabilitation;
- future Academy, LMS, memberships, community, mobile, multi-coach, and multi-branch expansion after evidence-backed prioritization.

Durable ecosystem rules:

- GitHub and Vercel remain authoritative for the customer website; the Replit Command Center remains a separate internal application.
- One canonical system of record is chosen for each business concept; duplicated sources of truth are prohibited.
- New modules are bilingual, mobile-ready, accessible, auditable, versioned, and API-first where appropriate.
- An open Issue is an assignment, not proof of active autonomous execution; evidence is required for progress and completion.
- AI-generated swimming or adaptive plans require source validation, visible assumptions and limitations, and coach approval before use.
- The system does not diagnose, prescribe clinical treatment, independently design clinician-supervised rehabilitation, guarantee outcomes, or use unsupported medical, sensory, attention, developmental, therapy, rehabilitation, qualification, or performance claims.
- A diagnosis label alone never determines an educational plan.
- Forced submersion, forced eye contact, coercive exposure, punishment, restraint, unsafe breath-holding, and unsupervised child instruction are prohibited product recommendations.
- No identifiable lead, customer, child, family, disability, diagnosis, health, or safeguarding data is stored until Privacy/Consent, security, role access, retention, correction, deletion, sharing, vendor, and incident rules are approved.
- Before those gates, architecture uses anonymous codes, fictional records, sample data, schemas, templates, and evaluation cases only.
- Public titles and aquatic therapy/rehabilitation claims require verified qualifications and applicable UAE professional/regulatory review.
- Long-term ecosystem features must not delay current revenue foundations or destabilize the verified website without an evidence-backed decision.

Expanded delegated-authority rule:

The Main Project Director may proceed with routine, reversible, evidence-backed architecture, research, internal prototypes, mock data, schemas, templates, QA systems, documentation, issues, and isolated PRs. The director must challenge or reject owner/agent proposals that create safety, clinical-scope, privacy, security, legal, rights, financial, duplicated-system, premature-complexity, or Production risk, and must provide a safer alternative.

Protected approvals remain required for budgets and paid spend, credentials and external writes, legal facts and publication acceptance, real customer/child/health data, Production migrations or writes, real bookings, outbound messages, public medical/therapy/rehabilitation/qualification claims, and clinician-supervised decisions.
