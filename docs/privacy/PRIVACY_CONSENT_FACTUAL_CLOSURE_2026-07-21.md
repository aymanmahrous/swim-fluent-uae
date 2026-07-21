# Privacy and Consent Factual Closure

Status: **FACTUAL_CLOSURE_COMPLETE — LEGAL_AND_PUBLICATION_GATE_REMAINS_BLOCKED**  
Date: 2026-07-21 (Asia/Dubai)  
Owner: Ayman Mahrous  
Project Director: delegated operating authority under `AGENTS.md`

## Purpose

This document closes operational and product facts that can be decided safely from repository evidence and delegated authority. It does **not** provide legal advice, approve publication, activate Analytics, create privacy routes, change the database, or authorize Production tracking.

PR #46 remains a historical draft and must not be merged as-is. Future implementation must use this closure record plus fresh legal/copy review against current UAE requirements.

## Confirmed operating decisions

### Identity and privacy contact

- Public identity: **Relax Fix UAE / Swim Fluent UAE**.
- Public coach identity: **Coach Ayman**.
- Interim privacy contact: **relaxfix2026@gmail.com** pending a dedicated mailbox.
- No unsupported response deadline may be promised.

### Requester and participant relationship

- For every participant under 18, the requester must be a parent, legal guardian, or authorized adult caregiver.
- The current `full_name` field is treated as the **requester's name**, not the child's name.
- A future implementation must add an explicit relationship field before collecting a child's separate identity.
- Identity documents must not be requested through the public form or chatbot.

### Children under 13

- No child-under-13 account, direct-contact channel, or independent consent may be intentionally collected.
- A parent or guardian must submit the request and provide explicit, documented, verifiable parental approval before personal data of a child under 13 is intentionally processed beyond the minimum needed to answer the request.
- Withdrawal of parental approval must be accessible without unnecessary difficulty.
- Child data must not be used for targeted advertising, behavioural profiling, or unrelated commercial tracking.
- Access is restricted to authorized staff with a direct operational need.

### Ages 13–17

- A parent, guardian, or authorized adult remains the required requester.
- The project will not rely on a minor's standalone consent for booking, marketing, Analytics, or data-sharing decisions.

### Sensitive and special-needs information

- `fear_of_water` and participant-category selections are treated as **restricted operational data**.
- Only staff needing the data for suitability or safety may view it.
- Public forms, chatbot, email automation, and Analytics must not request or transmit diagnosis, treatment history, medication, disability narrative, or medical documents.
- Any future accommodation field requires separate purpose, minimization, access, retention, and legal review.

### Staff access

- Booking information is limited to the owner and specifically authorized operational staff.
- Marketing, content, and advertising roles receive no raw booking data by default.
- Booking/database identifiers and sensitive booking fields must not be sent to GA4, advertising platforms, content tools, or public logs.

### Operational retention baseline

These are conservative operating baselines, not final legal conclusions:

- Pending or active booking requests: retain while active, then review at 90 days.
- Declined, cancelled, duplicate, or abandoned requests: delete or irreversibly anonymize within 90 days unless needed for an active dispute, security investigation, or documented legal obligation.
- Confirmed customer records: retain only the minimum needed for the continuing relationship; review annually.
- WhatsApp, phone, and email conversations: delete when no longer operationally needed; review at 12 months.
- Consent evidence and preference changes: retain up to 24 months after the last relevant interaction unless legal review sets another period.
- Future GA4 retention: lowest practical option, initially no more than 14 months, only after consent implementation and legal approval.
- Future browser attribution: maximum 30 days and only after valid consent.
- Provider logs, backups, and infrastructure retention must be verified from live accounts before publication; no exact duration may be invented.

### Privacy requests and withdrawal

- Requests may initially be sent to `relaxfix2026@gmail.com`.
- Identity verification must be proportionate and not excessive.
- Withdrawal stops future consent-based measurement and future attribution persistence after processing.
- Withdrawal does not automatically erase every historical record; correction, deletion, restriction, and objection are handled separately according to applicable facts and obligations.
- Completion evidence must be recorded internally without public exposure.

### Analytics and advertising

- Production Analytics activation remains **OFF / BLOCKED** unless separately verified otherwise.
- This document authorizes no GA4, GTM, advertising tags, UTM persistence, click identifiers, targeted advertising, or behavioural profiling.
- Future Analytics requires approved bilingual policy, consent UI, withdrawal control, test evidence, a data-field allowlist, and explicit Production approval.
- Data relating to minors must not be used for targeted advertising.

## Required gates before publication

1. Prepare fresh Arabic and English policy copy from this record.
2. Obtain UAE-qualified legal review, especially for minors, consent, retention, data-subject requests, cross-border processing, and provider disclosures.
3. Verify live Vercel, Supabase, email, WhatsApp, authentication, logs, backups, and storage settings.
4. Approve a dedicated privacy mailbox or formally approve the interim email.
5. Define and test the internal privacy-request workflow.
6. Add relationship fields before collecting separate child identity.
7. Implement privacy routes and footer links in an isolated PR.
8. Implement consent UI and Analytics separately; no combined activation PR.
9. Perform bilingual parity, accessibility, security, and Production smoke checks.
10. Obtain explicit owner approval before Production activation.

## Locked decisions

- Adults submit requests for all under-18 participants.
- The current name field represents the requester.
- No medical narrative or documents are collected through public channels.
- Fear-of-water and participant category are restricted operational data.
- Raw booking data is not used for Analytics or advertising.
- Child data is not used for targeted advertising.
- Analytics remains blocked pending the full privacy and consent gate.

## Phase state

- Operational factual closure: **LOCKED**.
- Legal review: **BLOCKED / REQUIRED**.
- Privacy-policy publication: **BLOCKED**.
- Consent UI: **PLANNED, NOT AUTHORIZED**.
- Analytics activation: **BLOCKED**.
- PR #46: **HISTORICAL DRAFT — DO NOT MERGE AS-IS**.
