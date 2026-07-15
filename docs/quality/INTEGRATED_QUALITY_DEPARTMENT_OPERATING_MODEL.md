# INTEGRATED QUALITY DEPARTMENT OPERATING MODEL

Status: `INTEGRATED_QUALITY_DEPARTMENT_OPERATING_MODEL_READY`

Last verified: 2026-07-15 (Asia/Dubai)

Parent workstream: Issue #71

This operating model defines the Quality Department for Relax Fix UAE / Swim Fluent UAE and the wider Relax Fix Growth OS. It governs designs, videos, bilingual content, website/product changes, evidence-backed AI outputs, lesson-plan drafts, adaptive-aquatics education, family reports, and future release receipts.

Quality approval is not publishing, Production deployment, Analytics activation, credential use, messaging authorization, legal approval, clinical approval, or spending authorization. Those remain separate gates.

## 1. Core quality principles

1. **Evidence before status.** An Issue, assignment, generated file, or agent message is not proof of completion.
2. **Version-specific review.** Approval applies only to the reviewed file, commit, hash, URL, deployment, or content version.
3. **Automated checks do not replace human review.** Automation may detect dimensions, text tokens, links, tests, contrast estimates, or policy terms; it cannot by itself approve visual quality, Arabic shaping, factual meaning, consent, dignity, or safety.
4. **Bilingual parity is required.** Arabic and English must communicate the same approved meaning without literal mistranslation, omitted limitations, or stronger claims in one language.
5. **Safe claims only.** No invented prices, offers, years of experience, credentials, testimonials, outcomes, medical/therapy/rehabilitation claims, diagnoses, or unsupported expertise.
6. **Source and rights traceability.** Every public asset requires an identifiable source, owner/permission status, allowed use, and modification history.
7. **Reversible workflow.** Rejected or superseded versions remain traceable; QA never deletes the only source file.
8. **Privacy by default.** Sample or anonymous data is used until real-data controls are approved.
9. **Human authority remains explicit.** AI-generated content, plans, or recommendations cannot approve themselves.
10. **No gate collapse.** `QA_PASSED` means the reviewed version met the Quality gate; it does not mean `RELEASE_AUTHORIZED` or `PUBLISHED`.

## 2. Roles and separation of duties

| Role | Responsibility | Must not do |
|---|---|---|
| Requester | Defines objective, channel, audience, source of truth, deadline, and protected boundaries. | Mark work complete without evidence. |
| Producer | Creates or corrects the asset/content/code. | Approve their own final version as the sole reviewer for public or sensitive work. |
| Automated QA | Runs reproducible checks and records raw outputs. | Claim human visual, legal, clinical, consent, or factual approval. |
| Quality Reviewer | Performs visual/content/product review, classifies findings, and verifies corrections. | Authorize publishing, Production, credentials, spend, or protected data use. |
| Domain Reviewer | Reviews specialist areas such as evidence, privacy, safeguarding, Arabic copy, SEO, or accessibility. | Approve outside demonstrated scope. |
| Owner/Authorized Approver | Accepts owner decisions and protected business facts; may authorize release when all gates are satisfied. | Treat missing evidence as approval. |
| Publisher/Release Operator | Performs the separately authorized external action and records receipts. | Publish a version other than the approved hash/version. |

For low-risk internal drafts, one person may hold more than one role, but the receipt must disclose that fact. Public claims, child/sensitive data, adaptive-aquatics outputs, legal/privacy copy, Production changes, and paid media require independent or explicitly owner-controlled review.

## 3. Severity model

### S0 — BLOCKER

The item cannot be reviewed or safely progressed.

Examples:

- missing source file, inaccessible Preview, absent asset, corrupt export, or unknown version
- no permission or rights evidence for a public image/video
- real child, health, disability, safeguarding, lead, or customer data used without an approved gate
- requested Production write, publishing, credential use, or spend without authorization
- evidence contradiction that prevents knowing what was actually reviewed

Required response: stop the affected path, record the blocker, preserve evidence, and continue independent safe work.

### S1 — CRITICAL

Release would create material safety, legal, privacy, security, brand, or public-trust risk.

Examples:

