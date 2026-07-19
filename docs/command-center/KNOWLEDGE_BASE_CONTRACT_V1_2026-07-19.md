# Knowledge Base Contract V1 — 2026-07-19

Status: `KNOWLEDGE_BASE_CONTRACT_READY_FOR_IMPLEMENTATION`

## Purpose

Define the authoritative bilingual knowledge model for Relax Fix UAE / Swim Fluent UAE / Coach Ayman without requiring Replit runtime, external credentials, customer data, database migrations, or Production writes.

## Source-of-truth rule

Every reusable statement must point to one approved source. Unverified claims remain blocked and must not be promoted to approved content.

## Record contract

Each knowledge record must contain:

- `knowledge_id`: immutable unique identifier.
- `slug`: stable English machine slug.
- `title_ar` and `title_en`.
- `summary_ar` and `summary_en`.
- `body_ar` and `body_en`.
- `category`.
- `tags`.
- `status`: `draft | review | approved | archived`.
- `source_type`: `project_document | owner_decision | approved_asset | policy | external_evidence`.
- `source_reference`.
- `source_hash_or_version` when available.
- `owner` and `reviewer`.
- `created_at`, `updated_at`, `reviewed_at`, `next_review_at`.
- `chatbot_allowed`: boolean.
- `staff_only`: boolean.
- `claims_risk`: `low | medium | high | prohibited`.
- `language_completeness`: `ar_only | en_only | bilingual`.
- `supersedes` and `superseded_by`.

## Initial categories

1. Brand and voice.
2. Approved services.
3. Booking and initial assessment.
4. Water confidence and beginner guidance.
5. Technique and performance.
6. General water-safety education.
7. Staff procedures.
8. Privacy and consent.
9. Content claims and prohibited claims.
10. Publishing and quality procedures.
11. Project decisions and evidence.

## Approval workflow

`DRAFT → REVIEW → APPROVED → ARCHIVED`

- Draft content cannot be used in public copy or chatbot answers.
- Review content may be evaluated by staff but is not authoritative.
- Approved content is reusable only within its stated scope.
- Archived content remains searchable for history but cannot be reused.

## Chatbot eligibility

Chatbot answers may use only records where:

- `status=approved`.
- `chatbot_allowed=true`.
- Arabic and English wording are both approved when bilingual output is requested.
- no unresolved legal, medical, therapeutic, diagnostic, emergency, rehabilitation, credential, price, guarantee, or testimonial claim exists.

## Prohibited automated content

The system must not generate or imply:

- diagnosis, treatment, rehabilitation, therapy, or emergency advice;
- guaranteed results;
- unverified credentials, years, affiliations, prices, locations, hours, or offers;
- unsupported specialization claims;
- legal approval of draft policies;
- consent on behalf of a parent, guardian, or customer.

## Search behavior

Search ranking should prioritize:

1. approved status;
2. exact title and tag match;
3. current version;
4. authoritative source type;
5. language match;
6. latest reviewed date.

Archived and superseded records must be visibly marked and ranked below current approved records.

## Audit requirements

Every status or content change must record actor identifier, actor role, timestamp, before/after safe summary, source reference, and reason.

## Safe implementation sequence

1. Read-only schema and sample fixtures.
2. Validation contract and unit tests.
3. Read-only API.
4. searchable bilingual list.
5. record detail and evidence links.
6. controlled draft/review mutations in Preview only.
7. approval and archive workflow.
8. chatbot retrieval only after Privacy/Consent and runtime gates.

## Explicit exclusions

No database migration, Replit write, Production activation, customer data, chatbot deployment, external message, policy publication, or automatic approval is authorized by this document.