# Technical and Local SEO Audit

Verified: 2026-07-20 (Asia/Dubai)

Status: `STATIC_AND_BUILD_AUDIT_PASS_PREVIEW_LIGHTHOUSE_PENDING`

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

## Local intent map without thin pages

| Intent | Current destination | Unique value requirement before a dedicated page |
|---|---|---|
| تعليم سباحة للأطفال أبوظبي / swimming lessons for kids Abu Dhabi | Arabic/English home service and pricing sections | Existing strong intent; do not duplicate |
| مدرب سباحة أطفال أبوظبي / small group swimming lessons Abu Dhabi | Small-group pricing section | Explain max four, sibling price and assessment process |
| swimming coach near Najda Street | Training Locations section | Owner display name plus verified Maps link; do not claim Google’s official listing name is Najda Street |
| swimming lessons near Al Falah | Training Locations section | Real availability and distinct facility guidance needed for a future page |
| swimming lessons near Khalifa | Training Locations section | Same evidence threshold |
| swimming lessons near Mushrif | Training Locations section | Same evidence threshold |

No near-identical location pages are created. A dedicated page requires unique logistics, availability, photos/rights, FAQs and search intent evidence.

## Remaining evidence and actions

| Area | State | Next safe action |
|---|---|---|
| Broken external links | Maps short URLs browser-verified on 2026-07-20; full crawl pending | Re-run against final Preview |
| Indexability | Static contract passes; Search Console unverified | Read-only URL Inspection evidence |
| Core Web Vitals | No field data | Mobile Lighthouse and, later, Search Console CWV |
| Accessibility | Static design and labels present; exact mobile audit pending | Automated + keyboard/screen-width check on final Preview |
| Images | Hero JPG 86.33 kB in development build | Confirm dimensions, loading priority and decoded layout in Lighthouse |
| JavaScript | Main development client chunk 623.97 kB / 186.30 kB gzip; warning over 500 kB | Inspect production chunk and route-level code splitting; no new library added |
| External integrations | Disabled and not loaded for first-page booking writes | Verify network waterfall on Preview |
| Local GBP | Profile existence/visible verification owner-evidenced; live fields unverified | Use GBP Audit pack; no live write |

## Regression gates

- `npm run verify:public-seo`
- `npm run verify:revenue-foundation`
- `npm run verify:public-free-claims`
- TypeScript, production build and lint
- Final Preview: Arabic/English mobile, console, network, accessibility and Lighthouse
