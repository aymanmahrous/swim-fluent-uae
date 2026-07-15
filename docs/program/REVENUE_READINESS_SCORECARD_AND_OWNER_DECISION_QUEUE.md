# Revenue Readiness Scorecard and Owner Decision Queue

Last verified: 2026-07-15 (Asia/Dubai)

Status: `REVENUE_READINESS_SCORECARD_AND_OWNER_QUEUE_READY_FOR_MERGE`

This document coordinates the approved `REVENUE-FIRST PARALLEL LAUNCH`. It does not authorize Production writes, migrations, publishing, scheduling, credentials, automatic messaging, Analytics activation, Ads, billing, or spend.

## Status definitions

- **Green** — completion evidence exists and the stated scope is verified.
- **Amber** — authorized or partially evidenced, but required deliverables or gates remain incomplete.
- **Red** — blocked by a mandatory dependency, missing factual input, or unproven Live readiness.

## Executive summary

- PR #52 is merged and Production read-only verified for its approved public-claims scope.
- PR #65 is merged at `4fb7efdc02b3298b95ff157d693e4926b60a75c7`, but `PROJECT_HANDOFF.md` still contains pre-merge wording; Issue #73 tracks the isolated correction.
- Batch A1 remains the first hard commercial gate and is not closed.
- Planning may continue in parallel for content, SEO, Local SEO, Privacy/Analytics, publishing readiness, Lead Operations, the 90-day strategy, Replit Command Center, and Quality governance.
- Organic Pilot, Analytics activation, automatic messaging, and paid acquisition remain blocked.
- Issue #66 was closed as superseded by #69, and Issue #67 was closed as superseded by #68.
- PR #72 CI run #342 passed; this document was content-reviewed and finalized for merge.

## Revenue Readiness Scorecard