- medical, therapeutic, rehabilitation, diagnostic, credential, outcome, or experience claim outside approved boundaries
- exposed secret, token, private link, personal data, or unrestricted sensitive record
- wrong person/face, face regeneration, child imagery without consent, or materially altered identity
- broken booking safety, destructive Production behavior, inaccessible primary flow, or false publication status
- Arabic text rendered incorrectly enough to change meaning
- public content asserts an invented offer, price, address, hours, service area, testimonial, or account state

Required response: `REJECTED_CRITICAL`; no release; correction and full re-verification required.

### S2 — MAJOR

The objective, comprehension, usability, conversion path, factual reliability, or platform fitness is materially reduced.

Examples:

- wrong dimensions, clipped headline, unreadable subtitles, weak contrast, incorrect CTA, broken link, missing form label
- bilingual mismatch, factual ambiguity, unsupported source, missing limitation, or misleading hierarchy
- mobile layout failure, serious performance regression, missing loading/error state, or incomplete audit receipt

Required response: `CHANGES_REQUIRED`; re-review affected areas and any dependent sections.

### S3 — MINOR

A visible defect exists but does not materially block comprehension, safety, or the primary objective.

Examples:

- small spacing inconsistency, punctuation mismatch, non-critical alignment issue, minor metadata inconsistency

Required response: correct before release where practical; reviewer may approve with a documented exception only when the exception owner and expiry are recorded.

### S4 — OBSERVATION

An improvement suggestion or future optimization that is not a current defect.

Required response: add to backlog; it does not block approval.

## 4. Workflow states

| State | Meaning |
|---|---|
| `DRAFT` | Work exists but has not entered Quality review. |
| `READY_FOR_QA` | Source, scope, version, and evidence are available. |
| `IN_QA` | Review is in progress. |
| `BLOCKED_MISSING_EVIDENCE` | Review cannot finish because evidence or source is missing/contradictory. |
| `CHANGES_REQUIRED` | One or more S1–S3 findings require correction. |
| `REJECTED` | The version is not acceptable and must not be released. |
| `QA_PASSED_NOT_RELEASED` | Quality requirements passed for the exact reviewed version; no release authority is implied. |
| `OWNER_DECISION_REQUIRED` | Quality review is complete as far as possible but a factual/protected decision is unresolved. |
| `OWNER_APPROVED_NOT_RELEASED` | Owner approved the content/version, but operational release remains separate. |
| `RELEASE_AUTHORIZED` | All required non-QA gates and operational authority are documented. |
| `RELEASED_PENDING_RECEIPT` | External action occurred but final receipt/verification is incomplete. |
| `RELEASED_VERIFIED` | Public/Production result was independently verified with receipt. |
| `SUPERSEDED` | A newer approved version replaces this version. |

No state may skip from `DRAFT` to `RELEASED_VERIFIED`. A public URL or “Open” Issue does not establish any state by itself.

## 5. Universal intake record

Every review must capture:

- Quality Record ID
- parent Issue/workstream
- asset/content/feature ID
- objective and audience
- language(s)
- channel/platform
- exact file path, URL, commit, deployment, or hash
- source-of-truth document(s)
- source/rights/consent evidence
- prohibited-claims boundary
- sensitive-data classification
- requested release date, if any
- requester and producer
- required domain reviewers
- known dependencies and owner decisions
- explicit exclusions

An incomplete intake becomes S0 `BLOCKED_MISSING_EVIDENCE`.

## 6. Design QA checklist

### Source and identity

- [ ] Exact source image and owner-controlled source location recorded.
- [ ] Rights/permission status recorded.
- [ ] Coach Ayman face, head, hair, body, pose, clothing, and identity preserved where required.
- [ ] No face swap, regenerated identity, beauty retouch that changes features, or unauthorized compositing.
- [ ] No child/client/person appears without appropriate consent evidence.

### Brand and copy

- [ ] Official Relax Fix UAE logo/version used.
- [ ] Navy, turquoise, gold, and approved supporting palette used consistently.
- [ ] Arabic Cairo family/weight is verified from actual export/source, not merely named in a manifest.
- [ ] Arabic shaping, ligatures, punctuation, numerals, and RTL order are correct.
- [ ] English typography is readable and aligned with the approved hierarchy.
- [ ] CTA exactly matches approved copy.
- [ ] No prohibited offer, price, claim, credential, testimonial, or sensitive-case reference.

### Layout and export

