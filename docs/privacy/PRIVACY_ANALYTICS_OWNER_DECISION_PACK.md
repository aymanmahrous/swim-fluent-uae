# PRIVACY, CONSENT, AND ANALYTICS OWNER DECISION PACK

Status: `PRIVACY_ANALYTICS_OWNER_DECISION_PACK_READY_OWNER_AND_LEGAL_DECISIONS_PENDING`

Prepared: 2026-07-15 (Asia/Dubai)

Parent workstream: Issue #59

Related sources:

- `docs/analytics/ANALYTICS_MEASUREMENT_CONTRACT.md`
- Draft PR #46
- `docs/privacy/PRIVACY_AND_CONSENT_COPY_PACK.md` on the PR #46 branch
- `docs/privacy/PR46_COPY_CORRECTIONS_AND_OWNER_DECISIONS.md` on the PR #46 branch
- Issue #59 sensitive learner-data expansion
- `PROJECT_HANDOFF.md`
- `PROJECT_STRATEGY_HANDOFF.md`

This document consolidates decisions and gaps. It is not legal advice, legal approval, Privacy Policy publication approval, Consent UI approval, Analytics implementation approval, Production activation, or authorization to collect new data.

## 1. Executive decision summary

The following Phase 1 product/measurement decisions are already documented and should remain unchanged unless the contract is formally amended:

- Google Analytics 4 through `gtag.js`
- no Google Tag Manager in Phase 1
- Analytics feature flag disabled by default
- affirmative consent before GA4 initializes or sends events
- rejection must not block the website, booking, calls, or WhatsApp
- `booking_complete` is the primary conversion
- `whatsapp_click`, `call_click`, and `conversation_start` are secondary conversions
- `view_service` and detailed form-step events remain deferred
- no PII or sensitive data in Analytics
- no GCLID, GBRAID, WBRAID, or FBCLID storage in Phase 1
- no Staff attribution UI or database attribution in Phase 1
- no Production booking test by default
- no Production Analytics activation until all legal/copy/implementation/test gates and explicit owner approval pass

The major unresolved area is not the event vocabulary. It is the real-world privacy operating model: public/legal identity, minors and guardians, sensitive booking values, retention, Staff access, privacy-request handling, provider configuration, backups/logs, and future learner/child/adaptive records.

## 2. Decision-state vocabulary

| State | Meaning |
|---|---|
| `CONTRACT_DECISION_RECORDED` | Product/measurement direction exists in the merged Analytics contract; implementation is still not authorized. |
| `OWNER_FACT_REQUIRED` | Repository evidence cannot establish the real business fact. |
| `OWNER_DECISION_REQUIRED` | The owner must choose an operating rule. |
| `OWNER_AND_LEGAL_REVIEW_REQUIRED` | A decision affects legal/privacy wording or obligations and should not be invented by the product team. |
| `PROVIDER_EVIDENCE_REQUIRED` | Live account settings, regions, logs, backups, processors, or retention must be verified from the provider/account. |
| `IMPLEMENTATION_GATED` | Decision may be documented, but code/configuration/activation remains a separate scope. |
| `SAFE_DEFAULT_ACTIVE` | The least risky temporary behavior applies while unanswered. |

Silence does not equal consent, implementation approval, publication approval, or Production activation.

## 3. Required owner decision table

### D01 — Final public/legal identity

- **Decision:** Confirm the exact public business name, legal/operating entity name if different, and capacity in which the Privacy Policy is published.
- **Recommendation:** Publish only the factual entity/operating identity supported by business records; do not create a company designation from the brand name alone.
- **Alternatives:** brand-only public identity with a separately confirmed controller identity; individual proprietor identity where factually correct; registered entity identity where factually correct.
- **Risks/costs:** incorrect identity can make privacy requests, notices, contracts, and accountability unclear.
- **Safe default:** keep Privacy routes unpublished and PR #46 Draft.
- **Owner answer required:** exact Arabic and English identity text and supporting evidence location.
- **Dependency:** final Privacy copy and legal review.
- **Impact of delay:** Analytics and new sensitive-data processing remain blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D02 — Privacy contact channel

