# PROJECT HANDOFF

Last verified: 2026-07-14 (Asia/Dubai)

This file is the operational source of truth for continuing the Relax Fix UAE / Swim Fluent UAE project. Read it together with `PROJECT_STRATEGY_HANDOFF.md`. Do not restart the project, repeat completed work, or change the approved sequence without a documented reason and explicit owner approval.

## 1. Current confirmed state

- Repository: `aymanmahrous/swim-fluent-uae`
- Default branch: `main`
- Latest confirmed `main` SHA: `5f0d955ff3b5e3ac6a9dde3a4ade2d3d5d8d4fc8`
- Approved strategy: `REVENUE-FIRST PARALLEL LAUNCH`
- No Merge, Deploy, Production database write, Google write, Ads, Boost, or Production Analytics activation is authorized by this handoff.

## 2. POST 2 — Fear of Water

### Approved

- Feed asset approved.
- Story asset approved.
- Arabic caption approved.
- English caption approved.
- Hashtags approved.
- CTA approved:
  - `اطلب تقييمًا أوليًا`
  - `Request an initial assessment`
- Feed and Story visual composition approved.
- Final shirt logo cleanup approved.

### Scheduled

- Facebook Feed: Scheduled.
- Instagram Feed: Scheduled.
- Feed date/time: `2026-07-15 20:00 Asia/Dubai`.
- Facebook Story: Scheduled.
- Instagram Story: Scheduled.
- Story date/time: `2026-07-15 19:50 Asia/Dubai`.
- Story action: `Send Message`.
- Website link in Story: No.
- Boost: No.
- Ads: No.

### Current status

- `POST2_SCHEDULED_WAITING_FOR_PUBLICATION`
- `PUBLICATION_RECEIPTS_PENDING`

Do not record `Published`, `SUCCESSFUL_PUBLICATION`, a public URL, or a receipt before the content is actually live and verified.

After the scheduled time, verify only:

1. Facebook Feed.
2. Instagram Feed.
3. Facebook Story.
4. Instagram Story.
5. Actual publication time.
6. Public URL, if available.
7. Screenshot evidence.
8. Differences from the approved asset or caption.
9. Owner verification.

Do not invent links or receipts.

## 3. POST 3 — Choosing the right starting point

### Approved content and brief

- `POST3_CONTENT_APPROVED`
- `POST3_VISUAL_BRIEF_APPROVED`
- `POST3_ASSETS_NOT_CREATED`
- `POST3_NOT_SCHEDULED`
- `POST3_NOT_PUBLISHED`

Approved headline:

- Arabic: `ابدأ من نقطة البداية المناسبة لك`
- English: `Start from where you are`

Approved English sentence:

`Before choosing the right coaching approach, we need to understand your previous experience, your current comfort in the water, and the goal you want to reach.`

Core visual message:

- `الخبرة السابقة`
- `+`
- `مستوى الراحة داخل الماء`
- `+`
- `الهدف`

Approved formats:

- Feed: `1080 × 1350`.
- Story: `1080 × 1920`.
- Reel concept: `15–30 seconds`.

Identity rules:

- Use an approved original Coach Ayman photo as a direct cutout only.
- No Face Swap.
- No face regeneration or reconstruction.
- No beauty retouching that changes facial features.
- Use only the official Relax Fix UAE logo.
- No children or clients.
- No external logos.
- No unverified claims.
- Do not use: `Free`, `Complimentary`, `مجاني`, or `مجانًا`.

No final Post 3 asset may be created, scheduled, or published without separate owner authorization.

## 4. Content Hub

Current status:

- `CONTENT_HUB_UPDATE_UNCONFIRMED_CONNECTION_TIMEOUT`

Do not claim that Post 2 was recorded in the app.

Prepared record data:

- Post: `POST 2 — Fear of Water`
- Overall status: `Scheduled`
- Feed: `2026-07-15 20:00 Asia/Dubai`
- Story: `2026-07-15 19:50 Asia/Dubai`
- Facebook: `Scheduled`
- Instagram: `Scheduled`
- Publication Receipt: `Pending`
- Boost: `No`
- Ads: `No`

Do not retry randomly. Retry only after confirming application connectivity, or provide owner manual-entry steps.