- [ ] Required platform dimensions verified from actual pixels.
- [ ] Safe margins and text zones checked at platform crop variants.
- [ ] Hierarchy, alignment, spacing, contrast, and visual focus pass human review.
- [ ] Text remains legible at a 390px mobile preview.
- [ ] Feed, Story, Reel cover, and other derivatives are reviewed separately.
- [ ] Filename, format, color profile, and export quality recorded.
- [ ] Final file hash/version recorded.

## 7. Video QA checklist

- [ ] Original footage/source and consent/rights evidence recorded.
- [ ] Frame size, aspect ratio, duration, frame rate, codec, audio level, and thumbnail fit the platform.
- [ ] Focus, exposure, stabilization, framing, and visual continuity are acceptable.
- [ ] Speech is intelligible; music and effects do not obscure it.
- [ ] Arabic and English subtitles accurately match the spoken content and remain in safe zones.
- [ ] Pacing supports comprehension without misleading edits.
- [ ] Coach/client identity is not synthetically changed.
- [ ] No child/client appears without consent.
- [ ] No unsafe demonstration, forced submersion, unsafe breath-holding, unsupervised instruction, coercion, punishment, or restraint.
- [ ] No unapproved medical, therapy, rehabilitation, credential, price, offer, or guaranteed-outcome claim.
- [ ] CTA/end frame and logo are correct.
- [ ] Final export is watched completely after encoding.

## 8. Content and social QA checklist

- [ ] Content ID and source-of-truth version recorded.
- [ ] Objective and funnel stage are clear: educational, trust, service explanation, engagement, conversion, or local intent.
- [ ] Arabic is natural, clear, correctly shaped, and not a weaker/stronger translation of English.
- [ ] English is natural and matches the approved meaning.
- [ ] Factual statements are supported by repository evidence or cited current authoritative sources.
- [ ] No invented testimonial, result, price, offer, credential, years of experience, location, hours, or account status.
- [ ] No medical/therapy/rehabilitation/diagnosis claim or implication.
- [ ] Sensitive examples are anonymized and cannot be re-identified.
- [ ] CTA is approved and proportionate.
- [ ] Hashtags and local terms are relevant and not keyword stuffing.
- [ ] Media brief identifies allowed source type and prohibited imagery.
- [ ] UTM placeholder follows the measurement contract and contains no PII.
- [ ] Scheduling/publication state is truthful; receipt is required after release.
- [ ] The final caption and final asset hash are paired in the approval receipt.

## 9. Website and product QA checklist

### Functional and safety

- [ ] Exact commit/Preview/Production distinction recorded.
- [ ] Typecheck, lint, build, unit/API/UI/e2e tests relevant to the change pass.
- [ ] Critical flows are tested on desktop and mobile without a real Production booking unless separately authorized.
- [ ] Form validation, idempotency, duplicate prevention, loading, empty, success, retry, and error states are reviewed.
- [ ] Server authorization and negative-access tests exist for protected data/actions.
- [ ] No secret or privileged key is exposed to browser code or public logs.
- [ ] No unapproved migration, Production write, external message, or credential action.

### Accessibility and bilingual UX

- [ ] Language and direction attributes are correct.
- [ ] Keyboard navigation, visible focus, labels, names, error association, headings, landmarks, and contrast are checked.
- [ ] Arabic RTL and English LTR layouts work at mobile and desktop widths.
- [ ] Touch targets and sticky elements do not obstruct controls.
- [ ] Screen-reader and reduced-motion considerations are documented for critical flows.

### SEO and public claims

- [ ] Titles, descriptions, canonical URLs, hreflang, x-default, robots, sitemap, structured data, and public/private indexing boundaries are verified.
- [ ] Public copy matches current approved claims and Business Settings.
- [ ] Public assets have suitable alt text without keyword stuffing or sensitive description.
- [ ] Search-engine cache/index drift is distinguished from current Production response.

### Privacy and Analytics

- [ ] Data minimization and field purpose are documented.
- [ ] No child/health/disability/diagnosis details enter Analytics, logs, prompts, or Ads systems.
- [ ] Consent denial does not block the core website or booking path.
- [ ] Analytics remains disabled until all activation gates are approved.
- [ ] Privacy/legal copy is not treated as approved merely because it passes copy QA.

## 10. Evidence and AI-output QA

Every evidence-backed AI output must record:

