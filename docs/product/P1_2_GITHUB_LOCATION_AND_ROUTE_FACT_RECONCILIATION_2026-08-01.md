# P1.2 GitHub Location and Route Fact Reconciliation — 2026-08-01

Status: `COMPLETED_READ_ONLY_RECONCILIATION`

Repository: `aymanmahrous/swim-fluent-uae`

Baseline main SHA: `5859fc0b113f9c553b287390ef7fd0df974be272`

Official Production host: `https://www.relaxfixuae.com`

This artifact performs no redirect, sitemap, schema, database, permission, deployment, publishing, scheduling, Analytics, Ads, billing or Production write.

## 1. SEARCH COVERAGE

Repository evidence was searched across current source and history, including:

- `PROJECT_HANDOFF.md`
- `PROJECT_STRATEGY_HANDOFF.md`
- `docs/seo/**`
- `docs/content/**`
- `docs/program/**`
- `docs/product/**`
- `src/**`
- `public/**`
- sitemap generation and verification code
- public business registry and JSON-LD inputs
- environment examples excluding secrets
- Issues, PR metadata/comments and commit history

Search terms included every manager-specified location spelling plus training location, service area, pool, venue, address, map, Google Maps, opening hours, location page, sitemap, GBP and NAP.

High-authority sources found:

1. `docs/seo/LOCAL_SEO_SOURCE_OF_TRUTH.md`
2. `docs/seo/OWNER_APPROVED_LOCATIONS_AND_HOURS_RECEIPT_2026-07-15.md`
3. `src/platform/public-business-config.ts`
4. `src/routes/sitemap.xml.ts`
5. `public/sitemap.xml`
6. `scripts/verify-public-seo.mjs`
7. `scripts/verify-production-sitemap.mjs`
8. Production JSON-LD, homepage cards and location landing pages
9. Project handoffs, content packs, Local SEO audits and GBP decision packs

## 2. CANONICAL LOCATION FACTS

### 2.1 Najda Street

- Canonical public name: `Najda Street`
- Repository registry ID: `najda-street`
- Google Maps observed name: `ICS Al Danah - International Community School`
- Owner-approved short map URL: `https://maps.app.goo.gl/XL9weMpSJcpVDNCV6?g_st=ac`
- Resolved address evidence: `F9PG+R56 ICS Al Danah - International Community School - Al Najda St - Al Danah - E11 - Abu Dhabi`
- Place ID: `null`; no Place ID should be invented
- Verification: `verified-browser-redirect`
- Last registry verification: `2026-07-20T08:27:00+04:00`
- Operating status: `limited-availability`
- Public: `true`
- Booking enabled: `true`
- Local SEO enabled: `true`
- Services: learn-to-swim foundations, water confidence, technique/performance coaching; children small-group coaching is publicly described
- General coaching availability: weekends 10:00–22:00; weekdays 16:00–21:00; these are coaching windows, not school hours
- Public approval evidence: owner-approved location receipt and Local SEO source of truth; source registry explicitly labels the display name owner-approved
- Sitemap/page evidence: `/locations/najda-street`, HTTP 200, unique title and self-canonical
- Consistency: current authoritative sources consistently use `Najda Street`; historical `ICS Al Najda` is explicitly superseded
- Hidden duplicate: `ics-al-danah` points to the same resolved venue but is `isPublic=false`, `bookingEnabled=false`, `localSeoEnabled=false`, `temporarily-unavailable`
- Conflict: no current-source conflict. Historical naming variant is resolved by explicit supersession and hidden-duplicate policy
- Confidence: `VERIFIED`
- Decision: `KEEP`

### 2.2 ICS Al Falah

- Canonical public name: `ICS Al Falah`
- Registry ID: `ics-al-falah`
- Google Maps observed name: `International Community Schools - ICS Al Falah City`
- Owner-approved short map URL: `https://maps.app.goo.gl/b5LULVrArcD8BwhF9?g_st=ac`
- Resolved address evidence: `Suhail Bilqaz Al Muhairi St - Al Falah - 1E - Abu Dhabi`
- Place ID: `null`
- Verification: `verified-browser-redirect`
- Last registry verification: `2026-07-20T08:27:00+04:00`
- Operating status: `limited-availability`
- Public / booking / Local SEO: `true / true / true`
- Services and hours: same approved coaching scope and general availability boundary as above
- Public approval evidence: owner-approved location receipt; Local SEO source of truth; active public registry
- Sitemap/page: `/locations/ics-al-falah`
- Consistency: current authoritative files consistently use `ICS Al Falah`; the observed Maps title adds `City` but does not replace the owner-approved display label
- Conflict: none requiring owner input
- Confidence: `VERIFIED`
- Decision: `KEEP`

### 2.3 ICS Khalifa