| Workstream | State | Latest verified evidence | Blocking dependency | Owner / issue | Next safe action | Owner approval required | Production impact | Completion condition |
|---|---|---|---|---|---|---|---|---|
| PR #52 release and Production verification | Green | Merged at `a0fbcbefcbe3c9dc2eff93b6c144576d411b1e90`; Arabic/English Production read-only verification completed | None for completed scope | #54 | Preserve evidence and regression boundaries | No for read-only documentation | None | Completed evidence remains reproducible |
| Handoff synchronization | Amber | PR #65 merged; stale wording remains in current Handoff | Issue #73 correction and QA | #73 | Correct only current operational state | No for isolated documentation; merge requires QA | None | Main Handoff matches current Issues and PRs |
| Batch A1 visual closure | Red | Required evidence is defined; no 23/23 completion evidence recorded | Inventory, Cairo/weight proof, Arabic visual review, export/safe-margin review, approval pack | #56 | Start read-only asset inventory | Final owner approval before public use | None | 23/23 verified, corrected, re-verified and approved |
| 30-day bilingual content plan | Amber | Planning authorized; boundaries defined | Complete calendar, captions, CTAs, briefs, QA and approval queue | #57 | Produce planning-only calendar | Final approval before scheduling/publishing | None | 30 days complete in Arabic/English with QA status |
| SEO audit | Amber | Foundations exist; audit scope defined | Crawl, metadata/indexability, internal links, structured data, mobile/CWV evidence | #58 | Complete read-only bilingual audit | Approval for later implementation PRs | Read-only now | Evidence pack and prioritized backlog complete |
| Local SEO | Red | Readiness requirements defined | Verified NAP, address policy, service areas, hours, categories and GBP facts | #58 | Prepare factual decision pack | Yes for facts and any GBP write | None | Verified factual pack and readiness audit complete |
| Privacy and Consent | Red | Draft PR #46 exists with unresolved decisions | Retention, controller/contact facts, consent/withdrawal and legal-review needs | #59 / PR #46 | Consolidate owner decision pack | Yes for factual/legal acceptance and publication | None | Approved facts and required review recorded |
| Analytics and Attribution | Red | GA4 via `gtag.js`, flag off, no PII, `booking_complete` primary | Privacy/Consent, contract closure, deduplication and Production test policy | #59 | Finalize Preview-only plan | Yes before Production activation or migration | None now | Consent-safe Preview evidence and explicit activation approval |
| Publishing readiness | Red | Contracts exist; Live readiness unproven | Ownership/linkage, permissions, credentials, token lifecycle, receipts and retry controls | #60 | Read-only account and receipt audit | Yes for credentials, scheduling or publishing | None | Live prerequisites evidenced and pilot pack approved |
| Repository hygiene | Amber | Open PRs include #51, #49, #46, #36 and #28 | Evidence-backed disposition for each | #61 | Continue comparisons; refresh PR #28 from current main | Routine superseded closure allowed; risky merge gated | None | Every open PR has a verified disposition |
| Lead Operations and Automation | Amber | Planning approved; chatbot/n8n boundaries defined | Privacy/Consent, PII minimization, credential custody, handoff, idempotency and safe-stop | #62 | Produce architecture and phased plan | Yes before Production, credentials, PII or outbound messaging | None now | Architecture and gates approved; Preview precedes Live |
| Revenue scorecard and decision queue | Green | PR #72 content reviewed; CI run #342 passed | Merge of documentation-only PR | #63 / PR #72 | Merge with expected head after final CI | No protected approval required | None | File merged and Issue #63 closed with evidence |
| Integrated 90-day growth strategy | Amber | Consolidated task is #68; duplicate #67 closed | Gap analysis, roadmap, KPIs, cadence and dependencies | #68 | Reuse #56–#63 outputs | Owner review of major strategy choices | None | `INTEGRATED_90_DAY_DIGITAL_GROWTH_STRATEGY_READY` |
| Replit Command Center | Amber | Consolidated task is #69; duplicate #66 closed; owner reports build started | Linked artifact/repo evidence, architecture, auth and read-only data model | #69 | Record and inspect current build | Yes for credentials or write integrations | Separate app only | Blueprint accepted and MVP verified safe/read-only |
| Integrated Quality Department | Amber | Issue #71 defines cross-asset gates | Policy, severity model, checklists, evidence receipt and rework SLA | #71 | Create operating model linked to #56/#57/#69 | Final public-release decisions remain gated | None | `INTEGRATED_QUALITY_DEPARTMENT_OPERATING_MODEL_READY` |
| Organic Pilot | Red | Gate sequence defined | Batch A1, content, measurement, account readiness, receipts, lead ownership and stop rules | #60 / #54 | Prepare checklist and draft schedule only | Explicit publishing approval | No action allowed | All gates Green and limited pilot approved |
| Google Ads | Red | Ordered after Organic Pilot and conversion proof | Privacy/Consent, GA4, booking, mobile, follow-up, budget, keywords and stop-loss | #54 / #68 | Planning only | Explicit budget, billing and spend approval | None | Conversion proof and all gates approved |
| Meta Ads | Red | Strategically later than Google Ads | Organic/Google learning, creative proof, measurement and budget | #54 / #68 | Defer implementation | Explicit budget, billing and spend approval | None | Prior stages proven and separate approval granted |
| International Phone Phase B | Red | PR #36 explicitly blocked and deferred | Approved/applied Phase A and compatibility proof | PR #36 | Read-only status review only | Yes for merge, migration and rollout | Potential Production impact | Phase A prerequisites and rollout approval satisfied |
| Accessibility/mobile backlog | Amber | Issue #43 records labels, contrast and sticky offset | Isolated implementation and accessibility/visual evidence | #43 | Prepare separate fix scope when prioritized | Routine PR allowed; merge requires QA | Reviewed site change only | Evidence passes mobile/desktop without scope mixing |

## Owner Decision Queue

Only decisions requiring factual, legal, financial, credential, PII, or protected Production input are listed. No deadline is invented.

### ODQ-01 — Verified Local SEO business facts
- **Decision:** Confirm canonical NAP, address visibility, service areas, hours, categories and approved phone details.
- **Recommendation:** One verified fact sheet reused everywhere.
- **Alternatives:** Service-area-only where valid; defer GBP writes.
- **Risk/cost:** Inconsistent or invented facts harm trust and local performance.
- **Safe default:** No GBP/citation write and no invented local pages.
- **Dependency:** Local SEO and Organic Pilot discoverability.

