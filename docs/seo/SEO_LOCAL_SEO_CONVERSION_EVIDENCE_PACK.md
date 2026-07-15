# SEO, LOCAL SEO, AND CONVERSION EVIDENCE PACK

Status: `SEO_LOCAL_SEO_EVIDENCE_PACK_READY_EXTERNAL_ACCOUNT_AND_FIELD_DATA_PENDING`

Verified: 2026-07-15 (Asia/Dubai)

Parent workstreams: Issues #58 and #79

This pack records read-only evidence from the current GitHub `main`, the connected Vercel Production project, the canonical public domain, and existing project documentation. It does not authorize a Google Business Profile or Search Console write, an indexing request, a Production booking, Analytics activation, a new public claim, a new local landing page, or a Production code change.

## 1. Evidence method and source priority

Evidence was evaluated in this order:

1. current connected Vercel deployment metadata and direct HTTP responses;
2. current repository code and merged documentation on `main`;
3. current canonical-domain responses for `/`, `/en`, `/robots.txt`, and `/sitemap.xml`;
4. external search/index snapshots only as evidence of what a crawler or cached index may still show;
5. owner-provided Google Business Profile and Search Console screenshots when later supplied.

A search result or cached page is not allowed to override a newer direct Production response. A repository contract is not proof of a live Google-account setting. Unknown account facts remain unknown.

## 2. Current Production deployment evidence

Connected Vercel evidence at the verification time:

- Project: `swim-fluent-uae-w532`
- Project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Latest Production deployment: `dpl_2tXJXcmmwjjxZhoMPTNJFiK9nDX2`
- Deployment state: `READY`
- Git branch: `main`
- Git commit: `5386e43bdbfae4450dd7c8df855ff49c2581d5a8`
- Canonical aliases include:
  - `www.relaxfixuae.com`
  - `relaxfixuae.com`
- Arabic `/`: HTTP 200
- English `/en`: HTTP 200
- `robots.txt`: HTTP 200
- `sitemap.xml`: HTTP 200

The Arabic and English pages returned the corrected public-claims version:

- Arabic assessment wording: `طلب تقييم أولي`
- English assessment wording: `Request an initial assessment`
- Arabic trust label: `تدريب شخصي`
- English trust label: `Personal Coaching`
- three public program cards only:
  - Learn to Swim / تعلم السباحة
  - Water Confidence / التغلب على خوف الماء
  - Technique & Performance / تطوير الأداء

Direct Production did not contain the previously removed `15+ yrs`, free/complimentary wording, Adaptive Aquatics public program, supportive aquatic movement section, People of Determination public booking category, or unverified Organization founder relationship.

## 3. Search-index and cache drift

An external public search/page snapshot observed during this audit still exposed an older cached version containing prohibited or superseded claims. Direct canonical-domain and connected Vercel responses returned the newer corrected version.

Classification:

`SEARCH_INDEX_CACHE_STALE_NOT_CURRENT_PRODUCTION`

Required handling:

- do not redeploy or reintroduce code merely because a search cache is stale;
- preserve the stale result as evidence with observation date;
- verify Google Search Console URL Inspection for `/` and `/en` when owner access/evidence is available;
- compare Google-selected canonical, last crawl, crawled HTML/screenshot, and indexing state;
- request re-indexing only after review and separate owner authorization where necessary;
- continue monitoring until indexed snippets no longer expose superseded claims;
- do not claim the stale result is the current website.

## 4. Public URL and indexation map

| URL/path | Current direct evidence | Intended index state | Notes |
|---|---|---|---|
| `/` | HTTP 200, Arabic, RTL | Index/follow | Arabic canonical homepage and `x-default` target |
| `/en` | HTTP 200, English, LTR | Index/follow | English canonical homepage |
| `/robots.txt` | HTTP 200 | Public | Lists sitemap and blocks private/admin path families |
| `/sitemap.xml` | HTTP 200 | Public | Contains exactly `/` and `/en` with language alternates |
| `/api/*` | Not crawled in this audit | Disallow | Private/backend route family |
| `/os*` | Not crawled in this audit | Disallow | Internal operating-system path family |
| `/staff*` | Not crawled in this audit | Disallow | Staff path family |
| `/admin*` | Not crawled in this audit | Disallow | Admin path family |
| `/privacy` | Not implemented/published | Keep absent/unpublished until approved | Future Arabic Privacy route |
| `/en/privacy` | Not implemented/published | Keep absent/unpublished until approved | Future English Privacy route |

The audit did not submit any form, request indexing, access a private route, or create a customer record.

## 5. Observed robots and sitemap contract

Observed `robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /os
Disallow: /staff
Disallow: /admin

Sitemap: https://www.relaxfixuae.com/sitemap.xml
```