- source title, issuing body, URL or repository location
- source type and why it is appropriate
- publication/update date when available
- date accessed and next review date
- exact claim supported
- limitations, uncertainty, missing information, and conflicts
- whether the source is official/primary, secondary, or anecdotal
- reviewer decision and version

Mandatory checks:

- [ ] Recommendation does not exceed the source.
- [ ] Current facts are verified from current primary/official sources.
- [ ] No proprietary course/manual content is copied beyond permitted quotation limits.
- [ ] Conflicting evidence is shown, not silently discarded.
- [ ] Stale or superseded guidance is blocked.
- [ ] AI suggestions are clearly separated from verified facts and professional instructions.
- [ ] A human domain reviewer approves the final use.

## 11. Swimming lesson-plan QA

- [ ] Learner context uses anonymous/sample data unless real-data gate is approved.
- [ ] Objective, starting assumptions, water-safety prerequisites, equipment, supervision, progression, regression, success criteria, and stop criteria are explicit.
- [ ] Activity is age/skill/context appropriate.
- [ ] No forced submersion, unsafe breath-holding, coercive exposure, restraint, punishment, or unsupervised child instruction.
- [ ] Coach can edit/reject every AI suggestion.
- [ ] Plan does not diagnose, prescribe clinical treatment, or guarantee progress.
- [ ] Coach approval is recorded before operational use.

## 12. Adaptive Aquatics education QA

- [ ] Guidance is individualized from stated needs and observed responses, not a diagnosis stereotype.
- [ ] Communication preferences, sensory needs, dignity, assent, safeguarding, transitions, and stop signals are considered.
- [ ] Parent statements, coach observations, professional instructions, and AI suggestions are clearly separated.
- [ ] No medical, therapy, rehabilitation, developmental, or guaranteed-outcome claim.
- [ ] No coercion, forced eye contact, forced submersion, restraint, or punishment.
- [ ] Referral/qualified-professional gate is stated when the request exceeds coaching scope.
- [ ] Evidence validation and coach review are both recorded.

## 13. Family-report QA

- [ ] Report uses plain Arabic/English and distinguishes fact from interpretation.
- [ ] Parent statement, coach observation, measured progress, and AI suggestion use separate labels.
- [ ] No diagnosis, clinical interpretation, blame, promise, or guarantee.
- [ ] Only minimum necessary information is included.
- [ ] Sharing/download/email permissions and recipient are verified.
- [ ] Sensitive or safeguarding records are not placed in ordinary lesson notes.
- [ ] Access, correction, export, deletion, and retention rules are satisfied before real use.

## 14. Finding log format

| Field | Required value |
|---|---|
| Finding ID | Stable ID, for example `QF-2026-001` |
| Quality Record ID | Parent review record |
| Severity | S0–S4 |
| Asset/version | Exact file/hash/commit/URL |
| Location | Page, frame, timestamp, element, or line |
| Observation | What was found, stated neutrally |
| Risk | User/business/safety/privacy impact |
| Required correction | Testable correction instruction |
| Owner | Person/agent responsible |
| Due date/SLA | Based on severity |
| Evidence | Screenshot, test output, source, or receipt |
| Status | Open / corrected / accepted exception / superseded |
| Re-verification | Reviewer, date, result, new version |

A correction that changes the asset hash or commit invalidates the previous approval and requires re-verification at the appropriate depth.

## 15. Rework SLA

| Severity | Acknowledge | Target correction or escalation | Release rule |
|---|---:|---:|---|
| S0 Blocker | Same working session | Resolve evidence gap or formally block | No review completion |
| S1 Critical | Immediate | Same day where operationally possible; otherwise explicit owner escalation | No release |
| S2 Major | Within 1 business day | Within 2 business days or before planned release | No release until fixed |
| S3 Minor | Within 2 business days | Before release or documented time-limited exception | Conditional |
| S4 Observation | Backlog review | Prioritized by value | Does not block |

A deadline never overrides safety, privacy, rights, legal, clinical, credential, or Production gates.

## 16. Quality approval receipt

