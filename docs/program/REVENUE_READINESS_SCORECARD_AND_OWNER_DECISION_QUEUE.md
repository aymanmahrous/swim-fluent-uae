# Revenue Readiness Scorecard and Owner Decision Queue

Last verified: 2026-07-15 (Asia/Dubai)

Status: `REVENUE_READINESS_SCORECARD_AND_OWNER_QUEUE_DRAFT_READY_FOR_REVIEW`

This document coordinates the approved `REVENUE-FIRST PARALLEL LAUNCH`. It does not authorize Production writes, migrations, publishing, scheduling, credentials, automatic messaging, Analytics activation, Ads, billing, or spend.

## Status definitions

- **Green** — completion evidence exists and the stated scope is verified.
- **Amber** — authorized or partially evidenced, but required deliverables or gates remain incomplete.
- **Red** — blocked by a mandatory dependency, missing factual input, or unproven Live readiness.

## Executive summary

- The public-claims release represented by PR #52 is merged and Production read-only verified.
- PR #65 is merged, but the operational Handoff text still contains pre-merge wording describing PR #65 as open; a narrow Handoff correction is required.
- Batch A1 remains the first hard commercial gate and is not closed.
- Planning may continue in parallel for content, SEO, Local SEO, Privacy/Analytics, publishing readiness, Lead Operations, the 90-day strategy, the Replit Command Center, and Quality governance.
- Organic Pilot, Analytics activation, automatic messaging, and paid acquisition remain blocked.
- Issue #66 was closed as superseded by #69, and Issue #67 was closed as superseded by #68.

## Revenue Readiness Scorecard

