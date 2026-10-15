# P0 Security and Runtime Evidence — 2026-08-01

Status: `PARTIALLY_VERIFIED_READ_ONLY`

Baseline main SHA: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`

This artifact is read-only evidence. It authorizes no merge, deployment, migration, permission change, Production booking, retry, publishing, scheduling, Analytics activation, Ads, billing, spend, or secret handling.

## 1. OPEN_PR_AND_STALE_BRANCH_REGISTER

| PR | Head SHA | State | CI | Vercel Preview | Mergeability | Workstream | Classification | Recommended disposition |
|---|---|---|---|---|---|---|---|---|
| #240 | `45299ff782c70168210e0b2e2598d598b31d7c4b` | Draft/Open | CI #793 SUCCESS; Public Analytics Foundation #29 SUCCESS; Public CTA Events #21 SUCCESS; Bilingual Analytics Consent UI #19 SUCCESS | `dpl_4vPKQjb66tax1caBKjZzBhW33GYA` CANCELED; no READY Preview for exact head | mergeable=true | P0 baseline documentation | CURRENT / ISOLATED | Keep Draft. Do not expand, close, or merge without owner approval. |
| #238 | `9ec9df08f0b7bea82833236b38dde8faf1907410` | Open, not Draft | UNKNOWN for exact current head | Latest observed branch deployments for earlier heads were CANCELED; exact-head READY Preview UNKNOWN | mergeable=true | GA4 Preview validation | PARTIALLY_COMPLETED / PREVIEW_EVIDENCE_MISSING | Preserve as Preview-only validation branch; do not merge; require exact-head Preview receipt or close later as superseded after evidence capture. |
| #36 | `8fa814167bcb9c6a6b33b27d7b7acdabdb9ca500` | Draft/Open | Historical only; not current release evidence | UNKNOWN | mergeable=false | International phone historical Phase B | SUPERSEDED / DO_NOT_MERGE | Keep historical reference only. Rebuild approved requirements from current main in a new isolated branch if later authorized. |

Observed stale/review branches tied to recent Vercel records include `docs/official-face-reference-lock`, `agent/ga4-preview-validation`, `feat/public-cta-registry-foundation`, and merged agent branches. Branch deletion/closure was not performed. Full branch-age inventory remains `UNKNOWN` because no authoritative paginated branch list with last-commit comparison was completed in this batch.

## 2. VERCEL_RUNTIME_BASELINE

### Official project

- Team: `team_D6l9xBXFbufjD2W3APokAfgs`
- Project ID: `prj_4wRrALwNzlU0msHb9pGOsExmNID0`
- Project name: `swim-fluent-uae-w532`
- Framework reported by Vercel: `tanstack-start`
- Official Production deployment: `dpl_BX1Gcs7NEsE6c3KWf8FYaWJJfH9k`
- State: `READY`
- Production commit: `59f300369c3b8321ceb4bf822d1f13ad19b5776e`
- Target: `production`
- Aliases:
  - `www.relaxfixuae.com`
  - `relaxfixuae.com`
  - `swim-fluent-uae-w532.vercel.app`
  - `swim-fluent-uae-w532-swimmingayman-8492s-projects.vercel.app`
  - `swim-fluent-uae-w532-git-main-swimmingayman-8492s-projects.vercel.app`

### Important Preview mapping

| PR | Deployment | Commit | State | Represents official Production? |
|---|---|---|---|---|
| #240 | `dpl_4vPKQjb66tax1caBKjZzBhW33GYA` | `45299ff782c70168210e0b2e2598d598b31d7c4b` | CANCELED | No |
| #238 | `dpl_2xwRDwemT9ZJ1ULTCd8wp2SfzsPt` | `ebbeb71a111abb9f2ef3484111f246d209917a16` | CANCELED | No; not exact current head |
| #238 | `dpl_5YGATR9QqEqejdweiUh9R4H5dnDd` | `0f0832f31c57b2f33a8f1b652ac341927f046926` | CANCELED | No; not exact current head |
| #239 | `dpl_3xXUh5hVztJs2BozxK9X2FpUbthE` | `1600c56c73b69c20f019665a1bbcdc425056dc2a` | READY | No; Preview only |
| #231 | `dpl_8iiFZDEa48m2HDsi9gQnP4T9Tq6z` | `ab22bb7f7e4ab2d479ef591a6167533df2e643f3` | READY | No; Preview/redeploy only |

No secondary Vercel project was proved in this batch. Any other project remains `UNKNOWN`, not assumed official. Only project `prj_4wRrALwNzlU0msHb9pGOsExmNID0` is accepted here as the customer-site source of truth.

## 3. SUPABASE_SECURITY_MATRIX

Supabase project inspected read-only:

- Project ref: `nmzxrjdxvmmzzmajrskm`
- Name: `aymanmahrous's Project`
- Region: `eu-west-1`
- Status: `ACTIVE_HEALTHY`
- Database: PostgreSQL `17.6.1.105`

