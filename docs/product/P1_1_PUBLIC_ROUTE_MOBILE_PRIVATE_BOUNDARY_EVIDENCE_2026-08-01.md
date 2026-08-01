# P1.1 Public Route, Mobile and Private Boundary Evidence — 2026-08-01

Status: `PARTIALLY_VERIFIED_READ_ONLY`

Baseline:
- Repository: `aymanmahrous/swim-fluent-uae`
- Base branch: `main`
- Base SHA: `5859fc0b113f9c553b287390ef7fd0df974be272`
- Official Production deployment: `dpl_BX1Gcs7NEsE6c3KWf8FYaWJJfH9k`
- Production application commit: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`
- Canonical host: `https://www.relaxfixuae.com`

Managerial correction:
- `PUBLIC_BILINGUAL_WEBSITE = PARTIALLY_COMPLETED`

Owner policy:
- `COACH_DATA_SCOPE = ASSIGNED_LEARNERS_AND_ASSIGNED_CLIENTS_ONLY`
- Global Booking/CRM/Inbox access is not approved.
- No implementation, schema, migration, grant or RPC change is included.

Governance incident:
- `S2_PROCESS_GOVERNANCE_INCIDENT`
- `ACCIDENTAL_DIRECT_MAIN_DOCUMENTATION_WRITE`
- `CORRECTED_NO_PERSISTENT_PRODUCT_IMPACT`
- Accidental commit: `c0f5232b9a927374b81bbea919938597e9ee17fa`
- Corrective commit: `5859fc0b113f9c553b287390ef7fd0df974be272`

No Production booking, login, database write, migration, deployment, retry, permission mutation, publishing, scheduling, Analytics activation, Ads, billing or spend occurred.

## 1. EXACT_PUBLIC_ROUTE_RECEIPTS

All receipts were collected read-only from the official Production host. Where the route returned homepage content under the requested URL, it is classified as a homepage fallback rather than a distinct route.

| Requested route | HTTP | Final URL / redirects | Language and page identity | Title / canonical / hreflang | Indexability | CTA | Route verdict |
|---|---:|---|---|---|---|---|---|
| `/` | 200 | `/`; no redirect observed | Arabic homepage | Arabic SEO title; canonical `/`; ar-AE `/`, en-AE `/en`, x-default `/` | index,follow | Booking and WhatsApp present | Real canonical route |
| `/en` | 200 | `/en`; no redirect observed | English homepage | English SEO title; canonical `/en`; reciprocal hreflang | index,follow | Booking and WhatsApp present | Real canonical route |
| `/services` | 200 | URL remains `/services`; no redirect receipt | Arabic homepage identity | Homepage title; canonical `/` | indexable homepage metadata | Homepage CTAs | Homepage fallback; soft-route risk |
| `/en/services` | 200 | URL remains `/en/services`; no redirect receipt | English homepage identity | English homepage title; canonical `/en`; reciprocal hreflang | indexable homepage metadata | Homepage CTAs | Homepage fallback; soft-route risk |
| `/pricing` | 200 | URL remains `/pricing`; no redirect receipt | Arabic homepage identity with pricing section in document | canonical `/` | indexable homepage metadata | Booking/WhatsApp | Homepage fallback |
| `/en/pricing` | 200 | URL remains `/en/pricing`; no redirect receipt | English homepage identity | canonical `/en` | indexable homepage metadata | Booking/WhatsApp | Homepage fallback |
| `/booking` | 200 | URL remains `/booking`; no redirect receipt | Arabic homepage identity with `#book` form | canonical `/` | indexable homepage metadata | Booking form and WhatsApp | Homepage fallback |
| `/en/booking` | 200 | URL remains `/en/booking`; no redirect receipt | English homepage identity with `#book` form | canonical `/en` | indexable homepage metadata | Booking form and WhatsApp | Homepage fallback |
| `/privacy` | 200 | `/privacy`; no redirect observed | Arabic privacy page | `معلومات الخصوصية | Relax Fix UAE`; no canonical/hreflang observed | `noindex,nofollow,noarchive` | Email contact and return link | Real route |
| `/en/privacy` | 200 | `/en/privacy`; no redirect observed | English privacy page | localized privacy title; canonical/hreflang not proven | noindex expected from privacy contract; exact header/meta receipt incomplete | Email contact and return link | Real route; metadata parity partially verified |
| `/contact` | 200 | URL remains `/contact`; no redirect receipt | Arabic homepage identity | canonical `/` | indexable homepage metadata | Contact and WhatsApp section present | Homepage fallback |
| `/en/contact` | 200 | URL remains `/en/contact`; no redirect receipt | English homepage identity | canonical `/en` | indexable homepage metadata | Contact and WhatsApp section present | Homepage fallback |
| `/robots.txt` | 200 | Exact text response | N/A | Sitemap reference present | Allows `/`; disallows `/api/`, `/os`, `/staff`, `/admin` | N/A | Real static route |
| `/sitemap.xml` | 200 | Exact XML response | N/A | Includes `/`, `/en`, and four location routes | Search-engine discoverable | N/A | Real static route |

