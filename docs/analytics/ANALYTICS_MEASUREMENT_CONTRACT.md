# ANALYTICS MEASUREMENT CONTRACT

Status: **Closed for owner documentation review; no implementation approval**  
Repository baseline: `a30e02d34cd4461a9682f50c036c7d6b3b5af6fd`  
Strategy: **REVENUE-FIRST PARALLEL LAUNCH**  
Last updated: 2026-07-13 (Asia/Dubai)

## 1. Purpose and boundaries

This contract defines the approved first-phase measurement scope, privacy boundaries, event vocabulary, retention decisions, CTA registry, attribution rules, testing requirements, and Production activation gates for Relax Fix UAE / Swim Fluent UAE.

This document is documentation only. It does not authorize or implement:

- `gtag.js` or any other analytics library.
- GA4 property or stream configuration.
- Environment variables.
- Consent UI.
- Analytics events.
- Database migrations or attribution tables.
- Preview or Production tracking.
- Production booking tests.
- Production activation.

Any implementation requires a separate owner-approved scope and PR.

## 1A. Approved initial analytics implementation technology

The approved initial implementation method is:

**Google Analytics 4 through `gtag.js`.**

Rules:

- `gtag.js` is the approved initial implementation path.
- It must remain behind the approved disabled-by-default feature flag.
- It must remain blocked by the approved consent gate.
- This decision does not authorize implementation or Production activation.

### Google Tag Manager decision

Google Tag Manager is not approved for the initial analytics phase.

Rules:

- Do not introduce GTM in the first implementation phase.
- Do not add a GTM container.
- Do not add GTM environment variables.
- Do not route GA4 through GTM.
- GTM may be considered only through a future contract amendment and explicit owner approval.

## 2. Measurement priorities

### Primary conversion

- `booking_complete`

### Secondary conversions

- `whatsapp_click`
- `call_click`
- `conversation_start`

### Deferred events

The following are not part of phase one and require a separate contract amendment:

- `view_service`
- `booking_form_view`
- `booking_form_start`
- `booking_submit`
- `booking_error`

The phase-one scope intentionally minimizes event noise and privacy surface while focusing on revenue intent and proving basic measurement reliability.

## 3. Retention decisions

| Data class | Decision |
|---|---|
| Browser attribution | 30 days |
| Consent preference | 180 days; the user may change the decision before expiry |
| GA4 user/event-associated data | Proposed 14 months, while selecting the lowest practical retention option available in GA4 settings |
| Operational booking attribution | No final duration in this contract; it must align with future `booking_requests` retention and the approved Privacy Policy |
| GCLID / GBRAID / WBRAID / FBCLID | Not stored in phase one |

Click-ID handling is deferred to separate Google Ads or Meta Ads readiness contracts.

## 4. Consent model

The approved documentation decision is a compact bottom banner shown on the first visit.

Requirements:

- Arabic and English support.
- Two equally clear choices:
  - قبول القياس / Accept measurement.
  - رفض القياس / Reject measurement.
- No visually deceptive preference for acceptance.
- GA4 must not initialize or send events before affirmative consent.
- Rejection must leave booking, contact, calls, and WhatsApp fully functional.
- A separate control must later allow the user to change measurement preferences.
- No full-screen modal.
- No consent wall.
- No implied consent through browsing, scrolling, or continued use.

This is approval of the contract decision only, not approval to implement the banner.

## 5. Consent states and attribution behavior

| Consent state | GA4 | Browser attribution persistence | Operational attribution persistence |
|---|---:|---:|---:|
| `unknown` | No | No | No |
| `denied` | No | No | No |
| `granted` | Allowed later only when the feature flag and all activation gates are approved | Allowed later for normalized UTM attribution | No database attribution in phase one |

Any future proposal to retain operational attribution when analytics consent is denied requires:

- A separately defined purpose.
- A clear legal/privacy basis in the Privacy Policy.
- Data-minimization review.
- Contract amendment.
- Explicit owner approval.

## 6. Privacy route structure

Approved future routes:

- Arabic: `/privacy`
- English: `/en/privacy`

Future implementation rules:

- Each route has its own canonical URL.
- Reciprocal `hreflang` between Arabic and English.
- `x-default` points to `/privacy`.
- The pages become public and indexable only after final legal content approval.
- Before legal copy approval, keep the routes unpublished; do not publish placeholder privacy text.
- The footer must later include a clear Privacy link in both languages.

No Privacy route is created by this contract PR.

## 7. CTA registry

`cta_id` is a stable technical identifier. It must not contain visible button text, language, phone number, or URL. `placement` remains a separate parameter. Visible button text must not be sent to GA4. Any new CTA requires a contract and test update.

### Current implementation mapping

| CTA ID | Current status | Current control evidence |
|---|---|---|
| `header_book` | Present | Header link to `#book` |
| `hero_book` | Present | Hero link to `#book` |
| `programs_book` | Reserved | No booking CTA is currently rendered inside the programs section |
| `booking_section_submit` | Present | Final booking form submit button |
| `header_whatsapp` | Reserved | No header WhatsApp control currently exists |
| `floating_whatsapp` | Reserved | No floating WhatsApp control currently exists |
| `booking_section_whatsapp` | Present, conditional | Shown in the success state after a successful booking request |
| `footer_whatsapp` | Present, conditional | Footer control links to WhatsApp when contact settings are available |
| `header_call` | Reserved | No header call control currently exists |
| `booking_section_call` | Reserved | No booking-section call control currently exists |
| `footer_call` | Reserved | Footer currently links to WhatsApp, not `tel:` |

A reserved ID is part of the approved vocabulary but must not be reported as implemented or emit events until the corresponding control exists and is tested.

## 8. Conversation-event rule

- A WhatsApp activation emits only `whatsapp_click`.
- A call activation emits only `call_click`.
- The same WhatsApp click must not also emit `conversation_start`.
- `conversation_start` is reserved for a distinct future interaction that starts an approved internal conversation or another separately approved channel.
- One user activation must not be double-counted as multiple conversion events.

## 9. Event parameter allow-lists

No event may include arbitrary parameters, raw objects, or any booking payload.

### `booking_complete`

Allowed parameters only:

- `language`
- `page_location_type`
- `service_category`
- `location_category`
- `lead_source`
- `lead_medium`
- `lead_campaign`
- `has_campaign_attribution`
- `environment`

### `whatsapp_click`

Allowed parameters only:

- `cta_id`
- `language`
- `placement`
- `page_location_type`
- `lead_source`
- `lead_medium`
- `lead_campaign`
- `environment`

### `call_click`

Allowed parameters only:

- `cta_id`
- `language`
- `placement`
- `page_location_type`
- `lead_source`
- `lead_medium`
- `lead_campaign`
- `environment`

### `conversation_start`

Allowed parameters only:

- `cta_id`
- `channel`
- `language`
- `placement`
- `page_location_type`
- `lead_source`
- `lead_medium`
- `lead_campaign`
- `environment`

## 10. PII and sensitive-data deny-list

The following must never be sent as analytics event names, parameters, values, user properties, or error context:

- Name.
- Email address.
- Phone number.
- WhatsApp number.
- Notes.
- Child name.
- Parent or guardian name.
- Medical or disability details.
- Exact address.
- GPS coordinates.
- Booking UUID.
- Database ID.
- Staff ID.
- Authentication tokens.
- Full external contact URLs.
- WhatsApp prefilled message.
- Raw referrer URL when it contains query parameters.
- Raw form data or API responses.
- Error messages that may contain user input.

## 11. UTM attribution contract

### Supported parameters

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

### Maximum normalized lengths

| Field | Maximum length |
|---|---:|
| source | 100 |
| medium | 100 |
| campaign | 150 |
| content | 150 |
| term | 150 |

### Normalization rules

- Trim surrounding whitespace.
- Convert source and medium to lowercase.
- Campaign, content, and term may preserve case only when operationally required; the preferred naming convention is lowercase.
- Strip control characters.
- Reject HTML or script fragments.
- Reject detected email-address or phone-number patterns.
- Truncate safely at the approved maximum length.
- Direct visits must not erase a still-valid first-touch attribution record.
- Attribution window: 30 days.
- Future implementation stores first-touch and latest-touch separately.
- No click IDs in phase one.

## 12. Click-ID policy

Phase one prohibits:

- Storing GCLID.
- Storing GBRAID.
- Storing WBRAID.
- Storing FBCLID.
- Sending click IDs to GA4 as custom parameters.
- Adding click IDs to `booking_requests`.
- Adding click IDs to browser attribution storage.

This decision may be reopened only during Google Ads or Meta Ads readiness after completing:

- Privacy review.
- Retention decision.
- Access-control decision.
- Deletion policy.
- Ads conversion design.
- Owner approval.

## 13. Deduplication contract

### `booking_complete`

- Emit only after confirmed backend success.
- Emit once per successful submission lifecycle.
- React re-render must not re-emit.
- Double-click must not re-emit.
- A retry following an already successful response must not re-emit.
- `duplicate=true` or an idempotent duplicate response must not emit a new conversion unless a later contract proves the original booking was never measured; the default is no new event.
- Do not send a booking ID to GA4.

### Click events

- Each deliberate activation may be measured once.
- Prevent duplicate handlers for the same activation.
- Keyboard activation counts as one interaction.
- Do not emit on visibility, focus alone, or hover.

## 14. Staff attribution visibility

### Phase one

- No Staff attribution UI.
- Browser attribution only after consent and a separately approved implementation.
- No database attribution.

### Later phase after schema approval

- Store a booking-linked attribution snapshot.
- Display it to authorized staff as read-only.
- No manual edits to attribution values.
- Do not expose click IDs or sensitive values.
- Enforce role-based access.
- Add an access audit trail if required by the approved design.

## 15. Production booking-test policy

Default rule: **No Production test booking.**

Any future Production booking test requires separate explicit owner approval and must define:

- A clear test marker without real PII.
- A specified test time window.
- The authorized person.
- Expected payload.
- Cleanup or archival procedure.
- Staff notification.
- Prevention of customer messages or follow-up.
- A post-test report.

This document grants no permission to perform a Production booking test.

## 16. Feature flag and environment isolation

Future analytics implementation must:

- Be disabled by default.
- Keep Preview and Production configuration isolated.
- Never activate Production automatically because code was merged.
- Treat Production activation as a separate owner-approved action.
- Expose `environment` only as an approved low-cardinality value; never include deployment URLs, tokens, or identifiers.

## 17. Production activation gate

Production measurement must remain disabled until all of the following are complete:

1. Contract owner approval.
2. Privacy copy approval.
3. Consent copy approval.
4. Privacy routes implementation.
5. Consent UI implementation.
6. Feature-flag disabled-by-default test.
7. PII contract tests.
8. Event allow-list tests.
9. Deduplication tests.
10. Preview DebugView validation.
11. Arabic and English validation.
12. Safari iPhone validation.
13. Production isolation validation.
14. Explicit owner Production activation approval.

Production activation is a separate operational action and must never be an automatic side effect of merging an implementation PR.

## 18. Current-code alignment and known gaps

At this contract baseline:

- No analytics library or GA4 event implementation is present in the reviewed public application paths.
- No Consent UI is implemented.
- No Privacy routes are implemented.
- No browser attribution storage is implemented.
- No database attribution table or Staff attribution UI is implemented.
- The current code has booking, WhatsApp, and footer controls that can later map to the CTA registry, but none currently emit analytics events.
- No call controls currently exist in the reviewed public interface.

These are implementation gaps, not contract conflicts. They remain intentionally out of scope until a separate owner-approved implementation phase.

## 19. Decisions intentionally deferred

The following are not blockers to closing this documentation contract, but remain future decisions or approvals:

- Final operational booking-attribution retention period.
- Final bilingual legal Privacy copy.
- Final bilingual Consent copy.
- GA4 property/stream identifiers and administrative configuration.
- Any click-ID handling for Ads.
- Any additional event or CTA beyond this contract.
- Any database attribution schema.
- Production booking-test authorization.
- Production activation authorization.

## 20. Change control

Any change to the following requires a documented contract amendment and owner approval:

- Event names or conversion classification.
- Parameter allow-lists.
- CTA IDs.
- PII deny-list.
- Retention periods.
- Consent behavior.
- Attribution behavior when consent is denied.
- Click-ID policy.
- Production activation gates.
- Production booking-test policy.

Final documentation state: `ANALYTICS_MEASUREMENT_CONTRACT_CLOSED_READY_FOR_DOCUMENTATION_PR`.