| Workstream | State | Latest verified evidence | Blocking dependency | Owner / issue | Next safe action | Owner approval required | Production impact | Completion condition |
|---|---|---|---|---|---|---|---|---|
| PR #52 release and Production verification | Green | PR #52 merged at `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`; Arabic/English Production read-only verification completed | None for the completed scope | Program Board #54 | Preserve evidence and regression boundaries | No for read-only documentation | None | Completed release evidence remains reproducible and no regression is found |
| Handoff synchronization | Amber | PR #65 merged at `4fb7efdc02b3298b95ff157d693e4926b60a75c7` | `PROJECT_HANDOFF.md` still describes PR #65 as open and lists pre-merge next actions | Program Board #54 | Create a narrow documentation-only correction | No for a reversible isolated documentation PR; merge still requires QA under governance | None | Main Handoff accurately reflects current Issues, PRs, blockers, and next action |
| Batch A1 visual closure | Red | Required 23/23 inventory and visual/export/font evidence are defined; no completion evidence is recorded | 23/23 inventory, Cairo/weight proof, Arabic visual review, export/safe-margin review, Owner Approval Pack | #56 | Perform read-only asset inventory and evidence collection | Owner approval of final pack before closure/public use | None | 23/23 verified, findings corrected and re-verified, approval pack accepted |
| 30-day bilingual content plan | Amber | Planning is authorized; scope and boundaries are defined | Completed calendar, captions, CTA/media briefs, dependencies, QA and approval queue | #57 | Produce planning-only calendar using approved claims and Batch A1 dependency flags | Final content approval before scheduling/publishing | None | 30 days complete in Arabic/English with QA and approval status |
| SEO audit | Amber | Foundations exist; audit deliverables are defined | Production crawl, metadata/indexability matrix, internal links, structured data, mobile/CWV evidence | #58 | Complete read-only bilingual audit and prioritized isolated backlog | Approval only for subsequent implementation PRs that change the site | Read-only now | Evidence pack completed and implementation backlog prioritized |
| Local SEO | Red | Readiness scope is defined | Verified NAP, address visibility, service areas, hours, categories, GBP ownership and factual profile data | #58 | Prepare factual-decision pack without inventing values | Yes for factual business details and any GBP write | None | Verified factual pack and read-only readiness audit complete |
| Privacy and Consent | Red | Draft pack exists in PR #46; unresolved factual/legal decisions are documented | Retention, controller/contact facts, consent wording, withdrawal method, legal review needs | #59 / PR #46 | Consolidate a minimal owner decision pack; keep draft unpublished | Yes for factual/legal acceptance and publication | None | Approved factual inputs and required legal review are recorded |
| Analytics and Attribution | Red | Durable measurement decisions exist: GA4 via `gtag.js`, feature flag off, no PII, `booking_complete` primary | Privacy/Consent approval, event/parameter contract closure, deduplication proof, Production test policy | #59 | Finalize documentation and Preview-only implementation plan | Yes before Production activation or database migration | None now | Consent-safe Preview evidence and explicit Production activation approval |
| Publishing readiness | Red | Contracts exist; Live readiness is unproven | Account ownership/linkage, permissions, server credentials, token lifecycle, receipts, retry and ambiguous-state controls | #60 | Conduct read-only account/readiness audit and receipt gap analysis | Yes for credentials, scheduling or publishing | None | Live prerequisites evidenced and controlled Organic Pilot pack approved |
| Repository hygiene | Amber | Open PRs currently include #51, #49, #46, #36 and #28; #65 is merged | Evidence-based disposition for stale/superseded/deferred PRs | #61 | Compare each PR against current main and issue boundaries; prepare closure/keep recommendations | Routine superseded closure allowed under #70; risky merge remains gated | None | Every open PR has an evidence-backed disposition and current status |
| Lead Operations and Automation | Amber | Strategic planning approved; chatbot/n8n boundaries defined | Privacy/Consent, PII minimization, credential custody, human handoff, idempotency, retry/safe-stop rules | #62 | Produce architecture, data map, consent/handoff rules and phased plan | Yes before Production implementation, credentials, PII collection or outbound messaging | None now | Architecture and implementation gates approved; Preview evidence precedes Live |
| Revenue scorecard and decision queue | Amber | First scorecard draft created in this document | Cross-track evidence updates and review | #63 | Review against Issue/PR evidence and update after each major phase | No for routine documentation | None | Current, evidence-backed scorecard and prioritized owner queue accepted |
| Integrated 90-day growth strategy | Amber | Current consolidated task is Issue #68; older duplicate #67 closed | Full gap analysis, phased roadmap, KPIs, operating cadence and dependencies | #68 | Produce strategy from outputs of #56–#63 without duplicating work | Owner review of major strategic choices | None | `INTEGRATED_90_DAY_DIGITAL_GROWTH_STRATEGY_READY` with evidence and dependencies |
| Replit Command Center | Amber | Current consolidated task is Issue #69; older duplicate #66 closed; owner reports Command Center Hub build started | Linked Replit artifact/repository evidence, architecture, read-only data-source model, auth/security plan | #69 | Record the existing build link/state, inspect architecture, and align MVP to GitHub source of truth | Yes for credentials, write integrations or access to protected systems | Separate management app only | Blueprint accepted and MVP verified as read-only/no-PII/no-secret by default |
| Integrated Quality Department | Amber | Issue #71 defines gates for design, video, content and product | QA policy, severity model, checklists, evidence receipt and rework SLA | #71 | Create operating model and connect it to #56, #57, #69 and future publishing | Owner approval only for final public release decisions | None | `INTEGRATED_QUALITY_DEPARTMENT_OPERATING_MODEL_READY` |
| Organic Pilot | Red | Gate sequence is defined | Batch A1, content approval, minimum measurement/UTM, account readiness, receipts, lead ownership, success/stop rules | #60 / #54 | Prepare pilot checklist and draft schedule only | Explicit publishing approval required | No action allowed yet | All gates Green and owner approves limited organic publication |
| Google Ads | Red | Approved to occur after Organic Pilot and conversion proof | Privacy/Consent, GA4 approval, stable booking, mobile performance, follow-up SLA, real budget, keywords, stop-loss | #54 / #68 | Planning and keyword/landing-page readiness only | Explicit budget, billing, campaign and spend approval | None | Conversion proof plus all financial and safety gates approved |
| Meta Ads | Red | Strategically later than Google Ads | Google/organic learning, creative proof, measurement, budget and stop-loss | #54 / #68 | Defer implementation; document later readiness criteria | Explicit budget, billing, campaign and spend approval | None | Prior stages proven and separate approval granted |
| International Phone Phase B | Red | PR #36 is explicitly blocked and deferred | Approved/applied Phase A and stacked compatibility proof | PR #36 | Keep isolated; perform read-only status review only | Yes for merge, migration and Production rollout | Potential Production impact; prohibited now | Phase A prerequisites and explicit rollout approval satisfied |
| Accessibility/mobile backlog | Amber | Issue #43 records labels, contrast and sticky-header offset | Separate isolated implementation and visual/accessibility verification | #43 | Prepare isolated fix scope after current priorities permit | Routine PR allowed; merge requires QA | Site change only after reviewed PR | Accessibility evidence passes on mobile/desktop without scope mixing |

## Owner Decision Queue

Only decisions that require a factual, legal, financial, credential, PII, or protected Production input are listed here. No deadline is invented.

### ODQ-01 — Verified Local SEO business facts

- **Decision:** Confirm the public NAP values, whether an address is publicly shown, service areas, opening hours, primary/secondary categories, and approved phone details.
- **Recommendation:** Use one canonical verified fact sheet and reuse it across website, GBP, citations and social profiles.
- **Alternatives:** Service-area-only representation where valid; defer GBP changes until facts are complete.
- **Risk/cost:** Inconsistent or invented facts can harm trust, local rankings and compliance.
- **Safe default:** No GBP/profile/citation write; no invented local landing pages.
- **Dependency:** Local SEO completion and Organic Pilot discoverability.

### ODQ-02 — Privacy/Consent factual and legal acceptance

- **Decision:** Confirm controller/contact facts, retention periods, consent/withdrawal behavior and whether legal review is required before publication.
- **Recommendation:** Approve factual inputs first, then obtain targeted legal review for the final public text where needed.
- **Alternatives:** Keep Analytics disabled and publish no unreviewed policy changes.
- **Risk/cost:** Incorrect legal text or unsupported retention practices create compliance and trust risk.
- **Safe default:** PR #46 remains Draft; GA4 remains off; no new chatbot PII collection.
- **Dependency:** Analytics activation, chatbot data retention and conversion measurement.