- **Decision:** Approve the email/phone/channel for privacy requests and who monitors it.
- **Recommendation:** Use a controlled business inbox with documented owner, access, acknowledgment, identity-verification, and closure workflow; do not assume the current public email is the final privacy contact.
- **Alternatives:** dedicated privacy inbox; general business inbox with tagged workflow; documented postal/other channel if required and factually available.
- **Risks/costs:** requests may be lost, exposed to excessive Staff access, or answered inconsistently.
- **Safe default:** no published promise or response timeline.
- **Owner answer required:** channel, custodian, backup custodian, and escalation path.
- **Dependency:** Privacy copy and request procedure.
- **Impact of delay:** Privacy pages cannot be finalized.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D03 — Effective date and policy versioning

- **Decision:** Approve effective date, version owner, review frequency, and change-notice method.
- **Recommendation:** Use a version number, effective date, last-reviewed date, and material-change process.
- **Alternatives:** date-only versioning; semantic versioning; policy register linked to deployment receipts.
- **Risks/costs:** inability to prove which notice applied at a given time.
- **Safe default:** placeholder remains; no publication.
- **Owner answer required:** effective date and approver.
- **Dependency:** final facts and legal review.
- **Impact of delay:** no public Privacy route.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D04 — Booking requester, participant, and guardian model

- **Decision:** Decide whether `full_name` belongs to the participant, parent/guardian, or either; determine whether a separate guardian name/relationship/authority field is needed.
- **Recommendation:** Before any child-specific expansion, separate requester/guardian identity from participant identity and collect only fields with an approved purpose. Do not infer guardian authority from a name.
- **Alternatives:** adult-only digital request; requester plus participant minimum fields; offline guardian confirmation after a minimal request.
- **Risks/costs:** ambiguous authority, contact, access, correction, and deletion rights.
- **Safe default:** do not add fields; do not claim the current form establishes guardian consent; use existing flow only within approved public boundaries.
- **Owner answer required:** who may submit, whose name is entered, minimum age, guardian verification, and operational process.
- **Dependency:** booking schema/copy, Privacy notice, Staff procedure.
- **Impact of delay:** child/guardian-specific product expansion remains blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D05 — Minimum age and minor-participant procedure

- **Decision:** Define minimum age, when guardian involvement is required, and how authority/consent is documented.
- **Recommendation:** Obtain UAE-qualified legal review before publishing age/guardian rules; do not invent a numeric threshold.
- **Alternatives:** restrict online requests to adults acting for themselves; allow guardian-submitted requests with explicit process; use a minimal contact request followed by controlled verification.
- **Risks/costs:** invalid consent, safeguarding gaps, unclear communications, or excessive child data.
- **Safe default:** no new child-data fields, accounts, learner profiles, or family-report sharing.
- **Owner answer required:** approved rule and evidence.
- **Dependency:** legal/privacy/safeguarding design.
- **Impact of delay:** real child records and app features remain blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D06 — Sensitive booking values

- **Decision:** Classify fear-of-water and participant-category values; define access, display, export, retention, and Staff handling.
- **Recommendation:** Treat them as restricted operational data in context, collect only where genuinely necessary, and avoid medical interpretation.
- **Alternatives:** remove from the initial form and discuss later; keep structured yes/no/category fields with restricted access; replace with a less sensitive general starting-point question after review.
- **Risks/costs:** sensitive inference, stigma, over-collection, inappropriate Analytics/log exposure.
- **Safe default:** no diagnosis/medical narrative/free text; no transmission to Analytics, prompts, logs, or Ads.
- **Owner answer required:** necessity, purpose, permitted roles, retention, and deletion rule.
- **Dependency:** Privacy copy, Staff RBAC, schema review.
- **Impact of delay:** no expansion of sensitive fields.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D07 — Booking-record retention

