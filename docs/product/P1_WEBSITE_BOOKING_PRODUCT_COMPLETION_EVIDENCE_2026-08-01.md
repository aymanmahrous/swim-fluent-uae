# P1 Website, Booking and Product Completion Evidence — 2026-08-01

Status: `PARTIALLY_VERIFIED_READ_ONLY`

Production baseline:
- Project: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Deployment: `dpl_BX1Gcs7NEsE6c3KWf8FYaWJJfH9k`
- Commit: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`
- State: `READY`
- Canonical host: `https://www.relaxfixuae.com`

No Production booking, database write, migration, deployment, retry, permission change, Analytics activation, publishing, scheduling, Ads, billing or spend occurred.

## PUBLIC_WEBSITE_ROUTE_MATRIX

| Route | HTTP | Metadata / canonical | CTA, mobile and accessibility | Classification |
|---|---:|---|---|---|
| `/` | 200 | Arabic homepage; canonical `/`; ar-AE `/`, en-AE `/en`, x-default `/` | Labelled booking inputs, Booking/WhatsApp CTAs, fixed mobile action bar, consent region | `COMPLETED_VERIFIED` read-only; mobile interaction `PARTIALLY_COMPLETED` |
| `/en` | 200 | English title and description; canonical `/en`; reciprocal hreflang | LTR, labelled inputs, disabled Next with empty fields, Booking/WhatsApp and Privacy controls | `COMPLETED_VERIFIED` read-only |
| `/services` | 200 | Arabic homepage is returned with canonical `/` | Homepage programs and CTAs render | `PARTIALLY_COMPLETED`; fallback alias, not distinct route |
| `/en/services` | UNKNOWN exact receipt | Services exist at `/en#programs` | Section anchor exists | `PARTIALLY_COMPLETED` |
| `/pricing`, `/en/pricing` | UNKNOWN exact receipt | Pricing is a localized homepage section | Responsive cards exist | `PARTIALLY_COMPLETED`; standalone routes unproved |
| `/privacy` | 200 | Arabic privacy page; `noindex,nofollow,noarchive`; no canonical/hreflang observed | Structured headings, mail contact, back link, consent controls | `COMPLETED_VERIFIED` content; metadata relationship `PARTIALLY_COMPLETED` |
| `/en/privacy` | Route linked from English UI | Exact response not separately captured | Consent UI links to it | `PARTIALLY_COMPLETED` |
| `/booking`, `/en/booking` | UNKNOWN exact receipt | Booking is localized homepage section `#book` | Five-step forms exist | `PARTIALLY_COMPLETED`; standalone routes unproved |
| Contact/WhatsApp | Homepage 200 | Embedded in localized canonical pages | Persistent and location-specific WhatsApp links; visible text and noreferrer | `COMPLETED_VERIFIED` presence |
| `/sitemap.xml` | 200 XML | `/`, `/en`, and four location URLs; bilingual alternates on home URLs | N/A | `COMPLETED_VERIFIED` response |
| `/robots.txt` | 200 text | Allows `/`; disallows `/api/`, `/os`, `/staff`, `/admin`; references sitemap | Robots is not authorization | `COMPLETED_VERIFIED` response |
| Private routes | Not live-tested in this batch | CI verifies public/internal boundaries | Runtime unauthorized HTTP matrix incomplete | `PARTIALLY_COMPLETED` |

### Reproducible route defect

`/services` returns HTTP 200 with homepage content and canonical `/`. Unsupported semantic paths should redirect to the correct localized anchor, return a distinct route, or return 404. The current behavior creates ambiguous route semantics and potential soft-404 behavior.

## BOOKING_JOURNEY_MATRIX

No Production submission was made.

