# Owner-Approved Safe Privacy and Measurement Product Decisions

Date: 2026-07-15 (Asia/Dubai)

Status: `SAFE_PRODUCT_DECISIONS_OWNER_APPROVED_LEGAL_FACTS_STILL_PENDING`

The owner authorized the project director to continue with choices that are appropriate, safe, reversible, and do not damage or bypass the system already built.

This receipt applies that authorization only to the least-risk product defaults already recommended in the merged Privacy and Analytics decision pack. It is not legal advice, legal approval, Privacy Policy publication approval, Analytics activation approval, or permission to collect real sensitive data.

## Approved Phase 1 product defaults

### Consent experience

- Retain the compact bottom consent banner model.
- Arabic RTL and English LTR.
- Equal, clearly visible **Accept** and **Reject** actions.
- No consent wall; rejection must not block the website, booking journey, calls, or WhatsApp.
- A preferences control may be added only after the storage and copy design is approved.
- Final Arabic/English consent copy still requires factual, accessibility, and legal review.

### Privacy route structure

- Retain future routes `/privacy` and `/en/privacy`.
- Use reciprocal canonical/hreflang and the approved x-default model.
- Keep routes absent or unpublished until final identity, contact, retention, minors/guardian, provider, and legal facts are approved.
- Do not index or expose placeholder policy text.

### Analytics and events

- GA4 remains disabled by default.
- Use `gtag.js` only in Phase 1; no GTM.
- Do not initialize or send Analytics events until affirmative consent.
- Keep `view_service` out of Phase 1.
- Approve only the current stable CTA registry when real rendered controls and tests confirm them:
  - `header_book`
  - `hero_book`
  - `booking_section_submit`
  - conditional `booking_section_whatsapp`
  - conditional `footer_whatsapp`
- Reserved or absent controls emit nothing.

### Attribution and identifiers

- No Staff attribution UI or booking-level attribution database in Phase 1.
- No GCLID, GBRAID, WBRAID, or FBCLID storage in Phase 1.
- When Analytics consent is denied or unknown: no GA4, no browser attribution persistence, and no operational attribution.
- No raw URL, query string, form value, error payload, PII, or sensitive data in Analytics.

### Production protection

- No Production booking test by default.
- Prefer Preview, test environments, and contract tests.
- Any future exception requires a separate explicit approval, synthetic non-PII marker, fixed window, Staff notification, disabled outbound follow-up, cleanup, and evidence receipt.

### Learner, child, family, adaptive, and health-related data

- Use fictional, sample, or anonymous records only for MVP design and testing.
- No identifiable learner, child, guardian, family, disability, diagnosis, health, or safeguarding records until Privacy, security, retention, vendor, access, audit, and incident gates pass.
- No unrestricted diagnosis or health free text.
- Sample reports may be designed, but no real report email, public link, or automated sharing.
- No real sensitive record may be transmitted to AI prompts or optional marketing tools.

### Vendors and processors

- Keep real sensitive data out of Vercel, Supabase, Replit, n8n, Google, Meta/WhatsApp, email/SMS, AI, and storage integrations until the provider register, regions, subprocessors, retention, access, backups, deletion limitations, and legal review are documented.

## Decisions that remain unresolved and protected

The owner’s general safe-work authorization does not establish facts that require evidence or qualified review. These remain open:

- exact legal/controller identity in Arabic and English
- final privacy contact and responsible custodian
- policy effective date, version owner, and change-notice process
- requester/participant/guardian identity model
- minimum age and guardian-authority procedure
- necessity and handling of sensitive booking values
- booking, communications, logs, and backup retention periods
- Staff roles, access review, sensitive audit, and privacy-request procedure
- live provider settings, regions, logs, backups, and processor facts
- final Privacy Policy and consent wording
- real learner/family/adaptive field dictionary
- real report sharing, recipient verification, expiry, revocation, and audit
- vendor/residency acceptance for real sensitive data

## Implementation boundary

This receipt permits planning, documentation, sample-data prototypes, tests, and isolated Preview-only implementation proposals that preserve the defaults above. It does not authorize:

- merging or publishing PR #46 as a final legal policy
- public Privacy routes or consent copy
- cookies, browser attribution, GA4 configuration, Analytics activation, or Production tracking
- Production migrations or booking submissions
- real customer, learner, child, guardian, family, health, disability, or safeguarding records
- automatic WhatsApp, email, or SMS
- Ads, billing, spend, or conversion uploads

Any implementation must remain a small isolated PR with CI, Preview evidence, accessibility and bilingual review, Quality receipt, rollback path, and its applicable protected approval.