- Canonical public name: `ICS Khalifa`
- Registry ID: `ics-khalifa`
- Google Maps observed name: `International Community Schools - ICS Khalifa City`
- Owner-approved short map URL: `https://maps.app.goo.gl/cbWqzLqDSYXmEFyS9?g_st=ac`
- Resolved address evidence: `Khalifa City - SE38 - Abu Dhabi`
- Place ID: `null`
- Verification: `verified-browser-redirect`
- Last registry verification: `2026-07-20T08:27:00+04:00`
- Operating status: `limited-availability`
- Public / booking / Local SEO: `true / true / true`
- Services and hours: approved coaching scope and general availability boundary
- Public approval evidence: owner-approved receipt, Local SEO source and active registry
- Sitemap/page: `/locations/ics-khalifa`
- Consistency: current authoritative sources are consistent; Maps adds `City` only to observed venue name
- Conflict: none requiring owner input
- Confidence: `VERIFIED`
- Decision: `KEEP`

### 2.4 ICS Mushrif

- Canonical public name: `ICS Mushrif`
- Registry ID: `ics-mushrif`
- Google Maps observed name: `International Community Schools - ICS Mushrif`
- Owner-approved short map URL: `https://maps.app.goo.gl/Rgu2vKH7JDigAQQx6?g_st=ac`
- Resolved address evidence: `24th Street, Al Mushrif Area - Abu Dhabi`
- Place ID: `null`
- Verification: `verified-browser-redirect`
- Last registry verification: `2026-07-20T08:27:00+04:00`
- Operating status: `limited-availability`
- Public / booking / Local SEO: `true / true / true`
- Services and hours: approved coaching scope and general availability boundary
- Public approval evidence: owner-approved receipt, Local SEO source and active registry
- Sitemap/page: `/locations/ics-mushrif`
- Consistency: current sources use `ICS Mushrif`; historical `ICS Al Mushrif` is superseded by the active list
- Conflict: historical naming only, resolved by explicit supersession
- Confidence: `VERIFIED`
- Decision: `KEEP`

## 3. CONSISTENCY AND CONFLICT REGISTER

| Topic | Existing values | Resolution | Owner decision needed? |
|---|---|---|---|
| Najda display name | Historical `ICS Al Najda`; current `Najda Street`; Maps `ICS Al Danah...` | Public label is `Najda Street`; Maps name remains evidence metadata; Al Danah duplicate remains hidden | No |
| Mushrif display name | Historical `ICS Al Mushrif`; current `ICS Mushrif` | Current active list and registry control | No |
| Exact addresses | Resolved Maps destination text exists; Place IDs are null | Address text is evidence, not an authorization to mutate GBP/NAP; do not invent Place IDs | No generic question; account writes remain separately gated |
| Hours | Same windows across owner receipt, source of truth, source registry and public site | Describe only as Relax Fix UAE coaching availability | No |
| Status | Registry says all four public sites are `limited-availability` | Use this status; never imply guaranteed availability | No |
| Services | Local SEO source limits claims to learn-to-swim, water confidence and technique/performance | Do not add therapy, rehabilitation, Adaptive Aquatics or guaranteed outcomes | No |

No compact Owner Decision entry is required because current authoritative values are not contradictory. Historical variants are explicitly superseded.

## 4. PUBLIC APPROVAL AND RELEASE VERDICT

The four active sitemap locations are supported by direct owner-approval receipts, an approved Local SEO source of truth, an active typed source registry, sitemap generation, CI verification and Production rendering. They are no longer classified `BLOCKED_PENDING_OWNER_FACT`.

Location classification:

- Najda Street: `VERIFIED / KEEP`
- ICS Al Falah: `VERIFIED / KEEP`
- ICS Khalifa: `VERIFIED / KEEP`
- ICS Mushrif: `VERIFIED / KEEP`

This does not authorize GBP or directory writes. Live external account fields, Place IDs and account-side verification remain separate evidence gates.

## 5. UNAUTHENTICATED PRIVATE ROUTE RECEIPTS

### `/os`

- HTTP: `200`
- Body identity: session-verification shell only — `Verifying active staff session...`
- Sensitive data: none observed in SSR
- Cache: `no-store, max-age=0`
- Indexing: `x-robots-tag: noindex, nofollow, noarchive`
- Security headers: CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, restrictive Permissions Policy
- Raw error: none
- Verdict: `PARTIALLY_COMPLETED`; SSR boundary is safe, hydrated redirect/denial remains a browser-runtime receipt

### `/admin`

- HTTP: `404 Not Found`
- Body: plain `Not Found`
- Cache: `no-store, max-age=0`
- Indexing: `x-robots-tag: noindex, nofollow, noarchive`
- Sensitive data: none
- Raw error: none
- Verdict: `COMPLETED_VERIFIED_UNAUTHENTICATED_404`