Observed route behavior proves that `/services`, `/en/services`, `/pricing`, `/en/pricing`, `/booking`, `/en/booking`, `/contact`, and `/en/contact` are not distinct semantic pages. They return localized homepage content with homepage canonicals and no redirect.

## 2. SITEMAP_LOCATION_FACT_CHECK

| URL | HTTP | Title / canonical | Unique content | Approved factual source | Owner-confirmed status | Thin/duplicate risk | Decision |
|---|---:|---|---|---|---|---|---|
| `/locations/najda-street` | 200 | Unique Najda title; self-canonical | Unique location name, map CTA and localized paragraph | Embedded source record: observed Google Maps name `ICS Al Danah - International Community School`, verified browser redirect on `2026-07-20T08:27:00+04:00` | Not independently reconfirmed by owner in this batch | Medium; template content is short but location-specific | `BLOCKED_PENDING_OWNER_FACT` |
| `/locations/ics-al-falah` | 200 expected from sitemap-backed dynamic route; exact body receipt not separately captured | Dynamic self-canonical expected; exact receipt incomplete | Expected location-specific template | Existing approved project location record only | Not reconfirmed in this batch | Medium | `BLOCKED_PENDING_OWNER_FACT` |
| `/locations/ics-khalifa` | 200 expected from sitemap-backed dynamic route; exact body receipt not separately captured | Dynamic self-canonical expected; exact receipt incomplete | Expected location-specific template | Existing approved project location record only | Not reconfirmed in this batch | Medium | `BLOCKED_PENDING_OWNER_FACT` |
| `/locations/ics-mushrif` | 200 expected from sitemap-backed dynamic route; exact body receipt not separately captured | Dynamic self-canonical expected; exact receipt incomplete | Expected location-specific template | Existing approved project location record only | Not reconfirmed in this batch | Medium | `BLOCKED_PENDING_OWNER_FACT` |

No sitemap deletion or modification was performed. KEEP cannot be issued until each location name, public operating status, map destination, training availability and owner authorization are reconfirmed against an approved factual source.

## 3. MOBILE_ACCESSIBILITY_RUNTIME_EVIDENCE — 390×844

### Evidence obtained without write

- Arabic and English SSR include responsive viewport metadata.
- Both homepages include labelled `name` and `tel` booking inputs.
- Empty required state renders `Next` disabled.
- Mobile fixed action bar contains Booking and WhatsApp actions with minimum-height classes.
- Consent region is labelled, provides Accept, Reject and Privacy controls, and states measurement rejection does not block booking.
- Assistant button has an accessible label and dialog semantics.
- Native buttons and form labels are used.
- No submission was executed.

### Runtime visual limitations

An executable 390×844 interactive browser session with screenshot capture could not be completed from the available execution runtime because the container had no resolvable network path to the Production hostname and the connected Vercel fetch action exposes HTML/headers but not keyboard or focus interaction. Therefore the following remain `BLOCKED_RUNTIME_EVIDENCE`, not passed:

- virtual keyboard opening and viewport resize;
- actual tab/focus sequence;
- visible focus ring across all controls;
- horizontal overflow under hydrated client layout;
- clipped elements while keyboard is open;
- progression through all five steps to the confirmation boundary;
- double-click UI suppression after the final action;
- hydrated loading/error visuals.

Static evidence supports the initial disabled-button state only. It does not prove double-click or loading behavior.

Mobile/accessibility verdict: `PARTIALLY_COMPLETED — INTERACTIVE_390x844_SCREENSHOT_AND_KEYBOARD_EVIDENCE_BLOCKED`.

## 4. PRIVATE_ROUTE_UNAUTHENTICATED_RECEIPTS