- **Decision:** Define active, archived, and deletion periods for booking requests and duplicate-prevention data.
- **Recommendation:** Use a documented purpose-based schedule, not indefinite retention; distinguish active leads, fulfilled/closed requests, declined/cancelled requests, duplicate/idempotency records, backups, and legal holds.
- **Alternatives:** short operational retention plus deletion; archive with restricted access; anonymize selected reporting fields after closure.
- **Risks/costs:** excessive data exposure versus loss of necessary operational/accounting evidence.
- **Safe default:** no automated deletion claim and no new retention promise; do not change Production data.
- **Owner answer required:** duration per state, archive criteria, deletion method, exceptions, and evidence.
- **Dependency:** actual workflow, legal review, backup capability.
- **Impact of delay:** Privacy copy cannot state final retention.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D08 — Communications retention

- **Decision:** Define retention and deletion for WhatsApp, phone notes, and future email/SMS records.
- **Recommendation:** Map each channel/provider, collect minimum necessary content, restrict access, and state where provider-side retention cannot be controlled.
- **Alternatives:** no central message copy; CRM summary with minimized content; provider-native history with documented Staff policy.
- **Risks/costs:** data fragmentation, uncontrolled copies, inconsistent deletion, sensitive free text.
- **Safe default:** no automatic outbound messaging and no new communication archive.
- **Owner answer required:** channels, purpose, custodian, retention, and deletion/escalation process.
- **Dependency:** Lead Operations design and provider evidence.
- **Impact of delay:** automation/messaging implementation remains blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D09 — Provider logs, authentication, backups, and infrastructure retention

- **Decision:** Verify Vercel, Supabase, authentication, storage, backup, and log settings, regions, processors, and retention.
- **Recommendation:** Build a provider register from live account evidence and contracts; use least-access roles and document backup deletion limitations.
- **Alternatives:** provider-default retention with explicit record; reduced logging; separate backup policy.
- **Risks/costs:** policy statements may contradict live configuration; deleted data may persist in backups/logs.
- **Safe default:** do not state exact provider retention/region without evidence.
- **Owner answer required:** account evidence owner and approved settings.
- **Dependency:** provider-account review and legal/privacy review.
- **Impact of delay:** final Privacy disclosures and real sensitive-data launch remain blocked.
- **State:** `PROVIDER_EVIDENCE_REQUIRED`

### D10 — Staff access and audit

- **Decision:** Define roles that may view/update bookings, sensitive fields, attribution, learner records, family reports, and privacy requests.
- **Recommendation:** Least privilege, server-side authorization, periodic access review, and audit events for sensitive reads/exports/changes where appropriate.
- **Alternatives:** single owner-controlled account for MVP; Owner/Staff/Viewer roles; specialist gates for safeguarding or qualified-professional records.
- **Risks/costs:** unauthorized access, inability to investigate changes, excessive operational friction if over-restricted.
- **Safe default:** no new real learner/sensitive records; no Staff attribution UI; current access not described beyond verified evidence.
- **Owner answer required:** role matrix, approvers, review frequency, audit requirements.
- **Dependency:** Replit/Supabase security architecture and Privacy copy.
- **Impact of delay:** Command Center Phase 2 and sensitive-data features remain blocked.
- **State:** `OWNER_DECISION_REQUIRED`

### D11 — Privacy requests: access, correction, export, deletion

- **Decision:** Define intake, identity verification, authority verification, search scope, exception handling, response, deletion completion, and evidence.
- **Recommendation:** Use a controlled case workflow; never delete solely from an unverified email/phone message; distinguish consent withdrawal from deletion.
- **Alternatives:** manual owner workflow; ticketed Staff workflow; specialist/legal escalation for complex requests.
- **Risks/costs:** wrongful disclosure/deletion, unsupported timelines, inconsistent provider handling.
- **Safe default:** no automatic deletion promise or fixed response period until approved.
- **Owner answer required:** exact procedure and accountable role.
- **Dependency:** contact channel, provider register, retention schedule.
- **Impact of delay:** final Privacy Policy cannot be approved.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D12 — Consent UI format