### ODQ-02 — Privacy/Consent factual and legal acceptance
- **Decision:** Confirm controller/contact facts, retention, consent/withdrawal and legal-review need.
- **Recommendation:** Approve facts first, then targeted legal review where needed.
- **Alternatives:** Keep Analytics disabled and policies unpublished.
- **Risk/cost:** Incorrect legal text or unsupported practices.
- **Safe default:** PR #46 remains Draft; GA4 off; no new chatbot PII.
- **Dependency:** Analytics and chatbot data governance.

### ODQ-03 — Production Analytics test and activation policy
- **Decision:** Define permitted Production verification, operator, no-PII evidence and disable/rollback process.
- **Recommendation:** Preview proof first, then narrow time-bounded verification after Privacy/Consent approval.
- **Alternatives:** Keep Production Analytics disabled.
- **Risk/cost:** PII leakage, duplicated conversions or untrusted data.
- **Safe default:** Feature flag off.
- **Dependency:** Organic Pilot measurement.

### ODQ-04 — Publishing account ownership and credential custody
- **Decision:** Confirm Facebook, Instagram and Meta Business ownership, permissions and secure custodian.
- **Recommendation:** Read-only verification first; no credentials before pilot gate review.
- **Alternatives:** Owner-controlled manual pilot with receipts.
- **Risk/cost:** Account loss, unauthorized or duplicate publishing.
- **Safe default:** No scheduling or publishing.
- **Dependency:** Issue #60 and Organic Pilot.

### ODQ-05 — Lead Operations consent, PII and human handoff
- **Decision:** Approve minimum data, retention, consent basis, Staff visibility and escalation owner.
- **Recommendation:** User-initiated approved FAQs/routing, minimum data, mandatory human escalation.
- **Alternatives:** Link-only assistant with no retained PII.
- **Risk/cost:** Overcollection, unsafe advice or unauthorized messaging.
- **Safe default:** Architecture only; no credentials, retention or outbound automation.
- **Dependency:** Issue #62.

### ODQ-06 — Organic Pilot success and stop rules
- **Decision:** Approve channels, limited post count, publisher, lead owner, success indicators and stop conditions.
- **Recommendation:** Small human-approved pilot after every gate is Green with immutable receipts.
- **Alternatives:** Continue internal review without publishing.
- **Risk/cost:** Wasted demand, duplicate or incorrect posts.
- **Safe default:** No publishing.
- **Dependency:** Batch A1, content, measurement and publishing readiness.

### ODQ-07 — Paid acquisition budget and stop-loss
- **Decision:** Later provide real Google Ads ceiling, billing owner, limits, acceptable lead cost and stop rules.
- **Recommendation:** Defer until Organic Pilot and `booking_complete` proof.
- **Alternatives:** Continue organic/search only.
- **Risk/cost:** Uncontrolled financial loss with unproven tracking.
- **Safe default:** No billing, campaign, conversion import or spend; Meta remains later.
- **Dependency:** Conversion proof and lead follow-up readiness.

### ODQ-08 — Replit protected integration scope
- **Decision:** Confirm current Command Center Hub ownership/link and later allowed authenticated read-only GitHub data.
- **Recommendation:** Read-only MVP, no PII, no browser secrets, no production-site replacement.
- **Alternatives:** Safe sample data until security review.
- **Risk/cost:** Cross-system writes or exposed credentials.
- **Safe default:** Sample or non-sensitive GitHub-derived metadata only.
- **Dependency:** Issue #69 evidence.

## Immediate safe execution order

1. Merge PR #72 only after its latest head CI succeeds.
2. Execute Issue #73 as a separate Handoff-only correction.
3. Start Batch A1 23/23 evidence inventory in #56.
4. Continue planning/read-only work in #57–#62 and #68–#71 without crossing protected gates.
5. Complete PR/backlog dispositions in #61, including refreshing rather than merging stale PR #28.
6. Update Program Board #54 after each agent deliverable.

## Mandatory boundaries

- No Batch A2 before Batch A1 closure.
- No Production migration, migration repair or migration-history editing.
- No Production test booking or customer-record creation without an approved policy.
- No PII in Analytics or advertising.
- No new chatbot PII retention or automatic outbound messaging before Consent and human-handoff approval.
- No credentials, publishing, scheduling, Ads, billing or spend without dedicated gates.
- Organic Pilot precedes paid Ads; Google Ads precedes Meta Ads.
- GitHub and Vercel remain production-site sources of truth; Replit is a separate management app.
- No track is Green without evidence and QA.