## 5. Google Business Profile

No account access or modification has been performed.

Await these owner screenshots in order:

1. Verification.
2. Business information.
3. Business category.
4. Phone and website.
5. Address / service area.
6. Opening hours.
7. Business description.
8. Services.
9. Photos and logo.

Do not provide final GBP recommendations before receiving the screenshots. Do not perform Google writes.

## 6. Google Search Console

No assumption is made that Search Console is connected. No indexing request or Google write is authorized.

Await these owner screenshots:

1. Property selector.
2. Overview.
3. Pages indexing.
4. Sitemaps.
5. URL Inspection for `/`.
6. URL Inspection for `/en`.
7. Core Web Vitals.
8. HTTPS.
9. Manual Actions.
10. Security Issues.

After receipt, classify each finding as:

- Healthy.
- Needs intervention.
- Needs code change.
- Needs manual owner action.

## 7. SEO current state

### Existing foundations

- Arabic and English titles and meta descriptions.
- Canonical URLs for `/` and `/en`.
- `hreflang` for Arabic, English, and `x-default`.
- Public robots directives and `robots.txt`.
- Sitemap route and robots sitemap reference.
- Open Graph title, description, type, URL, site name, and locale fields.
- Twitter large-image card type, title, and description.
- JSON-LD using Organization, Person, Service, WebSite, and WebPage.
- Public business name, phone, email, and Abu Dhabi service representation.

### Prioritized gaps

#### P1

- `og:image`.
- `twitter:image`.
- Official Facebook and Instagram links in `sameAs`, only after owner confirmation.
- Search Console validation of Sitemap and Canonical.

#### P2

- `LocalBusiness` schema only after confirming address policy, service area, and opening hours.
- Real LCP and Core Web Vitals measurement.

#### P3

- Separate Programs page.
- Coach Ayman page.
- FAQ page.
- Contact page.

Do not combine all SEO changes into one PR. Do not invent LocalBusiness data.

## 8. Historical migration note

A historical seed migration contains old prohibited assessment wording.

Current classification:

- Historical and not executed by a normal application build.
- Not read directly by the current UI or API.
- Does not alter current Production unless a migration or database rebuild is explicitly run.
- Current CI contracts do not fail because of its presence.

Do not edit the historical migration merely because it contains old copy. If future evidence shows that it can be reapplied or affects an active environment, prepare a separate migration correction plan without executing it.

## 9. Open pull requests

### PR #50 — Documentation launch continuation pack

- Status: Open, Draft, Unmerged, Mergeable.
- Branch: `docs/post2-schedule-post3-google-seo-pack`.
- Latest confirmed head SHA: `69203ce4577643f7537fc4cda0d626de75771e3f`.
- CI run `324`: Success.
- Scope: documentation only.
- Contains Post 2 scheduling state, Publication Receipt template, corrected Post 3 content and Visual Brief, Google checklists, SEO read-only findings, and Content Hub target state.
- Do not mark Ready or merge without explicit owner approval.

### PR #49 — Production prohibited assessment claims fix

- Status: Open, Draft, Unmerged, Mergeable.
- Branch: `fix/production-prohibited-claims-regression`.
- Head SHA: `54153cb2eb36297ff73942cda903b5844d23dc93`.
- CI previously confirmed successful.
- No Production deployment or merge is authorized.

### PR #46 — Privacy and consent copy pack

- Status: Open, Draft, Unmerged.
- Documentation only.
- Awaiting factual owner decisions and possible legal review.
- Do not use it as approval to activate Analytics.

### PR #36 — International Phone Phase B

- Status: Open, Draft, Blocked, Unmerged.
- Do not merge or deploy.

### PR #28 — AI media fallback target

- Status: Open and Unmerged.
- Not part of the current priority sequence.

## 10. Approved, rejected, and historical decisions

### Approved

- `REVENUE-FIRST PARALLEL LAUNCH`.
- Official Relax Fix UAE brand kit.
- CTA wording listed in this file.
- Post 2 final Feed and Story.
- Post 2 schedule listed in this file.
- Post 3 content and Visual Brief only.

### Rejected or not selected

- Post 2 Design 3 was not selected.
- Earlier Feed versions with visible external logos, poor crop, duplicated logos, or altered facial appearance were rejected.
- Do not reuse rejected assets.