### ODQ-03 — Production Analytics test and activation policy

- **Decision:** Define whether controlled Production event verification is permitted, by whom, and with what no-PII evidence and rollback/disable procedure.
- **Recommendation:** Preview proof first; then a narrow, time-bounded Production verification with feature flag and documented event inspection after Privacy/Consent approval.
- **Alternatives:** Keep Production Analytics disabled until organic operations are ready.
- **Risk/cost:** Premature activation may leak PII, duplicate conversions or create untrusted data.
- **Safe default:** Feature flag remains off.
- **Dependency:** Measurement readiness and Organic Pilot reporting.

### ODQ-04 — Publishing account ownership and credential custody

- **Decision:** Confirm the authoritative Facebook Page, Instagram Professional account, Meta Business ownership, permissions and secure server-side credential custodian.
- **Recommendation:** Verify ownership/readiness read-only first; install no credentials until the Organic Pilot gate review.
- **Alternatives:** Manual owner-controlled posting for the first pilot with receipts captured.
- **Risk/cost:** Wrong ownership or unsafe credentials can cause account loss, duplicate posts or unauthorized publishing.
- **Safe default:** No scheduling or publishing.
- **Dependency:** Issue #60 and Organic Pilot.

### ODQ-05 — Lead Operations consent, PII and human handoff

- **Decision:** Approve the minimum lead data, retention, user consent basis, Staff visibility and escalation ownership for chatbot/n8n.
- **Recommendation:** Start with approved FAQs and user-initiated routing; collect the minimum data; require human escalation for uncertainty, complaints, safeguarding, health and exceptions.
- **Alternatives:** Link-only assistant with no retained PII until governance is complete.
- **Risk/cost:** Overcollection, automatic messaging or unsafe advice creates privacy and service risk.
- **Safe default:** Architecture only; no credentials, PII retention or outbound automation.
- **Dependency:** Issue #62 implementation plan.

### ODQ-06 — Organic Pilot success and stop rules

- **Decision:** Approve pilot channels, limited post count, responsible publisher, lead-response owner, success indicators and stop/correction conditions.
- **Recommendation:** Small organic pilot after every listed gate is Green, with human approval per post and immutable publication receipts.
- **Alternatives:** Continue internal review without publishing.
- **Risk/cost:** Launching without follow-up or receipts can waste demand and create duplicate/incorrect posts.
- **Safe default:** No publishing.
- **Dependency:** Batch A1, content, measurement and publishing readiness.

### ODQ-07 — Paid acquisition budget and stop-loss limits

- **Decision:** Later provide a real Google Ads budget ceiling, billing owner, daily/campaign limits, acceptable lead cost and automatic/manual stop rules.
- **Recommendation:** Do not request this decision until Organic Pilot and `booking_complete` conversion proof exist.
- **Alternatives:** Continue organic/search improvements only.
- **Risk/cost:** Undefined spend or unproven conversion tracking can create uncontrolled financial loss.
- **Safe default:** No billing connection, campaign, conversion import or spend; Meta Ads remains later.
- **Dependency:** Organic conversion proof and lead follow-up readiness.

### ODQ-08 — Replit Command Center protected integration scope

- **Decision:** Confirm the current Command Center Hub link/project ownership and, later, which authenticated read-only GitHub data may be connected.
- **Recommendation:** Keep MVP read-only, no PII, no secrets in browser, and no Production-site replacement.
- **Alternatives:** Continue with safe sample data until architecture/security review is complete.
- **Risk/cost:** Uncontrolled write integrations or exposed credentials would create cross-system risk.
- **Safe default:** Prototype/sample or GitHub-derived non-sensitive metadata only.
- **Dependency:** Issue #69 evidence and MVP verification.

## Immediate safe execution order

1. Review and merge this documentation-only scorecard PR after evidence QA.
2. Correct the stale PR #65 wording in `PROJECT_HANDOFF.md` through a separate narrow documentation change or a follow-up commit if kept isolated.
3. Start the Batch A1 23/23 evidence inventory in Issue #56.
4. Continue planning-only work in #57, #58, #59, #60, #62, #68, #69 and #71 without crossing protected gates.
5. Complete read-only PR/backlog dispositions in #61, including PR #28.
6. Update Issue #54 after each agent deliverable with evidence, blocker and next safe action.

## Mandatory boundaries

- No Batch A2 before Batch A1 closure.
- No Production migration, migration repair or migration-history editing.
- No Production test booking or customer-record creation without an approved policy.
- No PII in Analytics or advertising.
- No new chatbot PII retention or automatic outbound messaging before Consent and human-handoff approval.
- No credentials, publishing, scheduling, Ads, billing or spend without their dedicated gates.
- Organic Pilot precedes paid Ads; Google Ads precedes Meta Ads.
- GitHub and Vercel remain the production-site sources of truth; Replit remains a separate management application.
- No track is Green without evidence and QA.