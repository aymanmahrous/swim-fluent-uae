# PWA Current-Main Rebuild Review

Last verified: 2026-07-30 Asia/Dubai

Status: `PWA_CURRENT_MAIN_REBUILD_VALIDATION_IN_PROGRESS`

## Construction

- Base: `main` at `8288881babbb1c085c19f86e55471999191d8859`.
- New branch: `agent/pwa-current-main-rebuild-20260730`.
- Source reference: Draft PR #213 at `7b479f60089f70c269b7122110a49bba4f20455a`.
- Method: approved PWA file scope copied onto a fresh current-main tree; no rebase, force update or bulk commit transfer from PR #213.

## Preserved scope

- install manifest;
- 192, 512 and Apple touch icons;
- bilingual noindex offline fallback;
- bounded Service Worker precache and cache ownership;
- root registration, update and reversible cleanup path;
- CI and source contract verifier;
- owner-attested device gate receipt;
- rollback plan.

## Explicit exclusions

No old Handoff or Ledger copy, Supabase, Auth, RLS, database, booking security, International Phone, secrets, environment settings, native Android/iOS application, Merge or Production Promotion.

## Device evidence

- Gate: `PWA_DEVICE_GATE_OWNER_ATTESTED_PASS_DOCUMENTATION_RISK_ACCEPTED`.
- Result: `OWNER_WITNESSED_MANUAL_DEVICE_TEST_PASS`.
- Evidence: `OWNER_ATTESTATION_ONLY_NO_SCREENSHOT_RECEIPT`.
- No screenshot, recording, independent QA or automated-device verification is claimed.
- Device testing is not repeated unless the rebuilt candidate changes observable PWA behavior.

## Pending final evidence

- GitHub Actions CI on final head;
- Vercel exact-head Preview availability and browser review;
- manifest and icon validation;
- Service Worker registration, activation, update and safe failure behavior;
- private/cache/privacy boundaries;
- offline and return-online behavior;
- rollback verification and residual-risk classification.
