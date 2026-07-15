# PROJECT HANDOFF

Last verified: 2026-07-15 (Asia/Dubai)

This file is the operational source of truth for continuing the existing Relax Fix UAE / Swim Fluent UAE project. Read it with `PROJECT_STRATEGY_HANDOFF.md`, `docs/program/REVENUE_READINESS_SCORECARD_AND_OWNER_DECISION_QUEUE.md`, `docs/program/COMPLETE_DIGITAL_ECOSYSTEM.md`, Program Board Issue #54, and the named Issues/PRs below.

Do not restart, rebuild, or redesign the project from scratch. An open Issue is an assignment, not proof that an agent is actively working or that a deliverable exists. Progress and completion require evidence such as a commit, PR, CI result, Preview, test output, receipt, or reviewed artifact.

## 1. Current repository state

- Repository: `aymanmahrous/swim-fluent-uae`
- Default branch: `main`
- Current execution strategy: `REVENUE-FIRST PARALLEL LAUNCH`
- Long-term product direction: `RELAX_FIX_GROWTH_OS / COMPLETE_DIGITAL_ECOSYSTEM`
- The ecosystem direction expands the capability map; it does not replace the Revenue-First order or bypass current gates.

### Verified merged milestones

- PR #52 merged on 2026-07-15.
  - Reviewed head: `d078bb1336272216f9011e8c1153dc28e1a51910`
  - Squash merge: `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`
  - CI run #333 succeeded.
  - Authoritative visual-evidence run #23 succeeded.
  - Read-only Production verification completed.
- PR #65 merged at `4fb7efdc02b3298b95ff157d693e4926b60a75c7`; Issue #64 closed.
- PR #72 merged at `d4f53097ed960da075a2331eaabc61f6539dd0c3` after CI #343; Issue #63 closed.
- PR #74 merged at `b36b35de2c6f23d46637f5fb61f3d2e4b6c1f767` after CI #346; Issue #73 closed.
- PR #89 passed CI #350 and merged at `642190e8cfddd48ae24d3b0e854160a4b18c1a4d`.
  - `PROJECT_STRATEGY_HANDOFF.md` now contains the durable Complete Digital Ecosystem strategy.
  - `docs/program/COMPLETE_DIGITAL_ECOSYSTEM.md` is on `main`.
- PR #93 passed CI #352 and merged at `fe48cd48d87d94625701575c5016847548244d2f`.
  - `docs/media/SMART_MEDIA_LIBRARY_OPERATING_MODEL.md` is on `main`.
- PR #94 passed CI #355 and merged at `246632faef65e3f55534df3a2e15d1568c05bfdd`.
  - It recreated the isolated canonical URL correction from current `main`.
  - No Production workflow was executed by PR #94.

### Repository hygiene

- PR #51 was closed without merge as superseded and must not be used as the current Handoff.
- PR #28 was closed without merge as superseded by PR #94.
- PR #49 was closed without merge as superseded by PR #52.
- PR #46 remains an intentionally gated Draft for Privacy/Consent copy and owner/legal decisions.
- PR #36 remains an intentionally gated Draft for International Phone Phase B and must not be merged as-is.
- Issues #66 and #67 remain closed as superseded by #69 and #68 respectively.

No database migration, booking submission, Production write, Analytics activation, publishing, scheduling, chatbot/n8n activation, Ads, billing, or spend was part of the documentation and repository-hygiene milestones above unless explicitly stated otherwise.

## 2. Verified public website and Production state

PR #52 aligned Arabic and English public pages with approved public-claims boundaries.

Verified completed scope:

- approved CTA preserved:
  - Arabic: `طلب تقييم أولي`
  - English: `Request an initial assessment`
- unverified `15+ yrs` replaced with:
  - Arabic: `تدريب شخصي`
  - English: `Personal Coaching`
- adaptive program card, supportive aquatic movement, and People of Determination public booking category removed
- adaptive wording removed from public metadata and Person `knowsAbout`
- unverified Organization `founder` relationship removed
- public-claims sanitizer and direct contracts strengthened

Verified Production deployment after PR #52:

- Vercel project: `swim-fluent-uae-w532`
- Project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Deployment ID: `dpl_BBBZzpwUqQe6eg9jxWRifY8rmG9z`
- State: `READY`
- Target: `production`
- Git commit: `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`
- Aliases include `www.relaxfixuae.com` and `relaxfixuae.com`
- Arabic `/` and English `/en` returned HTTP 200 in read-only verification.
- The first booking-form step rendered without submitting data.

Approved Business Settings:

- `opening_offer_text_ar`: `طلب تقييم أولي`
- `opening_offer_text_en`: `Request an initial assessment`

Independent static assessment copy:

- Arabic: `مناقشة أولية لمعرفة نقطة البداية`
- English: `Initial conversation to understand your starting point`

Do not publish or restore unapproved claims, including free/complimentary wording, unverified years of experience, unverified founder relationships, unverified credentials, Adaptive Swimming, Aquatic Rehabilitation, therapy, treatment, medical, diagnostic, or similar professional claims without separate evidence and approval.

## 3. Governance and delegated authority

### Issue #54 — Program Board

`PROGRAM_COORDINATION_AGENT`

Coordinates dependencies, evidence, owner gates, and the Revenue-First tracks. Its open state is not evidence that every child agent is active.

### Issue #70 — Delegated authority

Status: `DELEGATED_AUTHORITY_ACTIVE_WITH_PROTECTED_BOUNDARIES`

The Main Project Director may proceed without repeated owner confirmation for routine, reversible, evidence-backed work, including:

- issue and board maintenance
- documentation, briefs, internal designs, schemas, templates, mock-data prototypes, and small isolated PRs
- factual repository cleanup and stale-document correction
- read-only audits
- evidence-backed QA and routine non-protected merges after required CI/QA
- safe prioritization of independent work while another task is blocked

Protected approval remains required for:

- budgets, billing, paid spend, and stop-loss values
- credentials and external writes
- legal/regulatory acceptance and unverified public professional or medical claims
- real bookings or customer records
- Production migrations, destructive database changes, migration repair, or manual migration-history edits
- new identifiable lead, customer, child, family, disability, diagnosis, health, or safeguarding data
- automatic outbound WhatsApp, email, or SMS
- Production publishing, scheduling, Analytics activation, Ads, or other irreversible actions

The director must challenge unsafe proposals and provide a safer alternative. Missing protected facts belong in the Owner Decision Queue; they must not be invented.

## 4. Revenue-First tracks

### Issue #56 — Batch A1

Status: `BATCH_A1_23_OF_23_MANIFEST_EVIDENCE_RECOVERED_VISUAL_AND_FONT_WEIGHT_PROOF_BLOCKED`

Verified partial evidence:

- 23/23 filenames and manifest entries recovered
- automated records report 1080×1350, RTL, glyph, contrast, mobile, safe-zone, and CTA checks
- source/rights record recovered

Still blocked:

- 23/23 individual PNGs or complete contact sheet for human Arabic visual review
- Cairo Bold/SemiBold proof conflicts with the recovered Cairo Regular/weight 400 binary evidence
- final export review, finding log, and Owner Approval Pack are incomplete

No Batch A2, scheduling, or publishing before Batch A1 closure unless an explicit exception is approved.

### Issue #57 — 30-day content plan

Status: authorized for planning, not proven complete.

Allowed now:

- bilingual 30-day calendar
- captions, CTAs, media briefs, UTM placeholders, dependencies, and owner-review queue

Not allowed yet:

- Batch A2 production
- scheduling
- publishing

### Issue #58 and Issue #79 — SEO, Local SEO, and conversion audit

Status: foundations exist; read-only audit and implementation remain incomplete.

Required evidence includes:

- Production crawl and indexation
- Arabic/English metadata matrix
- keyword-to-page and internal-link map
- structured-data validation
- mobile/Core Web Vitals baseline
- NAP, service-area, opening-hours, category, GBP, citation, and review-workflow decisions
- bilingual booking/WhatsApp journey, trust, accessibility, CTA hierarchy, form labels, validation, sticky-header, and friction audit

No Search Console or Google Business Profile write, invented business fact, Production booking, or Analytics activation.

### Issue #59 and PR #46 — Privacy, Consent, Analytics, and attribution

Status: durable measurement contract exists; Privacy/Consent decisions and implementation remain gated.

Durable decisions:

- GA4 via `gtag.js`
- no GTM in Phase 1
- feature flag off by default
- no PII in Analytics
- `booking_complete` is the primary conversion
- `conversation_start`, `whatsapp_click`, and `call_click` are secondary conversions
- consent rejection must not block the website or booking form

No Production Analytics activation before Privacy and Consent approval. PR #46 is not legal/publication approval.

### Issue #60 — Publishing readiness

Status: partial contracts exist; Live readiness is unproven.

Required evidence:

- account ownership and linkage
- permissions and credential custody
- token lifecycle
- publication receipts
- retry and ambiguous-state rules
- duplicate prevention
- human approval

No credentials installation, scheduling, publishing, Boost, Ads, or spend.

### Issue #62 — Lead Operations and Automation

Status: strategically approved; planning only; implementation not authorized.

Includes controlled bilingual chatbot, Staff handoff/CRM design, and n8n alerts/summaries. Privacy, Consent, security, human escalation, credentials, idempotency, duplicate prevention, audit, retry, and safe-stop gates remain mandatory.