- **Decision:** Confirm the contract decision for a compact bottom banner with equal Accept/Reject choices, Arabic/English, no wall, and a later preferences control.
- **Recommendation:** Retain the merged contract model. Conduct UX/accessibility review and legal copy review before implementation.
- **Alternatives:** compact settings panel linked from banner; granular measurement category only if a real additional category is later introduced.
- **Risks/costs:** deceptive design, inaccessible controls, premature GA4 initialization, or excessive complexity.
- **Safe default:** no Analytics or attribution storage; no banner implementation from this pack.
- **Owner answer required:** accept the product design and approve final copy after review.
- **Dependency:** PR #46 copy decisions and implementation PR.
- **Impact of delay:** Analytics remains off.
- **State:** `CONTRACT_DECISION_RECORDED_OWNER_COPY_APPROVAL_REQUIRED`

### D13 — Privacy route structure

- **Decision:** Confirm future routes `/privacy` and `/en/privacy`, canonical/hreflang/x-default behavior, and footer links.
- **Recommendation:** Retain the merged contract structure; keep routes unpublished until final copy is approved.
- **Alternatives:** a single bilingual route only if SEO/accessibility review supports it; current recommendation remains separate routes.
- **Risks/costs:** placeholder policy indexed publicly, language mismatch, or broken legal navigation.
- **Safe default:** routes absent/unpublished.
- **Owner answer required:** approve final content and publication, not only route names.
- **Dependency:** all facts/decisions in this pack.
- **Impact of delay:** Analytics activation remains blocked.
- **State:** `CONTRACT_DECISION_RECORDED_PUBLICATION_GATED`

### D14 — `view_service` granularity

- **Decision:** Keep `view_service` out of Phase 1 or define a future low-cardinality service taxonomy.
- **Recommendation:** Keep deferred until real service pages/taxonomy exist; do not infer granular interest from homepage section visibility.
- **Alternatives:** one generic `view_service` with approved `service_category`; page-view-only measurement; no event.
- **Risks/costs:** noisy metrics, unstable naming, accidental sensitive categorization, misleading funnel interpretation.
- **Safe default:** no `view_service` event.
- **Owner answer required:** none for Phase 1 if deferral is accepted; later contract amendment required.
- **Dependency:** approved service architecture and event tests.
- **Impact of delay:** no impact on core Phase 1 conversion measurement.
- **State:** `CONTRACT_DEFERRED_RECOMMEND_NO_PHASE1_EVENT`

### D15 — Final CTA ID registry

- **Decision:** Confirm the current stable IDs and whether any new actual controls exist before implementation.
- **Recommendation:** Implement only IDs tied to rendered, tested controls: `header_book`, `hero_book`, `booking_section_submit`, conditional `booking_section_whatsapp`, and conditional `footer_whatsapp`. Reserved IDs emit nothing.
- **Alternatives:** consolidate duplicate placements only if reporting needs allow; maintain placement as a separate parameter.
- **Risks/costs:** double counting, language-dependent IDs, events for controls that do not exist.
- **Safe default:** no events; reserved IDs remain inactive.
- **Owner answer required:** approve registry and any later additions through a contract/test update.
- **Dependency:** current UI audit and implementation tests.
- **Impact of delay:** Analytics implementation remains pending but the website remains functional.
- **State:** `CONTRACT_DECISION_RECORDED_IMPLEMENTATION_GATED`

### D16 — Staff attribution visibility

- **Decision:** Determine whether Staff needs campaign attribution later and which roles may view it.
- **Recommendation:** No Staff attribution UI/database attribution in Phase 1. Later provide read-only normalized campaign fields only after schema, retention, RBAC, and audit approval.
- **Alternatives:** aggregate dashboard only; booking-level read-only snapshot; no Staff visibility.
- **Risks/costs:** campaign data can become inaccurate, over-retained, or exposed to broad roles; manual edits damage trust.
- **Safe default:** browser attribution only after consent and approval; no database/Staff storage.
- **Owner answer required:** accept Phase 1 exclusion; later decision pack for expansion.
- **Dependency:** Privacy, schema, security, and retention.
- **Impact of delay:** no impact on basic consented GA4 measurement.
- **State:** `CONTRACT_DECISION_RECORDED_NO_PHASE1_STAFF_UI`