| Control | Evidence | Classification |
|---|---|---|
| Arabic journey | Five steps: بياناتك، الحالة، التدريب، الموعد، التأكيد; labelled name/phone fields | `PARTIALLY_COMPLETED` |
| English journey | Five steps: About You, Profile, Coaching, Time, Confirm | `PARTIALLY_COMPLETED` |
| Mobile journey | Responsive structure and fixed Booking/WhatsApp bar; consent-spacing fix is on Production | `PARTIALLY_COMPLETED`; keyboard-open state unproved |
| Required validation | Next disabled with empty required fields; server validates required values | `PARTIALLY_COMPLETED` |
| Phone validation | tel input, tel input mode, +971 placeholder; server normalizes and validates UAE mobile format | `PARTIALLY_COMPLETED`; invalid-number receipt absent |
| Duplicate-click prevention | Database idempotency is statically supported | `BLOCKED` runtime proof until isolated environment exists |
| Loading state | Static application contracts exist | `PARTIALLY_COMPLETED`; visual state not captured |
| Error state | Server returns sanitized generic booking errors | `PARTIALLY_COMPLETED`; localized browser state not captured |
| Confirmation boundary | Fifth confirmation step exists | `READY_WAITING_APPROVAL` for isolated testing only |
| Privacy/Consent | Measurement denied by default; Privacy links exist; rejection does not block booking | `COMPLETED_VERIFIED` SSR presence |
| WhatsApp alternative | Persistent and location-specific links in both languages | `COMPLETED_VERIFIED` presence |
| Keyboard/accessibility | Associated labels, native buttons, disabled states, aria-labelled assistant and consent regions | `PARTIALLY_COMPLETED`; manual tab/focus/screen-reader journey absent |

Overall booking verdict: `PARTIALLY_COMPLETED`. Public UI and static server protections exist, but safe end-to-end write, timeout, refresh, double-click, localized error and confirmation evidence remain deferred.

## PRODUCT_COMPLETION_MATRIX

| Product area | Classification | Evidence boundary |
|---|---|---|
| Public bilingual website | `COMPLETED_VERIFIED` | Production READY; Arabic/English SSR, metadata, CTAs, pricing, locations and contact verified |
| Booking UI | `PARTIALLY_COMPLETED` | Five-step form present; no isolated end-to-end submission |
| Booking ingress/idempotency | `PARTIALLY_COMPLETED` | Static function/grant/CI proof; runtime concurrency deferred |
| Staff dashboard | `PARTIALLY_COMPLETED` | Authenticated UI previously visualized; per-role runtime fixtures incomplete |
| CRM | `PARTIALLY_COMPLETED` | UI/RPCs exist; coach global scope is not approved |
| Content studio | `PARTIALLY_COMPLETED` | UI and privileged contracts exist; writes/generation not executed |
| Media library | `PARTIALLY_COMPLETED` | UI and historical asset previously observed; storage write tests incomplete |
| Analytics screens | `PARTIALLY_COMPLETED` | Preview/consent foundations pass CI; Production activation prohibited |
| AI image/video controls | `PARTIALLY_COMPLETED` | Controls exist; paid generation not executed |
| Mobile UX | `PARTIALLY_COMPLETED` | Responsive structure and spacing fix exist; full device QA incomplete |
| API/data-source verification | `PARTIALLY_COMPLETED` | Supabase functions/RLS/grants inspected; full screen-to-response proof absent |
| Write-operation verification | `BLOCKED` | Production writes prohibited; no approved free isolated environment |
| Authenticated runtime verification | `PARTIALLY_COMPLETED` | Visual access previously verified; role/data-scope API fixtures incomplete |

## MOBILE_AND_ACCESSIBILITY_DEFECT_REGISTER