## 5. Replit Command Center

The separate internal application is `Command Center Hub`. GitHub and Vercel remain authoritative for the customer website. Replit is not a replacement for the Production website or database.

### Issue #69 — Command Center product architecture

Status: architecture/product workstream active, but active execution requires evidence.

### Issue #76 — Phase 1 persistent foundation

Verified status on 2026-07-15:

`REPLIT_PHASE_1_PAUSED_NO_ACCEPTANCE_EVIDENCE`

Evidence available:

- the Replit app exists
- the earlier browser prototype has 17 navigable pages, Arabic RTL/English toggle, responsive layout, and browser interactions
- earlier limitations include sample data, browser localStorage, no verified authentication/RBAC/shared persistence/backups/full audit/tests, and placeholder external integrations
- a direct Replit status query returned `phase: paused`
- no completion report was returned

No Phase 1 completion or Production-readiness claim is permitted.

Required before acceptance:

- running Preview evidence
- schema and endpoint inventory
- screen-to-endpoint matrix
- persistence proof across reload and another session
- proof localStorage is not the authoritative project-data store
- audit-event proof for mutations
- passing unit/API/UI/e2e tests for critical lifecycles
- malformed-input validation evidence
- Arabic/English, RTL, accessibility, mobile, loading/empty/error-state review
- known limitations and rollback note

### Issue #77 — Phase 2 security

Status: `PHASE_2_PLANNED_BLOCKED_BY_PHASE_1_ACCEPTANCE`

Authentication, roles, least privilege, secure sessions, recovery, server authorization, and negative-access tests must not start as implementation until #76 passes.

### Issue #78 — reliability and hardening

Status: `RELIABILITY_PLANNING_AUTHORIZED_IMPLEMENTATION_GATED`

Planning may continue, but backup/restore, observability, performance, incident readiness, and production-readiness claims remain gated by #76 and #77.

## 6. Complete Digital Ecosystem workstreams

PR #89 documented the durable architecture. Issues remain open according to their exact states; open does not equal active autonomous execution.

### Issue #80 — Complete Digital Ecosystem architecture

Status: architecture is documented on `main`; broader execution mapping remains an open workstream.

### Issue #81 — Aquatics Evidence Center

Status: `INITIAL_OFFICIAL_EVIDENCE_REGISTRY_STARTED`

Initial official entries were recorded for:

- STA/Safety Training Awards swimming-teaching and aquatics qualifications
- STA Water Safety Code and education
- STA online-learning directory and listed Autism Swim modules

Current limitation: these entries do not yet prove course prerequisites, cost, assessment, validity, UAE recognition, clinical scope, or effectiveness. Named-course recommendations require the dedicated current certification audit and official/primary sources.

### Issues #82–#88

These are authorized product/design workstreams, not verified completed implementations:

- #82 AI Swimming Education Assistant — design authorized
- #83 Adaptive Aquatics Education Assistant — design authorized
- #84 aquatic exercise/rehabilitation scope and referral governance — authorized
- #85 Knowledge Base and Decision Memory — architecture authorized
- #86 Social Media Intelligence Center — architecture authorized
- #87 Owner Intelligence Dashboard and Notification Center — architecture authorized
- #88 Learner Progress and Family Plan System — architecture authorized

No issue in #82–#88 may be described as implemented without a reviewed artifact, commit/PR, tests, or equivalent evidence.

### Issue #91 — Smart Media Library

Status: `SMART_MEDIA_LIBRARY_STRUCTURE_CREATED_WORKFLOW_AUTHORIZED`

Verified:

- Google Drive canonical working root exists: `Relax Fix Growth OS - Media Library`
- 12 bilingual folders exist from `00_UPLOAD_INBOX - صندوق الرفع` through `11_ARCHIVE - الارشيف`
- Google Drive is the canonical working media and approval source
- Dropbox was inventoried read-only and remains an intake/archive source until an exact mutation plan is approved
- no Dropbox moves, copies, or deletions were performed
- PR #93 merged the operating model

No facial recognition, disability/diagnosis/health inference, automatic moving/deleting, or unapproved child-sensitive/certificate publication.

### Issue #92 — Coach Ayman Mobile App

Status: `MOBILE_APP_ARCHITECTURE_AUTHORIZED_IMPLEMENTATION_GATED`

Phase M0 product/UX architecture may proceed. Production mobile coding is blocked until Command Center Phase 1 acceptance and security architecture. The mobile app must not create a duplicate source of truth.

## 7. Data, safety, and clinical-scope default

Until Privacy/Consent, security, role access, retention, correction, deletion, sharing, vendor, safeguarding, and incident rules are approved:

- do not store real identifiable learner, child, family, disability, diagnosis, health, safeguarding, lead, or customer data
- use anonymous codes, fictional/sample records, schemas, templates, and evaluation cases only
- clearly distinguish sample records from verified project or business data

