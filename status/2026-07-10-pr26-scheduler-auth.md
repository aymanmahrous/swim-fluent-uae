# PR #26 — Scheduler Authentication Verification State

Date: 2026-07-10

## Verified code state

- PR #26 merged to `main` as `385ec790a2b8c21431265bcbe95cc57665d13e9f`.
- CI passed TypeScript, lint, production build, SEO, Content Brain, Meta publishing contracts, autonomous media worker contracts, server-side scheduler contracts, modern/legacy Supabase server-key compatibility, Vercel build policy, AI OS security, AI media hardening, E2E admin contracts, and live Supabase booking verification.
- Privileged Supabase clients now classify the configured server key before adding authorization headers.
- Modern `sb_secret_...` keys are sent as `apikey` and are never sent as Bearer tokens.
- Legacy JWT keys are accepted only when the decoded payload has `role=service_role` and is not expired; only that validated legacy form receives `Authorization: Bearer`.
- Malformed, anon, authenticated, user, expired, and unknown key formats fail closed.

## Live scheduler pulse history

- The five-minute Supabase Cron pulse was activated once for a live authentication smoke.
- The first pg_net request reached the live Vercel scheduler route and returned HTTP 401 with `UNAUTHORIZED`.
- No `content_automation_runs` row was created by the failed request.
- The five-minute pulse was immediately deactivated before the next scheduled cycle.
- The scheduler token remains encrypted in Supabase Vault; its plaintext was not exposed in GitHub or chat.
- The scheduler auth table stores only the SHA-256 token hash.
- The five-minute Cron job remains installed and inactive pending deployment and verification of PR #26.

## Next activation gate

1. Vercel Production must deploy a `main` commit containing PR #26.
2. The stable Vercel scheduler route remains expected to return 401 when called without authorization.
3. A single manual Supabase pg_net pulse is dispatched after the verified Production deployment.
4. Only an authenticated scheduler response plus a persisted `supabase_cron` automation run permits re-enabling the five-minute Cron.
5. Any 401, 500, missing-key, or invalid-key result keeps the pulse disabled and becomes the next exact blocker.

No live scheduler success is claimed until this gate passes.
