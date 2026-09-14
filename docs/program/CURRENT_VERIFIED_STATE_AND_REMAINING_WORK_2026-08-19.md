# RELAX FIX UAE — CURRENT VERIFIED STATE AND REMAINING WORK

Last verified: 2026-08-19 (Asia/Dubai)

Status: `CURRENT_STATE_RECONCILED_NO_PRODUCTION_MUTATION_IN_THIS_PR`

This document is a current reconciliation addendum for continuation. It does not replace `AGENTS.md`, `PROJECT_HANDOFF.md`, `PROJECT_STRATEGY_HANDOFF.md`, or the authority Handoff. Where an older Handoff conflicts with newer verified evidence below, use the newer evidence and do not restart completed work.

## 1. Governing continuation rules

- Read `AGENTS.md` before changes.
- Preserve `REVENUE-FIRST PARALLEL LAUNCH` and `RELAX_FIX_GROWTH_OS / COMPLETE_DIGITAL_ECOSYSTEM`.
- Do not rebuild or create duplicate systems of record.
- Use isolated branches / Draft PRs for repository changes.
- Do not merge, deploy, write Production, change credentials, publish, schedule, message, activate Analytics, or spend without the applicable protected approval.
- An Issue, plan, branch, or queued job is not completion evidence.

## 2. Current website / search state

Current `main` head verified during this reconciliation:

- `9133ce1c25c7b01d5c0acf0cb8c4eca3e6f7517c` — `Fix English landing-page document language`

Current Vercel Production deployment:

- `dpl_HGPnySZAQB6XggNc4TnkgxffRvsU`
- target: Production
- state: READY
- branch: `main`
- commit: `9133ce1c25c7b01d5c0acf0cb8c4eca3e6f7517c`

The only two `main` commits after the previously verified Coach Ayman authority image baseline `8b933e9473116b1b2fb2f3cb0d12e2a44341e035` are:

1. `02bede030978e319159838b6c783a8c1e9053897` — adds only the public IndexNow verification key file `public/7cc3d7e670111dc78596cb5ae311ec89.txt`.
2. `9133ce1c25c7b01d5c0acf0cb8c4eca3e6f7517c` — changes only `src/routes/__root.tsx` so `/swimming-lessons-abu-dhabi` is treated as English.

No booking, pricing, Supabase, Messenger, RADAR, Analytics, or publishing code was changed by those two commits.

The English-language fix duplicates a previously proven Preview change `e0e466a50c4ab7d03feaf6231f5fb9a052539977`; this is a process duplication, not a double-applied runtime change.

Current Vercel runtime review found no runtime error clusters in the checked seven-day range. `/swimming-lessons-abu-dhabi` returned HTTP 200 on the current Production deployment.

### Current public business facts to preserve

- Business: Relax Fix UAE — Abu Dhabi.
- Coach: Coach Ayman.
- Coach public trust evidence accepted in the current project: 15+ years experience; ASCA Level 1 (2013); ASCA Level 2 (2014).
- Services: Private + Group swimming lessons.
- Standard lesson duration: 45 minutes.
- Capacity: Private 1; Group 4.
- Public Training locations:
  - ICS Al Najda
  - ICS Al Falah
  - ICS Khalifa
  - ICS Al Mushrif
- Google Business customer contact / WhatsApp: +971 55 137 8660.
- Current owner-confirmed Google Business hours:
  - Saturday: 10:00–22:00
  - Sunday: 10:00–22:00
  - Monday–Friday: 16:00–21:00

Search Authority / SEO / Local SEO and Final Website Acceptance are treated as closed unless new regression evidence appears.

## 3. RADAR state

The remaining RADAR architecture question was reconciled read-only.

Verified design:

- HOT opportunities are surfaced directly through the Attention Center from `radar_opportunities`.
- Existing queued `radar_hot_opportunity` jobs are not required for HOT visibility.
- No new `radar_hot_opportunity` consumer should be built without new evidence that direct Attention Center delivery is insufficient.

Status: `RADAR_HOT_CONSUMER_ARCHITECTURE_CLOSED_NO_NEW_CONSUMER`.

## 4. WhatsApp state