AI or product recommendations must be evidence-referenced, show assumptions and limitations, remain coach-editable, and require coach review. The system must not diagnose, prescribe clinical treatment, independently design clinician-supervised rehabilitation, guarantee outcomes, or recommend forced submersion, forced eye contact, coercive exposure, punishment, restraint, unsafe breath-holding, or unsupervised child instruction.

## 8. Quality Department

### Issue #71

Status: active operating-model and governance workstream; no completion claim without deliverables.

Required quality system includes:

- severity model
- design, video, content, website, and product checklists
- evidence receipts
- approval/rejection/rework states
- rework SLA
- Arabic/English, rights, factual-claims, accessibility, privacy, safety, and source checks

QA approval does not authorize publishing, Production deployment, credentials, or protected writes.

## 9. Approved execution order

The durable Revenue-First order remains:

1. Close Batch A1.
2. SEO.
3. Local SEO.
4. Analytics and attribution.
5. Publishing readiness.
6. Lead Operations and Automation planning; implementation gated.
7. Organic Pilot after all gates.
8. Google Ads after conversion proof.
9. Meta Ads later.

For the current continuation session, the immediate operational sequence is:

1. Complete Issue #90 through a narrow Handoff-only PR, CI, factual review, and owner-controlled merge.
2. Resolve Issue #76 truthfully: resume/finish Replit Phase 1 and collect all acceptance evidence, or keep it blocked/paused with a documented evidence gap. Do not close it merely because it is open or assigned.
3. Continue content priorities in #57 without Batch A2 production or publishing.
4. Continue SEO/Local SEO and conversion-readiness work in #58 and #79 through read-only evidence and isolated implementation proposals.
5. Close Privacy/Consent decisions in #59/PR #46 before Analytics activation or sensitive data.
6. Continue Quality governance in #71 and apply it to every new artifact.
7. Continue #81, #91, and architecture work only where it does not delay current revenue foundations or cross protected gates.

The immediate sequence above does not waive Batch A1, Privacy/Consent, security, publishing, financial, or Production gates.

## 10. Current blockers

- Batch A1 human visual review and font-weight proof are incomplete.
- Replit Phase 1 is paused with no acceptance evidence.
- Phase 2 security and reliability implementation are gated.
- Local SEO factual values and GBP decisions are incomplete.
- Privacy/Consent and owner/legal decisions remain open.
- Publishing account and Live receipt evidence are incomplete.
- No real learner/child/health data controls are approved.
- Organic Pilot gates are not satisfied.
- Conversion proof does not exist for paid advertising.
- International Phone Production rollout remains deferred.
- Production migration history is not approved for `db push`, repair, or manual editing.

## 11. Mandatory safety rules

- No automatic merge.
- No Production migration without explicit approval and an approved plan.
- No `supabase db push` or `supabase migration repair` against Production.
- No manual editing of Production migration history.
- No Production test booking or customer-record creation without an approved test policy.
- No Production-writing workflow without explicit approval.
- No automatic feature-flag activation.
- No Batch A2 before Batch A1 closure unless explicitly approved.
- No publishing or scheduling without explicit gate, human approval, and evidence.
- No automatic outbound chatbot, WhatsApp, email, or SMS.
- No Ads, billing, conversion import, or spend without a budget ceiling, stop-loss rules, and separate approval.
- No unapproved public claims, credentials, medical/therapy/rehabilitation claims, or invented business facts.
- No PII in Analytics or advertising systems.
- No credentials, tokens, private links, or secrets in public records or browser code.
- No mixing unrelated workstreams in one PR.
- Do not describe contract-tested or assigned work as Live, active, complete, or Production-ready without matching evidence.

## 12. Owner Decision Queue

Source: `docs/program/REVENUE_READINESS_SCORECARD_AND_OWNER_DECISION_QUEUE.md`

Every decision entry must contain:

- decision
- recommendation
- alternatives
- risks/costs
- safe default while unanswered
- dependency/deadline
- impact of delay

Silence does not authorize Production, migrations, credentials, real data, Analytics activation, publishing, scheduling, messaging, Ads, billing, spend, or merge.

## 13. Handoff maintenance

At the end of every approved major phase:

1. Update `PROJECT_HANDOFF.md` with verified facts, commits, PRs, tests, Preview/Production distinctions, blockers, and next approved action.
2. Update `PROJECT_STRATEGY_HANDOFF.md` only when a durable approved strategy decision changes.
3. Record evidence and distinguish assigned, planned, contract-tested, Preview-tested, and Production-verified states.
4. Ensure a new agent can continue without prior chat history.
5. Never use an open Issue as evidence that an agent is working or has delivered.