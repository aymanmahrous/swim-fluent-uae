# Lead Operations Preview Architecture V1 — 2026-07-19

Status: `LEAD_OPERATIONS_PREVIEW_ARCHITECTURE_READY`

## Goal

Provide a bilingual, human-controlled lead workflow that can be implemented and tested with sample data without sending messages, collecting real PII, changing Production, or installing external credentials.

## Journey

`Content / SEO / GBP / Ads → Website / WhatsApp / Booking → Lead Queue → Human Assignment → Follow-up → Outcome`

External channels remain conceptual or read-only until separately verified and approved.

## Lead states

- `new`
- `contact_pending`
- `contacted`
- `assessment_requested`
- `booking_pending`
- `confirmed`
- `not_ready`
- `closed`
- `do_not_contact`

State changes require actor, timestamp, reason, and safe audit summary.

## Minimum sample-data contract

- `lead_id`
- `created_at`
- `source_channel`
- `preferred_language`
- `service_interest`
- `status`
- `assigned_to`
- `next_action_at`
- `consent_state`
- `duplicate_key`
- `last_contact_state`
- `notes_classification`
- `data_state=SEED`

Sample records must use fictional names and non-routable contact values.

## Duplicate prevention

Use an idempotency key derived from normalized sample contact identifier, source, and bounded time window. The Preview workflow must:

1. check the key before creation;
2. return the existing record when safe;
3. create an audit event for duplicate suppression;
4. never merge records automatically when identity is ambiguous.

## Human handoff rules

Immediate human review is required for:

- medical, therapeutic, diagnostic, rehabilitation, emergency, or safety-sensitive questions;
- complaints, refunds, legal or privacy requests;
- children/minors or guardian ambiguity;
- consent uncertainty;
- unsupported service, credential, price, location, hour, or guarantee claims;
- repeated failed contact or do-not-contact requests.

## Chatbot boundaries

Allowed in a later separately approved phase:

- approved FAQs;
- approved service explanations;
- general initial-assessment guidance;
- language selection;
- collection of minimum routing preferences after consent.

Prohibited:

- diagnosis or treatment;
- medical or emergency instructions;
- automatic promises, prices, discounts, credentials, outcomes, or availability;
- outbound contact beyond a user-initiated conversation without valid consent and human approval.

## n8n Preview workflows

1. New sample lead internal alert.
2. Missed sample follow-up reminder.
3. Sample booking-status reminder to staff.
4. Daily sample operations summary.
5. Weekly sample funnel summary.
6. Workflow failure alert.
7. Duplicate suppression log.

All workflows must use sample data, disabled outbound customer nodes, explicit idempotency, bounded retry, safe stop on ambiguous results, and audit receipts.

## Safe PR sequence

1. sample schemas and validation;
2. state machine and unit tests;
3. read-only queue UI;
4. controlled Preview mutations;
5. audit and duplicate prevention;
6. internal-only sample alerts;
7. Privacy/Consent review;
8. separate credential and Production activation gate.

## Explicit exclusions

No real PII, database migration, credentials, WhatsApp/email/SMS send, chatbot deployment, Production workflow, customer record, Ads action, publishing, billing, or automatic approval is authorized.