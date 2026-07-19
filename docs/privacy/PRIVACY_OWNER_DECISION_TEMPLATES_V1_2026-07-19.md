# Privacy Owner Decision Templates V1 — 2026-07-19

Status: `PRIVACY_OWNER_DECISION_TEMPLATES_READY`

## Purpose

Prepare exact owner-answer fields without inventing legal facts or publishing an unapproved policy.

## Decision 1 — operating identity

- Public operating name:
- Legal entity name, if applicable:
- Country/jurisdiction:
- Business address suitable for privacy notices:
- Status: `UNCONFIRMED`

Default until answered: do not publish a final legal policy or claim a legal entity.

## Decision 2 — privacy contact

- Privacy email:
- Responsible role/person:
- Backup contact:
- Expected response process:
- Status: `UNCONFIRMED`

Default: no public privacy-contact promise beyond verified channels.

## Decision 3 — minors and guardian model

- Are booking enquiries allowed for minors? `YES / NO / LIMITED`
- Who submits the enquiry?
- How is guardian relationship represented?
- What child data is strictly necessary?
- Are child photos/videos ever uploaded through the product?
- Status: `UNCONFIRMED`

Default: no new child profile, media upload, or sensitive child-data workflow.

## Decision 4 — retention schedule

Complete separately for:

- new/unqualified leads;
- inactive leads;
- booking enquiries;
- confirmed customers;
- cancelled bookings;
- consent records;
- audit/security logs;
- support/privacy requests;
- attribution identifiers.

For each: purpose, duration, deletion/anonymization method, legal/operational reason, owner approval.

Default: data minimization, no indefinite retention, and no new real-data collection.

## Decision 5 — access model

For each data class define `Owner / Admin / Operator / Content / Read-only / No access`.

Sensitive classes:

- contact details;
- child/guardian data;
- health or accommodation notes;
- private messages;
- consent evidence;
- attribution data;
- audit logs;
- deletion/access requests.

Default: least privilege; Owner/Admin only for sensitive classes.

## Decision 6 — Production test policy

Choose one:

- `NO_PRODUCTION_TEST_RECORDS` — recommended default.
- `CONTROLLED_SYNTHETIC_TEST` — requires approved test identity, marker, owner approval, cleanup receipt, and no customer contact.
- `CONTROLLED_REAL_FLOW` — blocked pending full legal, operational, and data approval.

Default: `NO_PRODUCTION_TEST_RECORDS`.

## Analytics decisions

- Consent UI format: banner, modal, or layered panel.
- Privacy routes: language-specific paths or bilingual route.
- `view_service` granularity.
- final CTA ID registry.
- staff attribution visibility.
- GCLID/FBCLID retention.
- attribution behavior when Analytics consent is denied.

Locked Phase 1 assumptions unless separately changed:

- GA4 via `gtag.js`;
- no GTM;
- feature flag off by default;
- no PII in analytics;
- `booking_complete` is the primary conversion;
- no Production activation without separate approval and evidence.

## Completion rule

A decision is closed only when the owner supplies the exact answer, date, scope, and approver identity. Recommendations and placeholders are not approvals.

## Explicit exclusions

This document is not legal advice or a published Privacy Policy. It authorizes no policy publication, cookies, browser storage, analytics event, database migration, Production booking, real-data collection, credential, or external write.