Observed sitemap inventory:

- `https://www.relaxfixuae.com/`
- `https://www.relaxfixuae.com/en`

Each URL provides alternate links for:

- `ar-AE`
- `en-AE`
- `x-default` → Arabic root

No private/admin URLs were observed in the sitemap.

## 6. Arabic and English metadata matrix

| Field | Arabic `/` | English `/en` | Audit result |
|---|---|---|---|
| `lang` / direction | `ar` / `rtl` | `en` / `ltr` | Pass |
| Title | `تعليم السباحة والثقة المائية في أبوظبي \| كوتش أيمن \| Relax Fix UAE` | `Swimming & Water Confidence Coach Abu Dhabi \| Coach Ayman \| Relax Fix UAE` | Pass; language-specific and factual |
| Description | `تدريب سباحة وثقة مائية في أبوظبي مع كوتش أيمن، يبدأ بتقييم واضح وتدرج يناسب نقطة بداية كل متدرب.` | `Swimming and water-confidence coaching in Abu Dhabi with Coach Ayman, with a clear assessment and step-by-step training based on each learner’s starting point.` | Pass; no prohibited offer/credential claim |
| Canonical | `https://www.relaxfixuae.com/` | `https://www.relaxfixuae.com/en` | Pass |
| `hreflang` | `ar-AE`, `en-AE`, `x-default` | reciprocal set | Pass |
| Robots meta | `index,follow,max-image-preview:large` | same | Pass |
| Open Graph title/description/URL/locale | language-specific | language-specific | Pass |
| Twitter card/title/description | `summary_large_image`, language-specific | same | Partial |
| `og:image` | absent | absent | Gap |
| `twitter:image` | absent | absent | Gap |

Recommended next technical SEO implementation after audit review:

- add one owner-approved, rights-cleared, correctly sized social preview image or localized variants;
- verify Open Graph/Twitter image absolute URLs, dimensions, compression, and public accessibility in Preview;
- keep the PR isolated from unrelated content, Privacy, Analytics, or schema changes.

## 7. Structured-data audit

Observed JSON-LD graph on both public languages:

- `Organization`
- `Person`
- `Service`
- `WebSite`
- `WebPage`

Verified safe properties include:

- Organization name: `Relax Fix UAE`
- public phone: `+971551378660`
- public email: `swimmingayman@gmail.com`
- Person name: `Coach Ayman`
- Person role: swimming and water-confidence coach
- Person `knowsAbout` limited to swimming coaching, water confidence, and swimming technique
- service area: Abu Dhabi, United Arab Emirates
- Arabic/English language availability
- correct language-specific WebPage URLs, names, descriptions, and canonical relationships

Verified exclusions:

- no unverified founder relationship
- no Adaptive Aquatics, rehabilitation, therapy, diagnosis, or credential claim
- no street address
- no opening hours
- no unverified social `sameAs`

Current gaps and decisions:

| Candidate | Current decision |
|---|---|
| `LocalBusiness` subtype | Do not add until business type/category, address visibility, service-area representation, and factual operating model are reviewed. Current Organization + Service graph is safer. |
| Opening hours | Owner decision required; never assume 24 hours. |
| Street address | Do not publish unless explicitly approved and appropriate for the service-area model. |
| `sameAs` Facebook | Canonical Page URL missing. Do not use a post receipt URL. |
| `sameAs` Instagram | Official profile is documented, but add only in a reviewed isolated schema PR. |
| Ratings/reviews | Do not add aggregate rating or testimonial schema without genuine compliant evidence and policy review. |
| Credentials/awards | Do not add without verified evidence and publication approval. |

## 8. Keyword-to-page map

The current website has only two indexable public pages. Keywords must map to the correct language homepage without creating thin duplicate local pages.

### Arabic `/`

Primary approved themes:

- تعليم السباحة في أبوظبي
- مدرب سباحة في أبوظبي
- الثقة داخل الماء
- التغلب على خوف الماء
- تعلم السباحة للمبتدئين
- تحسين تقنية السباحة
- كوتش أيمن

Supported intent:

- informational: foundations, breathing, floating, water confidence, technique
- commercial consideration: swimming/water-confidence coaching in Abu Dhabi
- conversion: request an initial assessment

Do not target or publish:

- علاج مائي
- إعادة تأهيل مائي
- علاج الخوف أو القلق
- تدريب أصحاب الهمم as a current public service claim
- medical/therapy/diagnostic terms
- unverified credentials, prices, offers, or outcomes

### English `/en`

Primary approved themes:

- swimming coach Abu Dhabi
- swimming instructor Abu Dhabi
- water confidence coach Abu Dhabi
- learn to swim Abu Dhabi
- beginner swimming Abu Dhabi
- fear of water swimming coaching
- swimming technique Abu Dhabi
- Coach Ayman

Do not target or publish:

- aquatic therapy
- aquatic rehabilitation
- medical swimming treatment
- adaptive swimming as a current public service claim
- guaranteed results, unverified experience, credentials, or free offers

## 9. Internal-linking and information architecture

Current public navigation is primarily same-page:

- header → Programs section
- header/hero → Booking section
- Arabic ↔ English language switch
- content sections → same booking request path

Current strengths:

- clear primary action
- short path from service explanation to booking form
- reciprocal language navigation
- one coherent topic per homepage language

Current gaps:

- no dedicated, approved service pages
- no FAQ page/section designed for indexable substantial answers
- no standalone contact page
- no approved Privacy pages/footer link
- no public Coach Ayman evidence/profile page
- no substantial location/service-area landing pages

Recommended architecture sequence:

1. finalize Privacy copy and implement approved bilingual Privacy routes;
2. use Search Console and query evidence to determine whether one substantial bilingual FAQ/service expansion is justified;
3. create only pages with distinct user value, approved claims, unique Arabic/English content, and real internal links;
4. avoid mass neighborhood pages, swapped place names, or duplicate service text;
5. add breadcrumb/schema only after real hierarchy exists.

## 10. Local SEO source of truth

| Field | Approved or observed value | Confidence/state |
|---|---|---|
| Business name | `Relax Fix UAE` | Approved project identity |
| Coach | `Coach Ayman` | Approved public identity |
| Phone E.164 | `+971551378660` | Present in Production structured data |
| Display phone | `+971 55 137 8660` | Approved formatting reference |
| Website | `https://www.relaxfixuae.com/` | Canonical Production URL |
| Primary service area | Abu Dhabi, United Arab Emirates | Approved broad service-area representation |
| Business model | Service-area swimming and water-confidence coaching | Documented model |
| Street address | Do not publish unless explicitly approved | Owner/protected decision |
| Target primary GBP category | Swimming instructor / مدرس سباحة | Target; live acceptance/current state unverified |
| Additional GBP categories | Unknown | Owner/account evidence required |
| Business hours | Unknown | Owner decision required; no 24-hour assumption |
| Instagram | `https://www.instagram.com/relaxfixuae/` | Documented official profile |
| Facebook Page | Unknown | A Facebook post receipt is not a canonical Page URL |
| GBP verification/review state | Unknown | Current account screenshot/evidence required |
| Google Search Console property | Unknown | Owner/account evidence required |

## 11. Google Business Profile readiness

Read-only checklist requiring owner/account evidence:

- [ ] verification/review state and any pending action
- [ ] exact business name
- [ ] current primary and additional categories
- [ ] public phone
- [ ] canonical website URL
- [ ] address visibility
- [ ] actual supported service areas
- [ ] accurate hours and holiday hours
- [ ] Arabic and English description
- [ ] services and descriptions
- [ ] logo, cover, and approved business photos
- [ ] assessment-request link, if supported and approved
- [ ] messaging state, if supported
- [ ] official Facebook Page and Instagram URLs
- [ ] removal of old Design Agency/creative-studio identity
- [ ] no free/complimentary, medical, rehabilitation, credential, or guaranteed-outcome claims

No GBP edit, appeal, duplicate listing, verification action, or category change was performed in this audit.

## 12. Citation and genuine-review plan

Recommended local authority workflow:

- correct existing factual business records before adding new directories;
- use the exact name, phone, canonical website, and broad Abu Dhabi service area;
- keep address and hours unknown/unpublished until approved;
- prioritize credible UAE business/local directories only after verifying their terms and relevance;
- retain submission URL, submitted values, account owner, date, status, and screenshot receipt;
- never fabricate business history, permits, addresses, locations, credentials, or citations.

Genuine review workflow requirements:

- ask only real customers through an approved human-controlled process;
- do not offer prohibited incentives or condition requests on positive sentiment;
- do not write reviews for customers;
- do not publish names, photos, child information, disability/health details, or lesson history without permission;
- keep platform, request date, requester, public review URL, response status, and moderation/escalation receipt;
- owner approves public responses to sensitive or disputed reviews;
- no AI-generated customer story is represented as a testimonial.

## 13. Mobile, performance, and Core Web Vitals baseline

Verified technical observations from current Production HTML:

- responsive viewport meta present;
- hero image is preloaded;
- hero image has explicit 1920×1080 dimensions;
- CSS and JavaScript assets are fingerprinted;
- Google Fonts preconnects are present;
- Arabic and English direction/language are correct;
- direct pages returned HTTP 200.