## 6. SENSITIVE API INVENTORY AND RECEIPTS

Repository search identified these sensitive route families:

- Staff booking: `api.staff-bookings.ts`
- OS read APIs: command center, CRM, inbox, operations, media, analytics, integrations, content items, automation status and video jobs
- OS mutation APIs: CRM update, conversation mode/workflow, content update/transition and media/generation operations
- Internal worker APIs: publish worker, content-media worker and AI-media E2E

Representative exact unauthenticated Production GET receipts:

| Route | HTTP | Response | Cache/indexing | Leak/raw error verdict |
|---|---:|---|---|---|
| `/api/staff-bookings` | 401 | `{"error":"UNAUTHORIZED"}` | no-store; noindex/nofollow/noarchive | No data or raw error |
| `/api/os-crm` | 401 | `{"error":"UNAUTHORIZED"}` | no-store; noindex/nofollow/noarchive | No PII or raw error |
| `/api/os-inbox` | 401 | `{"error":"UNAUTHORIZED"}` | no-store; noindex/nofollow/noarchive | No messages or raw error |

CI also passes privileged API authentication, Staff mutation RBAC, mutation input, browser/session/CSRF/secret, API inventory/error/logging and Production manual-write boundary checks.

Verdict: `PARTIALLY_COMPLETED`. Representative high-value families return sanitized 401 responses. A route-by-route GET/allowed-method matrix for every mutation and internal worker endpoint remains a separate evidence expansion; no unsafe method was invoked in this batch.

## 7. SEMANTIC ROUTE RECOMMENDATION MATRIX

The repository architecture implements services, pricing, booking and contact as localized homepage sections. Current non-existent semantic URLs fall back to localized homepage HTML while preserving the requested URL and emitting the homepage canonical. The architecture-consistent recommendation is:

| Requested route | Canonical architecture | Recommendation |
|---|---|---|
| `/services` | `/#programs` | `REDIRECT_REQUIRED` |
| `/en/services` | `/en#programs` | `REDIRECT_REQUIRED` |
| `/pricing` | `/#pricing` | `REDIRECT_REQUIRED` |
| `/en/pricing` | `/en#pricing` | `REDIRECT_REQUIRED` |
| `/booking` | `/#book` | `REDIRECT_REQUIRED` |
| `/en/booking` | `/en#book` | `REDIRECT_REQUIRED` |
| `/contact` | `/#contact` | `REDIRECT_REQUIRED` |
| `/en/contact` | `/en#contact` | `REDIRECT_REQUIRED` |
| `/privacy` | Distinct Arabic document | `SHOULD_EXIST` |
| `/en/privacy` | Distinct English document | `SHOULD_EXIST` |
| `/locations/:locationId` for four active registry entries | Dynamic factual location page | `SHOULD_EXIST / KEEP` |
| Hidden `ics-al-danah` duplicate | Explicitly non-public | `404_REQUIRED` or remain unreachable |
| Unknown arbitrary public paths | No architecture contract | `404_REQUIRED` |

No redirect or route implementation was performed.

## 8. PROCESS GUARD RECEIPT

Before the repository write:

1. Default branch was resolved as `main`.
2. Current main HEAD was resolved as `5859fc0b113f9c553b287390ef7fd0df974be272`.
3. Intended branch was fixed as `agent/p1-2-github-location-route-reconciliation-20260801`.
4. Branch search returned no existing branch.
5. The target was explicitly confirmed not to be `main`.
6. Intended path was printed/fixed as `docs/product/P1_2_GITHUB_LOCATION_AND_ROUTE_FACT_RECONCILIATION_2026-08-01.md`.
7. Branch was created from the explicit main SHA.
8. File write passed the explicit non-main branch parameter.
9. No default-branch write was used.
10. No commit was created on `main`.

## 9. FINAL CLASSIFICATION

- GitHub location facts: `COMPLETED_VERIFIED`
- Four sitemap location records: `VERIFIED / KEEP`
- Public bilingual website: `PARTIALLY_COMPLETED` because semantic fallbacks and mobile runtime evidence remain open
- `/os` unauthenticated SSR boundary: `PARTIALLY_COMPLETED`
- `/admin` unauthenticated boundary: `COMPLETED_VERIFIED`
- Sensitive API representative authentication receipts: `PARTIALLY_COMPLETED`
- Semantic route decisions: `READY_WAITING_APPROVAL`

Overall:

`P1_2_GITHUB_LOCATION_FACTS_RECONCILED — NO_GENERIC_OWNER_QUESTION_REQUIRED — ROUTE_IMPLEMENTATION_AND_FULL_API_RUNTIME_MATRIX_REMAIN_SEPARATE`