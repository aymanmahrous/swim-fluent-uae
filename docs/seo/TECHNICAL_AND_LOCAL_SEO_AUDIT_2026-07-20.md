# Technical and Local SEO Audit

Verified: 2026-07-20 (Asia/Dubai)

Status: `STATIC_BUILD_AND_LOCAL_MOBILE_AUDIT_PASS_PROTECTED_PREVIEW_LIGHTHOUSE_BLOCKED`

## Implemented and contract-tested

- Unique Arabic and English titles/descriptions.
- Canonical URLs for `/` and `/en`.
- `ar-AE`, `en-AE` and `x-default` hreflang.
- Public sitemap limited to `/` and `/en`; private/API routes excluded.
- robots policy plus noindex headers for private routes.
- Organization, Person, Service, WebSite and WebPage structured data without ratings, reviews or street address invention.
- Local service places are generated from the central public registry only.
- Four public Training locations only: Najda Street, ICS Al Falah, ICS Khalifa and ICS Mushrif.
- The duplicate Al Danah Maps destination is hidden from public cards, Chatbot, booking resources, n8n and Local SEO.
- Tests reject duplicate public short URLs and duplicate resolved Maps destinations.
- RTL/LTR document state and bilingual route shells are contract-tested.
- Public conversion links use the approved email, WhatsApp and initial-assessment wording.
- The hero image is preloaded with high fetch priority and the Chatbot code is deferred into a separate lazy chunk.

## Local intent map without thin pages

| Intent                                                           | Current destination                              | Unique value requirement before a dedicated page                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| تعليم سباحة للأطفال أبوظبي / swimming lessons for kids Abu Dhabi | Arabic/English home service and pricing sections | Existing strong intent; do not duplicate                                                                |
| مدرب سباحة أطفال أبوظبي / small group swimming lessons Abu Dhabi | Small-group pricing section                      | Explain max four, sibling price and assessment process                                                  |
| swimming coach near Najda Street                                 | Training Locations section                       | Owner display name plus verified Maps link; do not claim Google’s official listing name is Najda Street |
| swimming lessons near Al Falah                                   | Training Locations section                       | Real availability and distinct facility guidance needed for a future page                               |
| swimming lessons near Khalifa                                    | Training Locations section                       | Same evidence threshold                                                                                 |
| swimming lessons near Mushrif                                    | Training Locations section                       | Same evidence threshold                                                                                 |

No near-identical location pages are created. A dedicated page requires unique logistics, availability, photos/rights, FAQs and search intent evidence.

## Remaining evidence and actions

| Area                  | State                                                                                                                                                      | Next safe action                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Broken external links | Maps short URLs browser-verified on 2026-07-20; full crawl pending                                                                                         | Re-run against final Preview                                                                       |
| Indexability          | Static contract passes; Search Console unverified                                                                                                          | Read-only URL Inspection evidence                                                                  |
| Core Web Vitals       | Local throttled lab: CLS 0.0087 Arabic / 0.001 English; LCP not accepted because the local server sent the main bundle uncompressed; no field INP data     | Run Lighthouse/PageSpeed against an authorized compressed Preview, then compare Search Console CWV |
| Accessibility         | 390×844 Arabic RTL and English LTR automated checks passed: no horizontal overflow, unnamed visible controls, missing alt, duplicate IDs or H1-count error | Complete keyboard and screen-reader smoke test on authorized final Preview                         |
| Images                | Hero JPG 86.33 kB; observed as LCP element; preload/high priority added                                                                                    | Measure compressed Preview LCP and confirm responsive dimensions                                   |
| JavaScript            | Production main client chunk 442.09 kB / 133.43 kB gzip; Chatbot split into 0.61 kB / 0.33 kB gzip lazy chunk                                              | Continue route/vendor analysis only if compressed Preview or field data shows a regression         |
| External integrations | Local network waterfall had no eager n8n/Calendar requests, duplicate request URLs, failed requests, application HTTP errors or console errors             | Repeat against authorized final Preview with Chatbot feature enabled                               |
| Local GBP             | Profile existence/visible verification owner-evidenced; live fields unverified                                                                             | Use GBP Audit pack; no live write                                                                  |

## Mobile evidence and limitation

- Test mode: Chrome, mobile viewport `390×844`, 150 ms latency, 1.6 Mbps throughput and 4× CPU throttling.
- Arabic and English each produced one H1, correct `lang`/`dir`, no layout overflow, no duplicate network URL and no external Calendar/n8n request.
- Local CLS passed the `<0.1` target. No interaction latency was observed in this non-interactive navigation run, so this is not field INP proof.
- The Vercel Preview redirects a fresh automated browser to Vercel Authentication. That is protection behavior, not an application failure. Exact Lighthouse scores and compressed Preview LCP therefore remain unverified.
- The signed-in browser verified the deployed public content and opened the Chatbot at commit `93876b6`: all four approved display names and approved WhatsApp appeared, `Najda Street` appeared, `ICS Al Danah` did not, and the Chatbot opened with its preliminary-time path.

## Regression gates

- `npm run verify:public-seo`
- `npm run verify:revenue-foundation`
- `npm run verify:public-free-claims`
- TypeScript, production build and lint
- Final Preview: Arabic/English mobile, console, network, accessibility and Lighthouse