### D17 — Production booking-test policy

- **Decision:** Confirm no Production test booking by default; define a future exception process only when necessary.
- **Recommendation:** Keep the default prohibition. Prefer Preview/test environments and contract tests. Any exception requires explicit owner approval, non-PII marker, fixed window, Staff notification, no outbound follow-up, cleanup/archive, and report.
- **Alternatives:** dedicated Production test mode after design; synthetic test account isolated from operational leads.
- **Risks/costs:** fake customer records, duplicate messages, Analytics pollution, Staff confusion.
- **Safe default:** no Production booking submission.
- **Owner answer required:** none unless an exception is proposed.
- **Dependency:** approved test policy and implementation.
- **Impact of delay:** Production remains protected; Preview testing continues.
- **State:** `CONTRACT_DECISION_RECORDED_DEFAULT_NO`

### D18 — GCLID/GBRAID/WBRAID/FBCLID retention

- **Decision:** Confirm no click-ID storage in Phase 1.
- **Recommendation:** Retain the prohibition until Ads readiness includes purpose, retention, deletion, access, conversion-import, and consent/legal review.
- **Alternatives:** future server-side controlled storage; future platform-native conversion model; no click IDs permanently.
- **Risks/costs:** additional tracking/privacy surface and uncontrolled identifiers.
- **Safe default:** reject/ignore click IDs for storage and custom Analytics parameters.
- **Owner answer required:** accept Phase 1 exclusion.
- **Dependency:** future Google Ads/Meta Ads contract.
- **Impact of delay:** no impact before paid campaigns.
- **State:** `CONTRACT_DECISION_RECORDED_NOT_STORED`

### D19 — Attribution when Analytics consent is denied

- **Decision:** Determine whether any non-Analytics operational attribution is needed in a future phase.
- **Recommendation:** In Phase 1, denied/unknown means no GA4, no browser attribution persistence, and no operational attribution. Reopen only with a separately stated purpose and legal/privacy basis.
- **Alternatives:** anonymous aggregate server metrics if technically and legally designed later; self-reported lead source collected transparently; no attribution.
- **Risks/costs:** bypassing user choice, unclear purpose, hidden persistence.
- **Safe default:** no persistence when denied or unknown.
- **Owner answer required:** accept Phase 1 rule; any exception requires amendment.
- **Dependency:** Consent implementation and tests.
- **Impact of delay:** consent-denied journeys remain fully functional but unattributed.
- **State:** `CONTRACT_DECISION_RECORDED_NO_PERSISTENCE`

### D20 — Identifiable learner records for MVP