A second project `aazhniddjvhuimlxxjfd` named `relaxfix-pro` is `INACTIVE`; its relationship to the active application is not proven and remains `UNKNOWN`.

### Core function matrix

| Function/RPC | SECURITY DEFINER | Execute roles observed | Caller/role enforcement | RLS dependency/public exposure | Impact | Severity | Remediation proposal | Rollback/tests required |
|---|---:|---|---|---|---|---|---|---|
| `submit_booking_request` | Yes | `postgres`, `service_role` | No direct user-role check; intended internal call | Bypasses RLS; no anon/authenticated EXECUTE observed | Booking write and idempotency | S1 if exposed through unsafe server path; otherwise S2 | Keep server-only; prove ingress is sole public path; add contract test that anon/authenticated cannot invoke directly | New migration only if grants change; test privilege denial, duplicate key, active-slot uniqueness, sanitized errors |
| `submit_booking_request_ingress` | Yes | `postgres`, `service_role` | Fingerprint, honeypot, elapsed-time and rate-limit checks; no JWT role check | Bypasses RLS; no direct anon/authenticated grant observed | Public booking ingress | S1 | Verify server endpoint uses service role only and never exposes it; prove fingerprint derivation and rate-limit behavior | New migration if changed; isolated integration tests for retry, timeout and concurrent submissions |
| `is_active_staff` | Yes | `postgres`, `service_role` | `auth.uid()` + active profile + allowed role array | Central authorization helper; bypasses RLS | All Staff RPC authorization | S1 central control | Preserve server-side role check; test every role and inactive profile; review token freshness and app-metadata assumptions | No change now; role-fixture matrix required |
| `get_staff_bookings` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception/coach` | Bypasses table RLS; callable by authenticated but self-checks | Full booking PII read | S1 | Prove denial for content_manager and non-staff authenticated users; consider data minimization by role | New migration/function version if changed; response-scope tests |
| `update_booking_request_status` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception`; excludes coach/content_manager | Bypasses RLS; audited mutation | Booking state write | S1 | Preserve allowlist; test invalid status, unchanged status, audit event and denial roles | Rollback function migration; transactional tests |
| `get_staff_command_center` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception/coach` | Bypasses RLS and aggregates leads/conversations | Staff dashboard sensitive aggregates | S1 | Define whether coach should see global queue; add least-privilege data-scope tests | Function migration if scope changes; role-specific snapshots |
| `get_staff_crm_leads` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception/coach` | Bypasses RLS; returns names/phones and lead details | CRM PII read | S1 | Verify coach global-access requirement; otherwise scope to assigned leads | Migration + rollback; per-role row-scope tests |
| `get_staff_inbox` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception/coach` | Bypasses RLS; returns message excerpts | Conversation and PII read | S1 | Confirm coach business need; redact/minimize message body where possible | Migration + role snapshots + raw-error tests |
| `set_staff_conversation_mode` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception` | Bypasses RLS; writes conversations/leads and audit log | CRM automation control | S1 | Preserve exclusion of coach/content_manager; test idempotent same-mode behavior | Transactional rollback and audit tests |
| `update_staff_lead_workflow` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/reception/coach` | Bypasses RLS; writes leads, conversations and follow-up jobs | Follow-up scheduling/outbound preparation | S1 | Reassess coach authority to schedule follow-up; ensure no outbound send occurs from this RPC alone | Migration rollback; terminal stage, do-not-contact and max-attempt tests |
| `create_staff_generated_content_batch` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager` | Bypasses RLS; validates content and inserts audit log | Content creation | S2 | Keep explicit role gate and uniqueness checks; ensure no publish action | Validation, duplicate and role-denial tests |
| `update_staff_content_item` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager` | Bypasses RLS; clears schedule and kills pending publish jobs | Content mutation | S1 | Preserve published immutability and schedule-clear behavior | State-transition and concurrent-job tests |
| `transition_staff_content_item` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager` | Bypasses RLS; can enqueue publish job | Scheduling readiness; may cause later publish | S1 | Protected owner approval must remain outside technical role gate; add application-level approval receipt gate before `schedule` | Migration/function rollback; approval receipt, idempotency and safe-stop tests |
| `can_manage_relax_fix_media` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager` | Helper for storage/media policies | Media access | S2 | Keep role helper; verify storage policies call it consistently | Storage policy tests |
| `create_staff_media_asset_record` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager`; path must start with caller UID | Bypasses RLS, verifies object exists | Media metadata write | S2 | Test cross-user path rejection and missing object behavior | Transactional tests; no Production write |
| `create_staff_video_generation_job` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager` | Bypasses RLS; provider job uniqueness | Paid-generation workflow risk | S1 | Keep paid generation separately approval-gated at application/provider layer | Provider-mock tests, duplicate ownership test |
| `update_staff_video_generation_job` | Yes | `authenticated`, `postgres`, `service_role` | Allows `super_admin/admin/content_manager`; request owner enforced | Bypasses RLS; persists asset on success | Media write | S2 | Prove job owner isolation and immutable success behavior | Mock-storage and role-denial tests |

### Other privileged service-only SECURITY DEFINER functions observed

`claim_content_automation_lease`, `claim_next_content_media_job`, `claim_next_publish_job`, `claim_publication_receipt`, `complete_content_automation_run`, `complete_content_media_job`, `complete_publication_receipt`, `complete_publish_job`, `defer_content_media_job`, `defer_publish_job`, `dispatch_content_automation_pulse`, `enqueue_content_media_after_insert`, `fail_content_automation_run`, `fail_content_media_job`, `fail_content_media_video_provider_job`, `fail_publish_job`, `mark_publication_receipt_ambiguous`, `record_content_media_video_provider_job`, `record_publication_container`, `release_content_automation_lease`, `rls_auto_enable`, `set_content_automation_pulse_active`, `start_content_automation_run`, and `verify_content_automation_scheduler_token`.

Observed grants for these functions were limited to `postgres` and `service_role`. They remain S1/S2 operationally because compromise of the server credential or an unsafe wrapper could bypass RLS and mutate publishing/media state. No grant mutation was performed.

### Trigger functions

- `prepare_content_item_for_media` — `SECURITY INVOKER`; EXECUTE observed for `anon`, `authenticated`, `postgres`, `service_role`; used only as BEFORE INSERT trigger on `content_items`.
- `enqueue_content_media_after_insert` — `SECURITY DEFINER`; AFTER INSERT trigger on `content_items`; service-only execution grants observed.

Triggers observed:

- `content_items_prepare_media_before_insert`
- `content_items_enqueue_media_after_insert`

### RLS evidence

RLS was enabled on `booking_requests`, `booking_ingress_attempts`, `staff_profiles`, `leads`, `conversations`, `messages`, `content_items`, `media_assets`, `ai_media_jobs`, `audit_logs`, and `business_settings`.

No direct policies were present on the sensitive operational tables listed above, so access is intentionally mediated by privileged RPCs/service code. `staff_profiles` permits authenticated users to read only their own active profile. `business_settings` permits `anon` and `authenticated` SELECT for row `id='primary'`.

### Raw error exposure verdict

- Booking RPC catches unknown exceptions and returns generic `SERVER_ERROR`; raw database errors are not returned by that function.
- Staff RPCs intentionally raise `STAFF_ACCESS_DENIED` with SQLSTATE `42501`; client/API translation behavior is `UNKNOWN` until runtime tests prove raw detail, hints, schema names and stack data are suppressed.
- Provider/media failure functions accept error text; downstream UI/log redaction is `UNKNOWN`.

### Migration dependency

Any grant, function, RLS, trigger, policy or role change requires a new migration. Historical migrations must not be edited. No migration was executed.

## 4. BOOKING_IDEMPOTENCY_TEST_MATRIX

No Production booking was submitted. The following verdicts combine read-only function-definition inspection with required isolated test expectations. Runtime rows are `NOT_EXECUTED` until a non-Production database/Preview is available.

| Scenario | Expected DB effect | Expected API result | Evidence/verdict |
|---|---|---|---|
| Same idempotency key twice | Exactly one `booking_requests` row; second call returns existing ID | success=true, duplicate=true on repeat | STATICALLY_SUPPORTED by pre-check, unique-violation fallback and idempotency lookup; runtime concurrency proof missing |
| Different idempotency keys, identical phone/slot | First row only if active-slot uniqueness constraint exists and applies; second should be duplicate conflict | `DUPLICATE_REQUEST` expected | PARTIALLY_SUPPORTED by unique-violation handler; exact constraint definition/runtime proof UNKNOWN |
| Network retry after successful response loss | One row | existing ID, duplicate=true | STATICALLY_SUPPORTED; transport retry test NOT_EXECUTED |
| Timeout/ambiguous response | Client must not create a new key or blindly retry with another key | Same-key status should be safely repeatable | APPLICATION BEHAVIOR UNKNOWN; requires safe-stop test |
| Double-click | Client should disable submit and reuse one key; DB remains one row | one success; duplicate safe if second request escapes UI | DB STATICALLY_SUPPORTED; UI behavior UNKNOWN |
| Browser refresh after submit | No automatic resubmit; if user retries, reuse stored key only when state is known | no duplicate | UNKNOWN; browser-state test required |
| Arabic flow | Same normalized payload and one-row behavior | localized safe message; no raw error | UNKNOWN runtime |
| English flow | Same as Arabic | localized safe message; no raw error | UNKNOWN runtime |
| Mobile flow | One request despite taps/network changes | deterministic loading/success/error state | UNKNOWN runtime |
| Concurrent same-key requests | One insert; losing transaction resolves existing ID | one duplicate=false and one duplicate=true | Designed via unique violation handling; concurrency test NOT_EXECUTED |
| Ingress bot/rate-limit rejection | No booking row; one ingress-attempt audit row | `BOT_REJECTED` or `RATE_LIMITED` | STATICALLY_SUPPORTED; runtime NOT_EXECUTED |

Overall duplicate-prevention verdict: `PARTIALLY_VERIFIED_STATICALLY — ISOLATED_RUNTIME_CONCURRENCY_AND_UI_EVIDENCE_REQUIRED`.

## 5. STAFF_RBAC_TEST_MATRIX

Server-side definitions prove role checks exist; authenticated runtime fixtures were not available. UI hiding alone is not accepted as proof.

| Role | Expected routes/UI | Server RPC access expected | Denied operations | Data scope concern | Expected API result | Verdict |
|---|---|---|---|---|---|---|
| `super_admin` | All Staff modules | All listed Staff RPCs | None within technical role lists; protected owner gates still apply | Global | success | STATICALLY_SUPPORTED; runtime missing |
| `admin` | All operational modules | Same broad access as super_admin in inspected RPCs | Protected external actions still owner-gated | Global | success | STATICALLY_SUPPORTED; runtime missing |
| `reception` | Booking, CRM, inbox, command center | `get_staff_bookings`, `get_staff_command_center`, CRM/inbox reads, booking status, conversation mode, lead workflow | Content/media management and generation RPCs | Global booking/lead PII | success for allowed; 42501 for denied | STATICALLY_SUPPORTED; runtime missing |
| `coach` | Booking/CRM/inbox/command center expected | Reads plus `update_staff_lead_workflow`; no booking-status write or conversation-mode write | Content/media; booking status; conversation mode | Currently global PII in inspected reads; least-privilege review required | success/42501 | STATICALLY_SUPPORTED; scope risk S1 |
| `content_manager` | Content/media modules | content, media, video and content-transition RPCs | Booking/CRM/inbox/command center RPCs | Content/media only | success/42501 | STATICALLY_SUPPORTED; runtime missing |
| authenticated non-staff | No Staff routes | No inspected Staff RPC should pass `is_active_staff` | All Staff data/mutations | None | SQLSTATE 42501 / sanitized API denial | STATICALLY_SUPPORTED; runtime/raw-error proof missing |
| unauthenticated | Public routes only | No Staff RPC access; authenticated-only EXECUTE should fail | All Staff routes/RPCs | None | 401/403 or PostgREST permission denial | GRANT STATICALLY_SUPPORTED; runtime missing |

Route-level exact URL allow/deny mapping is `UNKNOWN` because this batch did not execute a browser session or inspect every router guard. Required acceptance tests must pair route navigation with direct RPC calls, expired/forged sessions, inactive staff profiles, role changes, and raw-error inspection.

## 6. REPLIT_DRIFT_REGISTER

| Field | Verified value |
|---|---|
| App name | `Command Center Hub` from prior accepted handoff; current account resolver did not find it |
| Known historical replId | `744ff594-34c9-410f-92d4-5287d6efdc41` |
| Current runtime state | UNKNOWN |
| Current Preview | UNKNOWN |
| Local HEAD | UNKNOWN |
| Local-only commits | Historical handoff reported 7 local commits, but current list and SHAs are UNKNOWN |
| GitHub divergence | UNKNOWN current; historical divergence remains unresolved |
| Supabase target | UNKNOWN current runtime binding |
| Production credential/service-role risk | HIGH/UNKNOWN until environment inventory proves separation; no values may be exposed |
| Isolated-preview readiness | NOT_VERIFIED |
| Accepted source of truth | GitHub `main` + official Vercel project for customer site; Replit is separate internal app |
| Exact blocker | Replit app resolver returned not found for current connected account, and read-only Agent query using known replId returned HTTP 403 Forbidden |

No Replit login, mutation, deployment, or Production write occurred.

## 7. COMMAND OUTPUT RECEIPTS

- GitHub open PR search returned exactly #240, #238 and #36 at audit time.
- Vercel official Production inspection returned `dpl_BX1Gcs7NEsE6c3KWf8FYaWJJfH9k`, READY, commit `59f300369c3b8321ceb4bf822d1f13ad19b5776e` and the listed aliases.
- Supabase project list returned active project `nmzxrjdxvmmzzmajrskm` and inactive project `aazhniddjvhuimlxxjfd`.
- Supabase catalog queries enumerated function security mode, grants, definitions, RLS state, policies and triggers without writes.
- Replit resolver returned `found=false`; direct read-only question returned HTTP 403 Forbidden.

## 8. REQUIRED NEXT TESTS

1. Create or use an owner-approved isolated Supabase branch/non-Production project.
2. Run concurrent booking ingress tests with synthetic data and no Production writes.
3. Run browser tests in Arabic/English/mobile for double-click, timeout and refresh behavior.
4. Create controlled Staff fixtures for all six roles and test both routes and direct RPC calls.
5. Capture API response bodies and headers to prove raw-error suppression.
6. Resolve Replit account ownership/access and collect read-only HEAD/divergence/environment evidence.
7. Obtain exact-head READY Preview evidence for PR #238 if it remains needed.

## 9. SAFETY LOG

- No merge.
- No direct `main` modification.
- No Vercel deployment or retry.
- No Supabase SQL write, migration, grant or permission mutation.
- No Production booking.
- No Replit mutation or login against Production.
- No secret values retrieved or recorded.
- No publishing, scheduling, messaging, Ads, billing or spend.
