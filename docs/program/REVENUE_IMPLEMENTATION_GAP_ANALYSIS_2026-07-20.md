# Revenue Implementation Gap Analysis — 2026-07-20

## Evidence baseline

- Source: `origin/main`
- Commit: `49bc34932fc1910378947c5679782f741355d3ec`
- Main CI: PASS
- Open PR #46: draft, documentation-only, no code overlap.
- Open PR #36: draft, conflicting, overlaps `src/components/public-home.tsx`; this branch does not reuse its unmerged booking implementation.
- Vercel status for current main: successful Preview deployment for project `swim-fluent-uae-w532`; no Production deployment is authorized by this work.
- GA4 Preview-only validation: default denied, update granted, `conversation_start` hit sent, HTTP 204. The verified queue-protocol fix is carried into this branch.
- Google Maps direct verification:
  - Link 4 resolves to International Community Schools — ICS Mushrif.
  - Link 5 resolves to ICS Al Danah — International Community School.

## Gap classification

| Area      | Baseline gap                                  | This branch                                                 | Remaining gate                                     |
| --------- | --------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| Prices    | No single approved public source              | Central typed configuration                                 | Owner review of public wording                     |
| Locations | Server strings without Maps/status            | Five verified cards and central data                        | Per-location live calendar                         |
| Hours     | Slot generator used conflicting ranges        | One Asia/Dubai schedule                                     | Location-specific availability                     |
| WhatsApp  | Runtime settings could leave CTA empty        | Approved fallback and tracked CTAs                          | No automatic outbound messages                     |
| Email     | No booking-template pack                      | Arabic/English template contract                            | Provider/OAuth credentials                         |
| Calendar  | No safe integration contract                  | Conflict/idempotency/closure contract                       | Calendar ID, OAuth and isolated test               |
| n8n       | Fictional internal alert only                 | Same inactive workflow extended with location/time controls | Import, credential setup and manual fictional test |
| Chatbot   | Fixed FAQ without current commercial facts    | Prices, locations, hours and safety copy                    | Calendar-backed slot display remains off           |
| Local SEO | Organization facts lacked new locations/hours | Safe Place/map and general hours data                       | GBP/Search Console read-only evidence              |

## Protected wording decision

The owner supplied prices for aquatic and land-based rehabilitation sessions. Program governance prohibits unverified medical, therapy or rehabilitation claims in public copy. The code therefore keeps the approved numeric keys while public wording uses “aquatic movement session” and “land-based movement session” with a non-medical disclaimer. Publishing medical or rehabilitation wording requires evidence of qualifications and regulatory/legal approval.

## GO / NO-GO

- Central facts, public UI, safe schema, templates and inactive workflow: `GO`.
- Production deployment, real email, real WhatsApp, real Calendar events, n8n activation or real customer data: `NO_GO`.
- Google Calendar and n8n fictional sandbox test after owner OAuth/workspace access: `READY_AFTER_EXTERNAL_ACCESS`.
