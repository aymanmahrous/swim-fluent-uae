# Relax Fix UAE Platform — Verified Implementation Status

## Production foundation verified

- Public Production is live on Vercel.
- `/api/business-settings` returns HTTP 200 from Production with real `public.business_settings` data.
- Public booking persists through `/api/booking-request` and the hardened `submit_booking_request` Supabase RPC.
- Live booking smoke verifies invalid UAE phone rejection, option allowlists, schedule validation, real row insertion, and idempotency replay.
- GitHub CI validates lint, production build, AI OS security/data contracts, and the live public booking smoke.

## Supabase key and security state

- The previously exposed legacy `service_role` credential is no longer used by the application or Vercel.
- Legacy JWT-based `anon` and `service_role` API keys are disabled in Supabase.
- Public application traffic uses the modern `sb_publishable_...` key.
- Backend publish-worker code is designed for a modern server-only `sb_secret_...` key through `SUPABASE_SECRET_KEY`.
- Modern Supabase secret keys are never accepted by browser routes and are sent to the Supabase Data API in the `apikey` header only.
- The publish worker also requires `INTERNAL_WORKER_TOKEN` with timing-safe comparison before queue execution.
- Public `leads` client grants are revoked and the legacy permissive insert policy is removed.
- `rls_auto_enable()` public execution is revoked.
- `business_settings` is public-read only; no public writes are granted.
- Public guest booking remains an intentionally exposed, validated intake RPC. Rate limiting and bot controls remain recommended before high-volume paid campaigns.

## Staff Auth / RBAC verified

- `public.staff_profiles` is tied to `auth.users`.
- The confirmed Supabase Auth account `swimmingayman@gmail.com` is explicitly provisioned as active `super_admin` with display name `Coach Ayman`.
- Initial role provisioning is recorded in `audit_logs`.
- Staff session code uses Supabase Auth access/refresh tokens with HttpOnly, Secure, SameSite cookies.
- Staff booking, CRM, inbox, content, analytics, command-center, operations, and media RPCs enforce active staff roles in PostgreSQL.
- The internal `is_active_staff()` helper is not directly executable by `authenticated`; staff RPCs call it internally from fixed-search-path `SECURITY DEFINER` functions.
- Authenticated RBAC smoke using Coach Ayman's real user ID and JWT claims passed through the actual staff RPC surface.
- Smoke observed real counts without mutating customer data: 3 booking requests and 7 CRM leads at verification time.
- Fake entity IDs correctly returned `NOT_FOUND`; an empty generated-content batch returned `INVALID_BATCH_SIZE`.
- `anon` cannot execute staff Command Center or AI media RPCs.
- `authenticated` cannot execute publish-worker RPCs.
- Publish-worker RPCs are executable only by the PostgreSQL `service_role`, which modern `sb_secret_...` keys assume on trusted backend calls.
- The authenticated Staff page links directly to `/os`; AI OS route access is enforced by Staff Auth/RBAC rather than a browser feature flag.

## Premium public experience implemented

- Premium bilingual Arabic/English public experience.
- Deep navy, aqua, and controlled gold visual direction.
- Rebuilt hero, trust signals, program cards, aquatic specialties, People of Determination positioning, and Coach Ayman authority section.
- Mobile-first conversion layout.
- Five-step booking wizard using the verified real booking API.
- Dubai calendar-date handling aligned with PostgreSQL schedule validation.
- Business name, coach name, WhatsApp, public phone, pricing, duration, timezone, locations, offer text, and social URLs remain centralized in `business_settings`.

## AI OS real-data foundation implemented

- Command Center reads real lead, follow-up, conversation, and scheduled-content totals.
- CRM reads real leads and supports atomic stage, human-required, do-not-contact, and future follow-up workflow changes.
- CRM workflow synchronizes active follow-up jobs and conversation AI/human mode and records audit logs.
- AI Inbox reads real conversations/messages and supports protected Take over / Return to AI / Pause mode changes.
- Content Studio persists validated generated text batches as `needs_review`.
- Content editing is protected; published content is immutable and edited scheduled content returns to review with schedule cleared.
- Planner reads real `content_items` and supports approval, return to review, schedule, and unschedule transitions.
- Scheduling enqueues one `publish_content` background job per content item.
- Publish queue uses row locks and `FOR UPDATE SKIP LOCKED`, attempt counting, retries, deferral, dead-letter behavior, and idempotent already-published handling.
- Media Library reads real `media_assets` and renders permanent Supabase Storage image/video URLs.
- Operations reads real follow-up and background-job queues.
- Analytics reports real current database totals and explicitly does not claim cross-entity attribution until provider/campaign attribution links exist.
- Provider status API distinguishes `configured` from `executable`; secrets are never returned to the browser.

## Alibaba Qwen / Wan adapter foundation implemented on PR #7

- Built-in text adapter: `alibaba-qwen`, default model `qwen3.7-max`.
- Built-in image adapter: `alibaba-wan-image`, default model `wan2.7-image-pro`.
- Built-in video adapter: `alibaba-wan-video`.
- Text-to-video default model: `wan2.7-t2v-2026-06-12`.
- Image-to-video default model: `wan2.7-i2v-2026-04-25`.
- Qwen uses the workspace MAAS OpenAI-compatible chat endpoint.
- Wan image generation uses the workspace synchronous multimodal-generation endpoint.
- Wan video uses async task creation plus task polling.
- Image-to-video uses `first_frame`; `ratio` is applied only to text-to-video, matching the provider contract.
- Provider adapters remain non-executable unless both `MAAS_ENDPOINT` and `ALIBABA_MODEL_STUDIO_API_KEY` exist server-side.
- Provider keys are never referenced by browser routes.