Not yet evidenced:

- real-user Core Web Vitals from Search Console or Vercel Speed Insights
- Lighthouse mobile/desktop lab runs for the current Production commit
- LCP element timing and image byte size/compression
- INP and long-task profile
- CLS measurement
- font-loading impact
- form interaction performance on representative iPhone/Android devices

Classification:

`CWV_AND_MOBILE_PERFORMANCE_FIELD_BASELINE_EVIDENCE_REQUIRED`

Do not claim a Core Web Vitals pass without measured field/lab evidence. Obtain a read-only baseline before optimization, then isolate each performance PR and compare before/after results.

## 14. Conversion-readiness audit

### Verified strengths

- one prominent assessment-request path in Arabic and English;
- approved non-free assessment wording;
- clear hero and section CTAs;
- five-step booking UI with visible first-step labels;
- service explanation and starting-point positioning before the form;
- Arabic RTL and English LTR public rendering;
- no real booking submission was necessary for this audit.

### Gaps requiring review or implementation

- no approved Privacy routes or footer Privacy links;
- no Consent UI or Analytics measurement;
- no field evidence for actual form completion rate or step abandonment;
- no approved call CTA in the current public interface;
- WhatsApp controls are conditional and need exact CTA/event mapping later;
- no public FAQ handling common objections before the form;
- no independent current visual/interactive mobile audit of all five form steps in this SEO pack;
- form validation, error recovery, and final success behavior require Preview evidence without Production submission;
- no Search Console query/click data to validate keyword and snippet decisions;
- no GBP/account evidence for local conversion actions.

Recommended conversion sequence:

1. complete Privacy/Consent owner decisions;
2. run a Preview-only bilingual mobile/accessibility/form-friction audit;
3. collect Search Console/GBP read-only evidence;
4. implement approved Privacy routes and Consent UI in isolated PRs;
5. implement consent-gated measurement only after the full Analytics gate;
6. validate real funnel behavior before paid media.

## 15. Prioritized implementation proposal

### P0 — Evidence and public-trust protection

1. Capture Search Console URL Inspection for `/` and `/en`, including crawled page, last crawl, Google-selected canonical, and indexing status.
2. Record GBP verification, name, category, phone, website, service areas, hours, descriptions, and photos.
3. Monitor and resolve stale indexed snippets without reintroducing old claims.
4. Finalize Privacy/Consent decisions and keep Analytics off.
5. Replace stale internal Local SEO descriptions that still referenced removed public claims.

### P1 — Small isolated technical/content PRs after review

1. Open Graph/Twitter preview image.
2. Approved `sameAs` links after canonical profile confirmation.
3. Bilingual Privacy routes and footer links after final approval.
4. One substantial FAQ/service-information expansion based on real query/user evidence.
5. Preview-only accessibility/form-friction corrections.

### P2 — Measured performance and richer local architecture

1. Establish Lighthouse and field CWV baseline.
2. Optimize the measured LCP/image/font/script bottleneck only.
3. Consider LocalBusiness/schema refinement after exact business/category/hours/address/service-area decisions.
4. Consider substantial service/location pages only when unique evidence and user value exist.

## 16. Evidence still required from the owner or connected accounts

- Search Console property and URL Inspection screenshots/data
- sitemap submission status and indexed/not-indexed reports
- Search Console queries, clicks, impressions, CTR, position, and CWV reports
- GBP verification/review status and current fields
- approved business hours
- exact supported service areas beyond broad Abu Dhabi, if any
- canonical Facebook Page URL
- current GBP category acceptance
- approved photos and permission evidence
- Vercel Speed Insights or equivalent field data, if enabled
- any genuine review/citation inventory

These gaps are blockers for claiming completion of external SEO/Local SEO execution, but they do not invalidate the read-only evidence pack.

## 17. Final status and exclusions

Completed in this pack:

- current Production URL/metadata/robots/sitemap/structured-data audit
- search-cache drift classification
- approved-keyword and internal-link map
- factual NAP table with unknowns
- GBP, citation, and genuine-review readiness requirements
- conversion-readiness findings
- CWV evidence gap
- prioritized isolated implementation plan

Not completed or authorized:

- Search Console or GBP write
- indexing request
- external citation submission
- review request
- public code implementation
- Privacy/Consent implementation
- Analytics activation
- Production booking
- new public claim, address, hours, service area, credential, or testimonial
- publishing, messaging, Ads, billing, or spend

Final truthful state:

`SEO_LOCAL_SEO_EVIDENCE_PACK_READY_EXTERNAL_ACCOUNT_CWV_AND_OWNER_FACTS_PENDING`