Keep two operational facts separate:

- Working Meta Cloud API number: +971 58 821 9130. Protect the current working path.
- Desired second number / Google Business customer-facing number: +971 55 137 8660. Meta engineering remains the external blocker for the second-number automation path.

Do not regenerate tokens, deregister the working number, change webhook / n8n paths, or repeat prior Meta tests without new evidence or explicit scope.

## 5. Publishing / Buffer state — critical continuation rule

Current selected social publishing path is Buffer, not a new third-party publisher.

Do not introduce Metricool or another parallel publisher unless a future evidence-backed decision explicitly replaces Buffer.

Evidence in Production shows Buffer-origin content records for the Aug 18–26 window with provider external IDs for both Facebook and Instagram. One Facebook and one Instagram item for Aug 18 are already recorded as published; later items in that Buffer batch remain scheduled.

A public Supabase Storage bucket already exists for Buffer media:

- bucket: `buffer-media`
- public: true
- image MIME types only
- existing objects: `2026-08-17.png` through `2026-08-26.png`

This means a new image-hosting system is not required for the existing Buffer design.

### Pre-existing duplicate-publication risk

Production also contains an older internal Instagram publication queue. Current inspection found queued internal Instagram publish jobs through Sep 3, including dates that overlap the Buffer schedule. Some older internal jobs show:

`PUBLISHING_PROVIDER_NOT_READY:instagram`

The internal provider failure prevents current sending, but queued jobs remain a future duplicate-publication hazard if the old provider becomes ready again.

Decision for continuation:

`ONE_CHANNEL_ONE_ACTIVE_PUBLISHER`

For the current Growth phase:

`BUFFER_IS_THE_ONLY_INTENDED_SOCIAL_PUBLISHER_FOR_FACEBOOK_AND_INSTAGRAM`

Do not schedule a new Buffer post before checking existing Buffer / provider receipts for the same channel, date, and content. Do not reactivate the legacy internal Instagram publisher.

### Recommended containment change — NOT YET APPLIED TO PRODUCTION

Prepare an isolated migration / patch so the generic internal publish worker cannot claim Instagram jobs while Buffer is the selected publisher. Preserve queued rows as historical evidence; do not delete them merely for cleanup.

Production database application remains a protected action and must not occur implicitly through this documentation reconciliation.

## 6. Growth content state

The approved Google Drive staging sheet contains days 11–30 with owner-approved content and matched assets.

For days 23–30 (Aug 27–Sep 3), tracking-only columns were added on Aug 18:

- `facebook_utm_url`
- `instagram_utm_url`
- `growth_execution_status`

This did not change the approved headline, publish date, design file name, Drive file ID, owner approval, quality source, or original production-status values.

Current Growth release set prepared but not newly published by this reconciliation:

- Aug 27 — النتائج تتحدث عن نفسها
- Aug 28 — سؤال واحد يكفي للبدء
- Aug 30 — البداية الصحيحة توفر عليك وقتًا لاحقًا
- Aug 31 — التدريب الحقيقي لا يُختصر بالفيديوهات
- Sep 2 — الاستمرارية تصنع التقدم
- Sep 3 — كل شهر إنجاز جديد

Keep on visual hold:

- Aug 29 — اختيار الملابس والمعدات المناسبة يسرّع تقدمك
- Sep 1 — جدول مرن يناسب وقتك

Reason: existing source marks those visuals `HOLD_VISUAL_REPLACEMENT_RECOMMENDED` / closest-available-match rather than confirmed visual match.

Do not create duplicate content rows or duplicate social posts for the six ready dates. Check provider state first.

## 7. Analytics / attribution reuse rule

Do not build a new analytics stack for Growth.

Existing repository history already includes privacy-safe UTM attribution and conversion measurement work, including the Production-approved attribution merge `2b662a2b4052d734139c43e31e81419a7892a837`.

Reuse the existing UTM / GA4 architecture and its consent / PII rules. Do not add GTM or click-ID persistence as part of Growth unless separately approved.

## 8. Open PR reconciliation

Current open PRs found during this reconciliation include:

- #257 — Dependabot dependency update. Separate maintenance scope; do not merge as part of Growth.
- #249 — documentation-only Post 3 evidence from Aug 1 baseline; historical / superseded for current release operations unless a current task explicitly needs that artifact.
- #248 — Aug 1 remaining-work reconciliation; historical / superseded as an execution baseline.
- #245 — days 1–5 design registry; historical asset registry, not current Growth execution.
- #246 — semantic route redirects built from old `5859fc0...` baseline; do not merge without rebuilding / revalidating against current `main` if still needed.
- #244, #243, #242, #241, #240 — Aug 1 evidence / reconciliation PRs; historical / superseded as current-state baselines.
- #238 — GA4 Preview validation-only PR; historical unless a current GA4 validation specifically reuses it with fresh evidence.
- #36 — explicitly `DO_NOT_REBASE_DO_NOT_MERGE_REBUILD_FROM_CURRENT_MAIN_ONLY`; preserve as historical reference only.

No old Draft PR is automatically mergeable merely because it remains open.

## 9. Completed — do not repeat without regression evidence

- Final Website Conversion Pass / Final Website Acceptance.
- Search Authority / technical SEO / Local SEO closure work already accepted by the owner.
- Bing sitemap submission accepted with no sitemap error / warning at submission time.
- IndexNow key verification infrastructure on Production.
- Coach Ayman authority / image / 15+ experience evidence integration already present on current site.
- RADAR HOT consumer architecture decision.
- Existing GA4 / UTM foundation and conversion-event architecture.
- Existing booking protection architecture and Messenger booking flow accepted in prior stages.
- Existing Buffer account linkage / selected-publisher decision.

Do not restart these audits as generic workstreams.

## 10. Remaining work only

### A. Publishing conflict containment — highest safe engineering priority

Goal: prevent the legacy internal Instagram worker from becoming a second active publisher while Buffer is selected.

Safe implementation sequence:

1. Inspect current `claim_next_publish_job()` / equivalent claim path and the latest migration defining it.
2. Prepare one isolated migration that excludes Instagram claims from the generic internal publisher, matching the already-excluded Facebook behavior where applicable.
3. Add a regression test / SQL verification proving Instagram jobs remain queued and unclaimed while non-social jobs are unaffected.
4. Preview / disposable verification first.
5. Production application requires explicit protected approval.
6. Do not delete historical queued jobs.

### B. Growth publishing continuation

After containment is proven and the selected Buffer path is verified:

- check existing Buffer posts / provider IDs first;
- create only missing approved posts;
- use the existing `buffer-media` path rather than inventing a new host;
- preserve Aug 29 and Sep 1 visual holds;
- record provider post IDs / receipts;
- prevent any duplicate schedule by date + channel + content.

### C. Handoff / Program Board synchronization

This reconciliation document is the current addendum. The older `PROJECT_HANDOFF.md` and Issue #54 / Issue #60 descriptions contain pre-August states and should be synchronized in a dedicated documentation-only update after factual review. Do not erase historical evidence; mark superseded statements clearly.

### D. WhatsApp second number

External wait on Meta engineering. Do not consume project time with repeated tests unless Meta supplies a change or new evidence.

### E. Growth measurement and learning

Use existing UTM / GA4 / booking conversion evidence. Build no new measurement stack. Begin performance learning only from real published receipts and real measured conversions; never invent reach, leads, or bookings.

### F. Paid acquisition

Google Ads readiness may be revisited only after organic / conversion proof and separate owner authorization for billing, budgets, stop-loss, and spend. Meta Ads remains later.

## 11. Actions intentionally not performed by this reconciliation

- No merge to `main`.
- No Vercel deployment / promotion.
- No Supabase migration or Production write.
- No deletion / mutation of queued publication jobs.
- No Buffer post creation / scheduling.
- No Meta / Facebook / Instagram account mutation.
- No credentials / secrets / token changes.
- No WhatsApp change.
- No Ads, billing, or spend.

## 12. Single next engineering action

Prepare and verify, on an isolated branch only, the smallest safe patch that prevents the generic internal publication worker from claiming Instagram jobs while Buffer is the selected publisher.

Do not apply it to Production until the protected Production database gate is explicitly satisfied.