| ID | Route / viewport | Reproduction | Expected | Actual | Severity | Recommended isolated fix |
|---|---|---|---|---|---:|---|
| P1-DEF-01 | `/services`, any | Request path directly | Redirect to `/#programs`, distinct page or 404 | HTTP 200 homepage with canonical `/` | S2 | Explicit redirect/404 routing and tests |
| P1-DEF-02 | `/pricing`, `/booking` and English equivalents | Request semantic path | Localized anchor redirect or standalone route | Standalone contracts unproved; architecture relies on homepage sections | S2 | Canonical-safe redirect tests before implementation |
| P1-DEF-03 | Booking at 390×844 with mobile keyboard | Open form while consent and fixed CTA layers exist | Active field/action and focus remain visible | Keyboard-open state unproved | S2 | Isolated iOS/mobile keyboard visual test; patch only if reproduced |
| P1-DEF-04 | Staff Booking/CRM/Inbox as coach | Invoke current read RPCs | Assigned learners and assigned clients only | Current allowlists include coach and return global collections | S1 | Separate assignment-scoped server design, migration, tests and rollback |

No other visual defect is claimed without reproducible evidence.

## RELEASE_BLOCKER_REGISTER

| Blocker | Prevents | Severity | Safe state | Closure evidence |
|---|---|---:|---|---|
| No isolated booking-write environment | Full booking and duplicate/retry proof | S1 | No Production booking | Non-Production Arabic/English/mobile receipts, concurrent same-key, timeout and refresh tests |
| Coach global Booking/CRM/Inbox reads | Least-privilege Staff follow-up | S1 | Manager policy: `ASSIGNED_LEARNERS_AND_ASSIGNED_CLIENTS_ONLY` | Assignment model, new migration, role/scope tests, rollback and Preview proof |
| Production Analytics activation not approved | Conversion measurement and Organic Pilot measurement | S1 | Consent UI live; Production Analytics off | Privacy approval, Preview no-PII/deduplication proof and explicit activation approval |
| Publishing readiness/account gates incomplete | Organic Pilot | S1 | Existing receipts preserved; no publishing/scheduling | Ownership/linkage, credential custody, ambiguous-state and release approval evidence |
| Per-role authenticated runtime matrix incomplete | Safe Staff operation | S1 | Static gates only | Non-Production role fixtures with HTTP/RPC/data-scope evidence |
| Semantic paths fall back to homepage | SEO and shareable-route correctness | S2 | Canonical homepage authoritative | Redirect/404 tests and isolated routing PR |
| Replit unavailable | Command Center acceptance | S2 | GitHub/Vercel remain authoritative | Correct account access and read-only drift receipt |

## COMMAND_AND_CI_EVIDENCE

P0 predecessor head `0b046eb0a8b31311ee33e91c9e76b9d1f20c3aac`:
- CI #795: SUCCESS
- Public Analytics Foundation #31: SUCCESS
- Public CTA Events #23: SUCCESS
- Bilingual Analytics Consent UI #21: SUCCESS

Production read-only receipts captured on 2026-08-01:
- `/en`: HTTP 200 with canonical/hreflang and booking/WhatsApp/consent controls.
- `/privacy`: HTTP 200 with Arabic operational privacy content and noindex.
- `/services`: HTTP 200 homepage fallback with canonical `/`.
- `/robots.txt`: HTTP 200 with private-path disallow declarations.
- `/sitemap.xml`: HTTP 200 XML with bilingual home URLs and location URLs.

## ACCEPTANCE_VERDICT

`P1_WEBSITE_BOOKING_PRODUCT_COMPLETION_EVIDENCE_PARTIALLY_VERIFIED`

The bilingual public website is live and materially complete for read-only browsing and lead entry. Full product completion remains unproved because booking writes, duplicate/retry behavior, mobile keyboard interaction, authenticated per-role data scope and Staff writes lack isolated runtime evidence. The highest-priority confirmed safety issue is that coach access must be reduced from global Booking/CRM/Inbox collections to assigned learners and assigned clients only in a separate security workstream.

## SAFETY_LOG

An accidental temporary documentation file was created directly on `main` and immediately deleted. The resulting revert commit restored the tree; no lasting file content or Production behavior change remains. Commits: accidental `c0f5232b9a927374b81bbea919938597e9ee17fa`; corrective `5859fc0b113f9c553b287390ef7fd0df974be272`.