### Historical completed work

- PR #48 merged and added Local SEO and Week 1 documentation packs.
- PR #47 merged and repaired the Production sitemap route.
- PR #45 merged and closed the Analytics Measurement Contract documentation decisions, without activating Analytics.
- PR #44 merged and documented the Production Business Settings copy correction.
- PR #42 merged and protected public presentation copy from prohibited free/complimentary claims.
- PR #39 merged and made Production-writing workflows manual-only.

Historical completion does not authorize reopening or expanding those scopes.

## 11. Rules that must not change

- Do not change the approved plan order without a documented reason and explicit owner approval.
- Do not claim work that was not executed.
- No automatic Merge.
- No Deploy.
- No Production database write.
- No Production migration, `supabase db push`, or migration repair.
- No Google write or indexing request.
- No Ads or Boost.
- No Production Analytics activation.
- No Post 4.
- No n8n reopening.
- No duplicate Post 2 Feed or Story.
- No Post 3 asset creation, scheduling, or publication without owner authorization.
- Do not use prohibited words or claims.
- Do not regenerate Coach Ayman's face for future content; use approved original-photo cutouts.

## 12. Current blockers and risks

- Post 2 publication receipts cannot exist until the scheduled content is actually live.
- Content Hub write remains unconfirmed because of a connection timeout.
- GBP and Search Console reviews are blocked pending owner screenshots.
- SEO P1 implementation is blocked pending approved social images, official social links, and Search Console evidence.
- LocalBusiness schema is blocked pending address, service-area, and hours decisions.
- PR #49 remains Draft and unmerged; Production behavior must not be inferred from its branch.
- PR #46 remains unresolved and Analytics must remain inactive.

## 13. What has not been done

- Post 2 has not been verified as published yet.
- No Post 2 Publication Receipt has been completed.
- Post 3 assets have not been created.
- Post 3 has not been scheduled or published.
- Content Hub update has not been confirmed.
- GBP has not been edited.
- Search Console has not been changed and no indexing request was sent.
- No SEO implementation PR has been started from the prioritized gaps.
- No Merge, Deploy, Ads, Boost, Analytics activation, or Production database write was performed in the latest work.

## 14. Remaining tasks in approved order

1. Keep PR #50 Draft until owner review and explicit merge decision.
2. After `2026-07-15 19:50–20:00 Asia/Dubai`, verify Post 2 Feed and Story publication on Facebook and Instagram and prepare evidence-based receipts.
3. Wait for owner confirmation before recording publication success.
4. Retry Content Hub only after confirmed connectivity, or provide manual-entry steps.
5. Receive and review GBP screenshots.
6. Receive and review Search Console screenshots.
7. After owner approval, decide whether to create Post 3 assets from the approved Visual Brief.
8. Keep SEO implementation separated by P1, P2, and P3 and do not start without required confirmations.

# NEXT CONVERSATION START HERE

## Current summary

Post 2 Feed and Story are approved and scheduled for Facebook and Instagram on `2026-07-15` at `19:50` and `20:00 Asia/Dubai`. They are not yet verified as published. Post 3 content and Visual Brief are approved, but no assets exist and nothing is scheduled. PR #50 is Draft, unmerged, and its latest CI succeeded. Content Hub remains unconfirmed because of a connection timeout. GBP and Search Console reviews are waiting for owner screenshots.

## First task

Read this file first. Then check the current date and time. If the Post 2 scheduled time has passed, verify the four publication targets and prepare Publication Receipts using only real URLs, timestamps, screenshots, and observed differences. If the scheduled time has not passed, do not claim publication and report that receipts remain pending.

## Owner approvals still required

- Merge decision for PR #50.
- Any creation of Post 3 Feed, Story, or Reel assets.
- Any Post 3 scheduling or publication.
- Any SEO implementation PR.
- Any GBP or Search Console change.
- Any Merge, Deploy, Ads, Boost, Analytics activation, or Production database action.

## Currently prohibited

- No invented publication evidence.
- No duplicate Post 2 content.
- No Post 4.
- No Ads or Boost.
- No Production Analytics.
- No Google write.
- No Production database write.
- No Merge or Deploy without explicit owner approval.