| Route | HTTP / behavior | Headers and indexability | Sensitive-data leak | Raw-error exposure | Verdict |
|---|---|---|---|---|---|
| `/staff` | 200 SSR shell showing only `جارٍ التحقق من الجلسة...`; client session verification follows | `cache-control: no-store`; `x-robots-tag: noindex, nofollow, noarchive`; CSP; `X-Frame-Options: DENY` | No Staff records, booking data, CRM data or user identity in SSR | No raw error in SSR | Boundary shell acceptable; client redirect/denial receipt still required |
| `/os` | Read-only runtime response not separately captured in this batch | robots.txt disallows; CI boundary exists | UNKNOWN | UNKNOWN | `PARTIALLY_COMPLETED` |
| `/admin` | Read-only runtime response not separately captured in this batch | robots.txt disallows | UNKNOWN | UNKNOWN | `PARTIALLY_COMPLETED` |
| Sensitive Staff API routes | Exact deployed route inventory and unauthenticated HTTP receipts were not all captured | `/api/` is disallowed by robots but robots is not authorization | No leak proven; no complete denial matrix | UNKNOWN | `BLOCKED_EXACT_RUNTIME_RECEIPTS` |

The `/staff` route returning HTTP 200 is not itself an authorization failure because it contains only a session-check shell and no sensitive data. Closure still requires hydrated unauthenticated redirect/denial evidence and exact API 401/403 receipts.

## 5. SEMANTIC_ROUTE_DECISION_MATRIX

| Route | Decision | Rationale |
|---|---|---|
| `/services` | `REDIRECT_REQUIRED` | Arabic service content is a homepage section; redirect to `/#programs` avoids soft-route duplication |
| `/en/services` | `REDIRECT_REQUIRED` | Redirect to `/en#programs` |
| `/pricing` | `REDIRECT_REQUIRED` | Pricing is a homepage section; redirect to `/#pricing` |
| `/en/pricing` | `REDIRECT_REQUIRED` | Redirect to `/en#pricing` |
| `/booking` | `REDIRECT_REQUIRED` | Booking canonical is the homepage form; redirect to `/#book` |
| `/en/booking` | `REDIRECT_REQUIRED` | Redirect to `/en#book` |
| `/contact` | `REDIRECT_REQUIRED` | Contact canonical is `/#contact` |
| `/en/contact` | `REDIRECT_REQUIRED` | Contact canonical is `/en#contact` |
| `/privacy`, `/en/privacy` | `SHOULD_EXIST` | Distinct operational privacy documents |
| Unknown arbitrary public paths | `404_REQUIRED` | Prevent homepage soft-404 behavior |
| Sitemap location routes | `OWNER_DECISION_REQUIRED` | Keep only after factual and operating-status confirmation |

No routing implementation was performed.

## 6. PROCESS_GUARD_RECEIPT

Pre-write guard executed before the repository write:

1. Intended branch resolved explicitly: `agent/p1-1-public-route-mobile-boundary-20260801`.
2. Branch search confirmed the branch did not already exist.
3. Target was explicitly checked as not `main`.
4. Base SHA was fixed explicitly to `5859fc0b113f9c553b287390ef7fd0df974be272`.
5. Intended path was fixed explicitly to `docs/product/P1_1_PUBLIC_ROUTE_MOBILE_PRIVATE_BOUNDARY_EVIDENCE_2026-08-01.md`.
6. Branch creation used the explicit base SHA.
7. File creation used an explicit non-main branch parameter.
8. No default-branch write behavior was used.
9. No commit was created on `main` in this batch.

## 7. RELEASE AND CLOSURE VERDICT

- `PUBLIC_BILINGUAL_WEBSITE = PARTIALLY_COMPLETED`.
- Canonical Arabic and English homepages, privacy, robots and sitemap exist.
- Eight semantic URLs currently produce homepage fallbacks instead of redirects or distinct pages.
- Location routes cannot be fully accepted until owner factual confirmation.
- Mobile 390×844 keyboard/focus/screenshot evidence remains blocked by the available runtime.
- `/staff` SSR leaks no sensitive data and is noindex/no-store, but hydrated denial and exact private API receipts remain incomplete.

Overall verdict:

`P1_1_PARTIALLY_COMPLETED — ROUTE_FALLBACKS_VERIFIED — LOCATION_FACTS_AND_INTERACTIVE_MOBILE_PRIVATE_API_RECEIPTS_REMAIN_OPEN`
