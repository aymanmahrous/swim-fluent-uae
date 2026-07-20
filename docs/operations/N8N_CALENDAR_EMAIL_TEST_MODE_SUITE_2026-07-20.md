# n8n, Calendar and Email Test-Mode Suite

Verified: 2026-07-20 (Asia/Dubai)

Status: `CONTRACT_TESTED_IMPORT_AND_OAUTH_PENDING_EXTERNAL_WRITES_OFF`

## Account separation

- n8n login and credential administration: `swimmingayman@gmail.com`
- Booking Calendar, customer messages and operational alerts: `relaxfix2026@gmail.com`
- WhatsApp handoff: `https://wa.me/971551378660`
- Passwords, OAuth tokens, client secrets and refresh tokens: n8n Credentials Store or environment variables only; never exported to Git.

## Shared safety contract

- `TEST_MODE = true`
- `EXTERNAL_WRITES_ENABLED = false`
- fictional references only (`RF-PREVIEW-*`)
- no real invitations, email, WhatsApp or Calendar events
- Asia/Dubai and four logical resources only: Najda Street, ICS Al Falah, ICS Khalifa, ICS Mushrif
- free/busy check before display and again before confirmation
- idempotency key required before create/reschedule/cancel/retry
- maximum two retries after idempotency reconciliation
- safe event title: `Initial Assessment — Booking RF-XXXX`
- no diagnosis, medical notes or unnecessary PII in events or logs
- ambiguous provider response stops automatic retry and routes to a human

## Workflow suite

| Workflow | Test input | Safe output / gate |
|---|---|---|
| Booking Request Intake | Fictional service, location, date/time and reference | Validated minimal request; never confirmed |
| Calendar Availability Check | Fictional request | Available/conflict/error result only; no event write |
| Booking Confirmation | Calendar-checked sample | Preview confirmation payload; human approval required |
| Booking Reschedule | Existing fictional reference + new time | Re-checks free/busy and idempotency; no live update |
| Booking Cancellation | Fictional reference | Preview cancellation state; no live deletion |
| Internal Gmail Notification | Safe internal sample | Rendered email to operational address; send disabled |
| Customer Reminder | Confirmed fictional sample | Rendered bilingual reminder; send disabled |
| Chatbot Human Handoff | Unclear/error/complaint sample | Staff preview queue and WhatsApp link; no outbound message |
| Automation Error Handler | Simulated Calendar/n8n/Gmail failure | Redacted alert, correlation ID and safe stop |
| Daily Operations Digest | Fictional daily counters | Aggregate preview without unnecessary PII |
| Lead Follow-up Queue | Fictional consented request | Human-reviewed due queue; no automatic outreach |
| Content Scheduling Queue | Reviewed draft metadata | Internal queue only; publishing disabled |
| Google Business Post Preparation Queue | Reviewed bilingual draft | Preview package only; GBP write disabled |
| Review Request Queue | Fictional completed service + consent flag | Human review required; no send and no incentive |

## Failure tests

1. Duplicate reference: second execution returns the existing preview receipt.
2. Calendar conflict: no time is displayed or confirmed.
3. Calendar timeout: fail closed, render fallback and alert internally in preview.
4. Gmail failure: preserve unsent state and do not mark notification complete.
5. n8n retry: reconcile idempotency before either retry; stop after two attempts.
6. Invalid/hidden location: reject the payload. `ics-al-danah` is not an allowed choice.
7. Outside hours: reject before Calendar access.
8. Publishing/review queues: remain review-required and never perform external writes.

## External owner steps still required

1. Sign in to the authorized n8n workspace with `swimmingayman@gmail.com`.
2. Import the existing inactive JSON; inspect it for secrets before import.
3. Create OAuth credentials in n8n Credentials Store for `relaxfix2026@gmail.com`.
4. Map four location calendars/resources and location-specific availability/travel buffers.
5. Run the 14 fictional manual tests with outbound nodes disabled.
6. Export redacted execution receipts. Production activation remains separately prohibited.