## Permanent AI media storage verified

- Live bucket `relax-fix-media` exists in Supabase Storage.
- Bucket is public-read for generated social assets but public upload is not allowed.
- Bucket maximum object size is 100 MB.
- Allowed MIME types are PNG, JPEG, WebP, and MP4.
- Upload RLS requires `authenticated` plus a matching first folder equal to `auth.uid()` and an active `super_admin`, `admin`, or `content_manager` staff profile.
- `public.can_manage_relax_fix_media()` is a fixed-search-path `SECURITY DEFINER` helper dedicated to Storage RLS.
- `anon` cannot execute the helper; `authenticated` and `service_role` can execute it.
- Live RLS smoke proved Coach Ayman's own UUID folder can insert and a different UUID folder is denied with `42501`.
- Direct `storage.objects` table reads are not granted to client roles.
- Provider asset downloads are HTTPS-only and provider-host allowlisted.
- Literal IPs, localhost, unapproved provider hosts, credentials in URLs, custom ports, and unvalidated redirect chains are rejected before server download.
- Alibaba provider asset redirects are manually followed with host revalidation at each hop.
- Small generated assets use standard Supabase Storage upload with the Staff JWT.
- Generated videos larger than 6 MB use TUS resumable upload with fixed 6 MB chunks.
- Concurrent deterministic video uploads treat an already-persisted permanent object as an idempotent success.

## Async AI video jobs verified

- Live `public.ai_media_jobs` stores async video task state without direct anon/authenticated table access.
- Protected RPCs create, read, update, and finalize video-generation jobs.
- Duplicate `(provider, provider_job_id)` creation returns the same persisted job ID.
- Separate-statement live smoke verified `queued → running` transitions and updated metadata.
- Invalid media path prefixes return `INVALID_STORAGE_PATH`.
- Correct user prefixes with no Storage object return `STORAGE_OBJECT_NOT_FOUND`.
- Video finalization locks the job row and returns `ALREADY_SUCCEEDED` after prior success, preventing duplicate media-record finalization.
- Recent video jobs are exposed only through `get_staff_video_generation_jobs()` to authorized content staff.
- The read model returns at most the latest 100 jobs; `anon` cannot execute it.
- Content Studio automatically resumes the newest `queued` or `running` job after a page reload and also shows recent jobs for manual resume.
- Stored jobs are polled through their original provider adapter ID instead of relying on the current default video-provider setting.

## Live Supabase migrations

The live production database has verified layers applied through:

1. Centralized business settings and booking hardening.
2. Legacy public-surface lockdown and foundation foreign-key indexes.
3. `staff_profiles`, staff booking RPCs, and internal staff helper hardening.
4. CRM, Inbox, and conversation-mode staff RPCs.
5. Generated content persistence and OS real-data read models.
6. Content review/scheduling, publish-worker, content editing, and CRM workflow RPCs.
7. `add_ai_media_generation_storage`.
8. `fix_ai_media_storage_policy`.
9. `add_staff_video_generation_jobs_read_rpc`.

Repository migrations `20260708_000001` through `20260708_000022` document the complete schema and function evolution present on the integration branch. The live migration registry includes the production-applied layers through `add_staff_video_generation_jobs_read_rpc`.

## External providers — intentionally NOT CONFIGURED

The following are not represented as live until real provider authorization or server credentials exist:

- Alibaba Model Studio execution: adapter code exists, but a real server-side `ALIBABA_MODEL_STUDIO_API_KEY` has not been verified in Vercel.
- Meta / Instagram messaging and publishing.
- WhatsApp Business Platform automated sending and webhook ingestion.
- TikTok publishing.

The UI and APIs fail closed with `NOT CONFIGURED` / `PROVIDER_NOT_READY` states. There is no fake AI generation, fake social publishing, or fake automated reply success.

## External activation requirements

- Alibaba Model Studio API key stored directly in Vercel server environment; do not paste it into source code, public documents, browser variables, or chat.
- Meta App ID, App Secret, Verify Token, OAuth/page/Instagram authorization, and webhook configuration.
- WhatsApp Business phone-number ID and access token, plus approved webhook and message-policy setup.
- TikTok client authorization/OAuth for the target publishing account.
- A dedicated modern Supabase `sb_secret_...` key for the backend publish worker and an independent `INTERNAL_WORKER_TOKEN` when external publishing is activated.

## Current PR #7 merge gate

PR #7 must pass the final exact-head GitHub CI after all Alibaba/Storage/video-resume changes and dependency metadata are stable. Before merge:

1. lint passes.
2. production build passes.
3. AI OS security and data contracts pass, including migrations `000020`, `000021`, and `000022`.
4. live Supabase booking smoke remains green.
5. package dependency metadata is reconciled for `tus-js-client`.
6. unauthenticated image, video, matching-copy, and video-jobs APIs return 401.
7. provider status remains truthful and fail closed without the real Alibaba key.

After merge, Production must be reverified for public booking, Staff login shell, `/os` Staff Auth gate, new media APIs, and provider readiness truthfulness.
