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
- `anon` cannot execute staff Command Center RPCs.
- `authenticated` cannot execute publish-worker RPCs.
- Publish-worker RPCs are executable only by the PostgreSQL `service_role`, which modern `sb_secret_...` keys assume on trusted backend calls.

## Premium public experience implemented in the integration branch

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
- Content Studio uses provider adapters and persists validated generated batches as `needs_review`.
- Content editing is protected; published content is immutable and edited scheduled content returns to review with schedule cleared.
- Planner reads real `content_items` and supports approval, return to review, schedule, and unschedule transitions.
- Scheduling enqueues one `publish_content` background job per content item.
- Publish queue uses row locks and `FOR UPDATE SKIP LOCKED`, attempt counting, retries, deferral, dead-letter behavior, and idempotent already-published handling.
- Media Library reads real `media_assets`.
- Operations reads real follow-up and background-job queues.
- Analytics reports real current database totals and explicitly does not claim cross-entity attribution until provider/campaign attribution links exist.
- Provider status API distinguishes `configured` from `executable`; secrets are never returned to the browser.

## Live Supabase migrations

The live production database has the following verified migration layers applied:

1. Centralized business settings and booking hardening.
2. Legacy public-surface lockdown and foundation foreign-key indexes.
3. `staff_profiles`, staff booking RPCs, and internal staff helper hardening.
4. `get_staff_crm_leads`.
5. `get_staff_inbox` and `get_staff_conversation_messages`.
6. `set_staff_conversation_mode`.
7. `create_staff_generated_content_batch`.
8. Staff content, analytics, and Command Center read models.
9. Staff operations and media read models.
10. Atomic content review/scheduling transitions.
11. Publish-worker claim/defer/fail/complete RPCs.
12. Protected content editing.
13. Atomic CRM/follow-up workflow management.

Repository migrations `20260708_000001` through `20260708_000019` document the complete schema and function evolution. The live migration registry includes the production-applied layers from `business_settings` through `add_staff_crm_workflow_rpc`.

## External providers — intentionally NOT CONFIGURED

The following are not represented as live until real provider authorization is supplied and an executable adapter is registered:

- Meta / Instagram messaging and publishing.
- WhatsApp Business Platform automated sending and webhook ingestion.
- TikTok publishing.
- AI text generation provider.
- AI image generation provider.
- AI video generation provider.

The UI and APIs fail closed with `NOT CONFIGURED` / `PROVIDER_NOT_READY` states. There is no fake AI generation, fake social publishing, or fake automated reply success.

## External activation requirements

- Meta App ID, App Secret, Verify Token, OAuth/page/Instagram authorization, and webhook configuration.
- WhatsApp Business phone-number ID and access token, plus approved webhook and message-policy setup.
- TikTok client authorization/OAuth for the target publishing account.
- A chosen text-generation provider ID and server API key, plus a registered executable adapter.
- A chosen image-generation provider ID and server API key, plus a registered executable adapter.
- A chosen asynchronous video-generation provider ID and server API key, plus a registered executable adapter.
- A dedicated modern Supabase `sb_secret_...` key for the backend publish worker and an independent `INTERNAL_WORKER_TOKEN` when publishing is activated.

Provider credentials must be stored only in server-side environment/secret storage and must never be pasted into source code, public documents, URLs, or browser variables.

## Current merge gate

The cumulative integration branch must pass GitHub CI after the modern Supabase secret-key migration. Once the integration tree is on `main`, Production must be verified again for:

1. Public Premium homepage rendering.
2. `/api/business-settings` HTTP 200.
3. Public booking smoke and real persistence.
4. Staff sign-in and protected `/staff` access with Coach Ayman's confirmed Supabase Auth account.
5. Protected `/os` API authorization and real-data reads.
6. Provider status truthfulness with all unconfigured providers remaining fail closed.

External provider activation is a separate credential/OAuth step and is not a blocker for merging the truthful fail-closed platform foundation.