```text
QUALITY_RECEIPT_ID:
PARENT_ISSUE:
ASSET_OR_FEATURE_ID:
OBJECTIVE:
LANGUAGE_AND_CHANNEL:
EXACT_VERSION_OR_HASH:
SOURCE_OF_TRUTH:
SOURCE_RIGHTS_CONSENT_EVIDENCE:
AUTOMATED_CHECKS_AND_RESULTS:
HUMAN_REVIEW_SCOPE:
DOMAIN_REVIEWERS:
FINDINGS_BY_SEVERITY:
CORRECTIONS_VERIFIED:
KNOWN_LIMITATIONS:
OWNER_DECISIONS_REMAINING:
QA_STATUS:
REVIEWER:
REVIEWED_AT_ASIA_DUBAI:
RELEASE_AUTHORIZED: NO / SEPARATE_RECEIPT_ID
PUBLICATION_OR_DEPLOYMENT_RECEIPT: NOT_APPLICABLE / PENDING / ID
```

An approval receipt without an exact version/hash is invalid.

## 17. Integration map

### Batch A1 — Issue #56

- Quality cannot accept manifest-only evidence as human visual proof.
- Require 23/23 actual PNGs or a complete contact sheet, individual dimensions, source/rights record, and real font binary/weight evidence.
- The Cairo Regular/400 versus Bold/SemiBold contradiction remains S0 until resolved.
- No Batch A2, scheduling, or publishing from a partial Batch A1 receipt.

### 30-day content plan — Issue #57

- Review factual/claims boundaries, bilingual parity, media-source rules, CTA, UTM placeholders, asset dependencies, and truthful approval states.
- A calendar row marked planned is not an approved asset.
- Every publication later needs a platform-specific receipt.

### SEO/Local SEO and conversion — Issues #58 and #79

- Review current Production separately from repository and search-engine cache.
- Unknown NAP, hours, categories, account linkage, and GBP facts remain owner decisions.
- QA may approve an audit document but cannot edit Google properties or authorize a Production booking.

### Privacy/Consent/Analytics — Issue #59 and PR #46

- Copy QA verifies clarity and parity, not legal compliance.
- Real learner/child/health data and Analytics activation remain blocked until the full decision and implementation gates pass.

### Publishing readiness — Issue #60

- `QA_PASSED_NOT_RELEASED` assets require human publishing approval, exact final file/caption pairing, account/credential gate, idempotency/duplicate prevention, and publication receipts.

### Replit Command Center — Issue #76

- Require running Preview, schema/API inventory, screen-to-endpoint matrix, cross-session persistence, mutation audit events, tests, validation, RTL/LTR/mobile/accessibility review, limitations, and rollback evidence.
- A paused agent or open Issue is not evidence.

### Complete Digital Ecosystem — Issues #81–#88

- Apply the evidence, AI, lesson-plan, adaptive, family-report, and sensitive-data gates in this document.
- No generated plan becomes `APPROVED` without evidence validation and coach review.

### Smart Media Library — Issue #91

- Google Drive remains the canonical working media/approval source.
- Dropbox remains intake/archive until an exact approved mutation plan exists.
- No facial recognition, diagnosis/health inference, or automatic move/delete.

## 18. Quality metrics

Track monthly without using them to pressure unsafe approval:

- first-pass approval rate by asset type
- findings by severity and category
- average rework cycles
- median correction time by severity
- bilingual mismatch rate
- public-claims defect rate
- rights/consent evidence completeness
- accessibility defects per release
- escaped defects found after release
- receipt completeness rate
- percentage of releases with exact version/hash
- percentage of AI outputs with current primary/official evidence and human review

The target is not “zero findings.” The target is early detection, truthful status, safe correction, and no S1 escape.

## 19. Release and rollback rules

1. The publisher must compare the approved hash/version with the release candidate immediately before release.
2. Any mismatch returns the item to `READY_FOR_QA`.
3. The release receipt must record platform/environment, timestamp, public URL or deployment ID, final asset/content version, operator, and errors/differences.
4. Public/Production verification must be read-only unless a separate write is explicitly authorized.
5. If an S1 defect escapes, stop further release, preserve evidence, roll back or unpublish only through an authorized reversible action, and open an incident finding.
6. A rollback does not erase the original receipt or incident record.

## 20. Current implementation status

This document establishes the operating model and templates. It does not prove that a staffed Quality Department, Replit workflow, automated checker suite, publication integration, or Production release system is Live.

Current truthful state:

`QUALITY_OPERATING_MODEL_DOCUMENTED_AUTOMATION_AND_OPERATIONAL_ADOPTION_PENDING`

No publishing, scheduling, Production deployment, credential action, database write, Analytics activation, real-data use, Ads, billing, or spend is authorized by this document.