- **Decision:** Decide whether the Complete Digital Ecosystem MVP needs identifiable learner profiles at all.
- **Recommendation:** Do not use identifiable learner/child/health records in MVP until Command Center Phase 1 acceptance, Phase 2 security, Privacy design, retention, access, vendor, safeguarding, and incident controls pass. Use anonymous codes and fictional/sample records.
- **Alternatives:** no learner record; anonymous progress code; identifiable profile after full gate.
- **Risks/costs:** high sensitivity, child/guardian complexity, health inference, uncontrolled sharing.
- **Safe default:** sample/anonymous data only.
- **Owner answer required:** business necessity and approved minimum-data design.
- **Dependency:** Issues #76–#78, #88, Privacy/security review.
- **Impact of delay:** product prototyping can continue with sample data; real rollout remains blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED_SAFE_DEFAULT_NO_REAL_RECORDS`

### D21 — Minimum learner/adaptive/family-plan fields

- **Decision:** Approve exact fields and prohibit unrestricted free text unless a necessary purpose and handling rule exist.
- **Recommendation:** Separate parent statements, coach observations, qualified-professional instructions, AI suggestions, progress markers, and safeguarding/incident records. Store only minimum required structured data.
- **Alternatives:** templates without storage; anonymous structured records; restricted specialist records.
- **Risks/costs:** diagnosis narrative, stigma, inaccurate AI interpretation, data sprawl.
- **Safe default:** fictional/sample records and no health/diagnosis fields.
- **Owner answer required:** field dictionary, purpose, role, retention, export/share rule.
- **Dependency:** data model and domain review.
- **Impact of delay:** real adaptive/family reporting remains blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D22 — Family-report download/email/share

- **Decision:** Decide whether reports may be downloaded, emailed, or shared, by whom, and with what verification/expiry/audit.
- **Recommendation:** No automatic email or public link. Later use authenticated access or owner-controlled export with recipient verification and audit.
- **Alternatives:** in-app view only; password-protected export; Staff-generated report after guardian verification.
- **Risks/costs:** misdirected sensitive records, uncontrolled copies, family-authority disputes.
- **Safe default:** no real report sharing.
- **Owner answer required:** allowed channels, roles, recipient verification, expiry, revocation, and audit.
- **Dependency:** security, consent, guardian model, vendor review.
- **Impact of delay:** sample reports can be designed; real sharing remains blocked.
- **State:** `OWNER_AND_LEGAL_REVIEW_REQUIRED`

### D23 — Data residency, processors, and vendors

- **Decision:** Approve the provider/processor register and any residency/transfer requirements before real sensitive data.
- **Recommendation:** Inventory Vercel, Supabase, Google, Meta/WhatsApp, Replit, n8n host, email/SMS providers, AI providers, storage, backups, and subprocessors from current contracts/account evidence.
- **Alternatives:** reduce vendors; self-host selected components; keep sensitive domain isolated from optional marketing/AI tools.
- **Risks/costs:** undisclosed processors, cross-border transfer, inconsistent deletion, unsupported security claims.
- **Safe default:** no real learner/child/health data and no prompt transmission.
- **Owner answer required:** approved vendors and evidence owner.
- **Dependency:** procurement/security/legal review.
- **Impact of delay:** sensitive-data and AI-integrated rollout remains blocked.
- **State:** `PROVIDER_EVIDENCE_AND_OWNER_REVIEW_REQUIRED`

## 4. Final PR #46 correction and review checklist

PR #46 must remain Draft until all applicable items are resolved.

### Exact copy corrections already identified

- Arabic section 3.2: replace the erroneous phrase with `الجنس وفئة المشارك المحددة في النموذج`.
- Arabic withdrawal wording: use `البيانات التي جُمعت قبل سحب الموافقة` without asserting legal lawfulness.
- English withdrawal wording: use `data collected before withdrawal`, not `data lawfully collected before withdrawal`.

### Factual parity checks before merge

- [ ] final public/legal identity
- [ ] final privacy contact
- [ ] effective date/version
- [ ] who `full_name` represents
- [ ] minor/guardian process
- [ ] current form fields verified against current code/schema
- [ ] sensitive-field necessity and handling
- [ ] booking/communications/logs/backups retention
- [ ] Staff access and request workflow
- [ ] provider facts and limitations
- [ ] Arabic and English meaning parity after all edits
- [ ] owner decision on UAE-qualified legal review

PR #46 passing CI or copy QA would still not authorize route publication, Consent UI, Analytics, cookies/storage, migrations, Production tracking, or data expansion.

## 5. Isolated implementation sequence after decisions

Each step requires a separate small PR and its own evidence. Do not combine all steps into one release.

### P1 — Finalize decision register and copy

- record owner answers and supporting evidence
- apply PR #46 corrections
- conduct Arabic/English parity, factual, privacy, and legal review
- keep code unchanged

**Gate:** approved copy and owner/legal receipt.

### P2 — Privacy routes behind unpublished/disabled boundary

- implement `/privacy` and `/en/privacy`
- canonical, reciprocal hreflang, and x-default
- footer links only when publication is approved
- no placeholder indexing
- accessibility and mobile QA

**Gate:** Preview only; no Analytics.

### P3 — Consent preference component with no Analytics library

- compact bottom banner
- equal Accept/Reject actions
- preferences control
- Arabic RTL/English LTR
- keyboard/screen-reader support
- consent state storage only after approved data/storage design
- tests proving rejection does not block the site or booking

**Gate:** no `gtag.js`; Preview QA.

### P4 — Disabled-by-default Analytics feature flag

- environment-isolated flag
- default false
- no automatic Production activation on merge
- tests for absent script/events when false or consent is unknown/denied

**Gate:** no real GA4 configuration in Production.

### P5 — GA4 client and event allow-lists in Preview

- `gtag.js` only
- exact allow-listed events/parameters
- PII deny-list
- no click IDs
- no raw URL/query/form/error payload
- deduplication and idempotency tests

**Gate:** Preview DebugView only after owner-approved test configuration.

### P6 — Consent-gated browser attribution

- normalized UTM allow-list
- 30-day first/latest-touch design
- no persistence when consent unknown/denied
- no click IDs
- expiry/clear/change-preference tests

**Gate:** no database attribution.

### P7 — Optional later operational attribution

- only after separate purpose/legal basis, retention, schema, RBAC, deletion, and audit decisions
- read-only Staff display if approved
- no manual edits or click IDs

**Gate:** separate migration and Production plan.

### P8 — Production activation readiness review

Must include:

- owner approval of contract and final Privacy/Consent copy
- implemented public routes and preferences control
- PII/allow-list/deduplication tests
- Arabic/English and iPhone Safari validation
- Preview DebugView evidence
- Production isolation proof
- rollback/disable procedure
- explicit Production activation approval

Activation is a separate operational action. Merge does not activate.

## 6. Required evidence receipts

### Owner decision receipt

```text
DECISION_ID:
QUESTION:
OWNER_ANSWER:
EFFECTIVE_DATE:
SUPPORTING_EVIDENCE:
LEGAL_REVIEW_STATUS:
SAFE_DEFAULT_REPLACED:
APPROVER:
RECORDED_AT_ASIA_DUBAI:
DEPENDENT_DOCS_OR_PRS:
```

### Privacy copy approval receipt

```text
COPY_VERSION_OR_HASH:
ARABIC_REVIEWER:
ENGLISH_REVIEWER:
FACTUAL_REVIEW:
LEGAL_REVIEW_STATUS:
OWNER_APPROVER:
UNRESOLVED_LIMITATIONS:
PUBLICATION_AUTHORIZED: NO / SEPARATE_RECEIPT
```

### Analytics activation receipt

```text
IMPLEMENTATION_COMMIT:
PREVIEW_DEPLOYMENT:
CONSENT_TESTS:
PII_DENY_LIST_TESTS:
EVENT_ALLOW_LIST_TESTS:
DEDUPLICATION_TESTS:
DEBUGVIEW_EVIDENCE:
AR_EN_MOBILE_SAFARI_EVIDENCE:
PRODUCTION_FLAG_BEFORE_ACTIVATION:
OWNER_ACTIVATION_APPROVAL:
PRODUCTION_FLAG_AFTER_ACTIVATION:
ROLLBACK_DISABLE_TEST:
VERIFIER:
```

## 7. Safe default while decisions remain open

- Privacy routes remain unpublished.
- PR #46 remains Draft and unmerged.
- No Consent UI, cookies, `localStorage`, `sessionStorage`, `gtag.js`, events, or attribution storage is added from this pack.
- Analytics remains disabled/not implemented.
- No Production booking test.
- No click-ID storage.
- No operational attribution when consent is denied/unknown.
- No Staff attribution UI/database attribution.
- No new real learner, child, guardian, disability, diagnosis, health, family, safeguarding, or adaptive records.
- Use anonymous codes and fictional/sample records only.
- No automatic report sharing, messaging, publishing, database migration, credentials, Ads, billing, or spend.

## 8. Current truthful status

The owner-decision package is complete as a decision instrument, but the protected decisions themselves are not complete.

`PRIVACY_ANALYTICS_OWNER_DECISION_PACK_READY_DECISIONS_AND_IMPLEMENTATION_GATED`

Issue #59 must not be described as Privacy/Consent closed until the applicable owner/legal decisions are recorded and the implementation/activation gates are separately completed.