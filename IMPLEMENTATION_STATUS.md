# Relax Fix UAE Platform — Verified Implementation Status

Verified through PR #25 and Supabase production migrations applied on 2026-07-10.

## Truthful deployment state

- GitHub `main` contains the verified application layers described below.
- GitHub CI validates TypeScript, lint, production build, SEO, Content Brain, Meta publishing contracts, autonomous media worker contracts, server-side scheduler contracts, Vercel build policy, AI OS security, AI media hardening, E2E admin contracts, and the live Supabase booking smoke.
- Supabase production contains the schema/RPC/queue/scheduler migrations through the server-side content automation pulse.
- The currently served Vercel Production build is known to lag behind GitHub `main`; a deployment is not called current until the stable Vercel project domain serves the new sitemap, `/en` route, and scheduler endpoint.
- The Supabase five-minute content automation pulse is installed but deliberately inactive until the new scheduler route is live on Vercel.
- `relaxfixuae.com` DNS recovery remains external deployment work; the commercial domain is not represented as live while DNS does not resolve.

## Public booking foundation

- Public business settings are backed by `public.business_settings`.
- Booking persists through `/api/booking-request` and the hardened `submit_booking_request` Supabase RPC.
- Live booking verification checks invalid UAE phone rejection, option allowlists, schedule validation, real insertion, and idempotency replay.
- The public site remains bilingual Arabic/English and the original booking implementation was preserved byte-for-byte when route-specific SEO wrappers were introduced.

## Search foundation

- Arabic public URL: `/`.
- English public URL: `/en`.
- Route-specific canonical metadata is implemented.
- Reciprocal `ar-AE`, `en-AE`, and `x-default` hreflang links are implemented.
- Truthful Organization, Coach Ayman Person, Service, WebSite, and WebPage JSON-LD are implemented.
- No fake ratings, fake reviews, fake street address, or invented social links are included.
- `robots.txt` and the bilingual sitemap are implemented.
- API, AI OS, Staff, and legacy Admin routes are marked against search indexing.

## Staff Auth / RBAC

- `public.staff_profiles` is tied to `auth.users`.
- `swimmingayman@gmail.com` is provisioned as active `super_admin` with display name `Coach Ayman`.
- Staff sessions use Supabase Auth access/refresh tokens with HttpOnly, Secure, SameSite cookies.
- Staff booking, CRM, Inbox, content, analytics, command-center, operations, media, and automation-status RPCs enforce active staff roles in PostgreSQL.
- Publish-worker, autonomous-media-worker, publication-receipt, automation-lease, automation-run, and scheduler mutation RPCs are service-role-only.
- Browser Staff APIs do not reference provider secrets or the Supabase secret key.

## Provider layer

Primary/fallback adapter order in code:

- Text: OpenAI Responses (`openai-responses-text`) with Alibaba Qwen fallback.
- Images: OpenAI GPT Image (`openai-gpt-image`) with Alibaba Wan image fallback.
- Video: Google Veo (`google-veo`) with Alibaba Wan video fallback.

Important contract state:

- OpenAI raw Responses REST output is parsed from `output[].content[]`; the SDK-only `output_text` convenience property is not assumed by the raw REST client.
- Strict Structured Outputs use `json_schema`.
- Provider readiness fails closed when the server credential is not configured.
- No provider secret is returned to the browser.

## Content Brain — three daily slots

Content Brain plans exactly three Dubai-time slots per day:

1. 08:30 — trust / problem awareness.
2. 14:00 — education / authority.
3. 20:30 — emotion / conversion.

The database stores:

- `planned_for`
- `language`
- `content_pillar`
- `content_slot`
- `content_fingerprint`

Anti-fatigue controls:

- up to 60 recent items from the previous 90 days are provided as repetition context;
- a SHA-256 content fingerprint is stored;
- PostgreSQL blocks duplicate fingerprints within 90 days;
- PostgreSQL blocks duplicate planned slots.

Human review boundary:

- every generated batch is saved as `needs_review`;
- Content Brain does not create a publish job;
- editing protected content returns it to review and clears a previous schedule where required;
- human approval remains mandatory during the current launch period.

## Autonomous content media worker

The existing `background_jobs` table remains the single execution queue.

Content mapping:

- morning trust slot -> `image_post` -> 4:5 image;
- midday education slot -> `image_post` -> 4:5 image;
- evening conversion slot -> `reel` -> 9:16 video, eight seconds.

Worker controls:

- `generate_content_media` jobs are enqueued after an eligible `needs_review` item with a visual prompt is inserted;
- work is claimed with `FOR UPDATE SKIP LOCKED`;
- only one active autonomous media job is allowed per content item;
- only one final autonomous asset of a given content-item/asset-type is allowed;
- deterministic private Storage paths include owner, asset type, content item, and worker job;
- provider output downloads are HTTPS-only with provider-host allowlists, manual redirect validation, and a strict Google `x-goog-api-key` download-header allowlist;
- worker Storage calls use the modern Supabase secret key through `apikey`, never `Authorization: Bearer sb_secret_...`;
- the autonomous worker never claims or completes publish jobs.

Video retry behavior:

- provider jobs are recorded in the existing `ai_media_jobs` table;
- queued/running provider polls are deferred without consuming the retry budget;
- a terminal provider-generation failure marks that provider job failed and clears its provider IDs so the next retry creates a fresh provider job;
- a successful provider job is retained when only download/Storage fails, so a retry reuses the existing successful video instead of paying for a new generation;
- genuine worker failures use bounded backoff and dead-letter after five attempts.

## Meta publishing safety

A server-only Meta publishing adapter exists for configured Instagram and Facebook targets.

Supported current shapes:

- Instagram single image;
- Instagram Reel;
- Facebook text post;
- Facebook single image;
- Facebook single video.

Publication receipts are keyed by content item + platform and use these states:

- `reserved`
- `container_created`
- `published`
- `ambiguous`
- `failed`

Safety behavior:

- Instagram retries resume the same saved media container;
- an already-recorded published external post ID is returned instead of republishing;
- ambiguous final-publish network/results fail closed and automated republishing is refused;
- private media is exposed to Meta only through short-lived server-signed URLs;
- unsupported multi-media shapes fail closed rather than silently dropping media.

The adapter is not represented as live Meta publishing until real Meta credentials are configured in the production server environment and a real Graph publish is verified.

## Server-side content automation

The automation cycle runs server-side and does not depend on ChatGPT, a browser, or a phone remaining open.

Architecture:

- `processOneContentMediaJob()` processes one autonomous media job.
- `processOnePublishJob()` processes one approved/scheduled publish job.
- internal worker routes remain timing-safe token-protected wrappers around the same processors.
- the scheduler calls processors in-process; it does not loop back over HTTP to internal worker routes.

Per-cycle limits:

- maximum 2 media attempts;
- maximum 6 publish attempts;
- a 240-second database lease blocks overlapping scheduler cycles.

Every run records:

- source;
- status;
- media attempts/processed counts;
- publish attempts/processed counts;
- safe result summary;
- error when failed;
- start/finish timestamps.

The scheduler summary explicitly records:

- `humanApprovalRequired: true`
- `contentBrainGenerationTriggered: false`

The scheduler therefore drains media work and approved/scheduled publishing work only. It does not generate Content Brain batches, approve content, or bypass `needs_review`.

## Five-minute pulse and recovery schedule

Supabase production now has:

- `pg_cron` enabled;
- `pg_net` enabled;
- an encrypted scheduler token stored in Supabase Vault;
- only the SHA-256 token hash stored in `content_automation_scheduler_auth`;
- a five-minute `relax-fix-content-automation-pulse` Cron job targeting the stable Vercel project domain.

The five-minute job is deliberately `active=false` until the new Vercel scheduler route is deployed and verified.

Vercel configuration contains one daily recovery Cron at `00:15 UTC`, compatible with the current Hobby Cron frequency restriction. The five-minute operational pulse is owned by Supabase Cron rather than Vercel Cron.

## Live Supabase verification completed

Production verification has confirmed:

- Content Brain planning columns and indexes are live.
- Content Brain duplicate/fatigue guards are live.
- Publication receipt RLS and service-role-only RPCs are live.
- Autonomous media queue triggers and uniqueness indexes are live.
- Autonomous media worker RPCs are service-role-only.
- A transaction smoke normalized morning content to `image_post`, evening content to `reel`, created exactly two queued media jobs, blocked a duplicate active job, and cleaned all test rows/jobs.
- Scheduler tables have RLS enabled.
- `pg_cron` and `pg_net` are installed in production.
- one named scheduler secret exists in Vault; its plaintext was not read or exposed during verification.
- scheduler auth is inactive and stores a 64-character hash.
- the five-minute Cron exists with `active=false`.
- a transaction smoke proved the first lease claim succeeds, a concurrent claim returns `AUTOMATION_LEASE_HELD`, a `supabase_cron` run can start/complete, and the lease releases; the transaction was rolled back.

## Current external activation blockers

These remain truthful blockers rather than fake-success states:

1. Vercel Production must deploy the current `main` commit and serve `/sitemap.xml`, `/en`, and `/api/cron/content-automation`.
2. The five-minute Supabase pulse remains inactive until the deployed scheduler route is verified.
3. OpenAI API execution is not called production-live until the Vercel server environment has a valid `OPENAI_API_KEY` and a real generation passes.
4. Google Veo execution is not called production-live until Gemini API billing/credentials are verified and a real provider job passes.
5. Meta publishing is not called production-live until the pinned Graph version, Page access token, Page ID and/or Instagram business account ID are configured and a real publish passes.
6. `relaxfixuae.com` DNS must be recovered and pointed to the verified production target before the commercial domain is called live.
7. WhatsApp Business automated sending/webhook ingestion and TikTok publishing remain future activation stages.

No fake AI generation, fake social publishing, fake automated reply success, fake attribution, fake testimonials, or fake production deployment is claimed by this document.
