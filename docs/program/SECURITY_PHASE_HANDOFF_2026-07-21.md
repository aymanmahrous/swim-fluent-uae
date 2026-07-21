# Security Phase Handoff — 2026-07-21

## Locked scope

- Repository: `aymanmahrous/swim-fluent-uae` only.
- No Preview or deployment.
- No migrations, seeds, Cron jobs, Workers, publishing, or external provider execution.
- No Production secrets, database writes, or Production writes.

## Verified merged baseline

- PR #156 — authentication-domain separation; merge `6b9a7d36f70ff2864babf215c946f3e20f6ba8e1`.
- PR #157 — centralized RBAC for AI OS mutations; merge `b178a0b4928c3bdb9af4637ea4105aebfa7fea25`.
- PR #158 — API mutation input validation contracts; merge `8980cd34ebd9f10da3063d05918da4d3cba8bcb3`.
- PR #159 — abuse-control boundaries; merge `f6586df036076b1b6b0139be79986d01507fee32`.

## Current phase

- Strategic wave 1: Security Hardening.
- Branch: `agent/security-hardening-wave-1`.
- Central browser security headers are applied in `src/server.ts`, including CSP, frame protection, MIME sniffing protection, referrer policy, permissions policy, and cross-origin isolation boundaries.
- Sensitive `/api`, `/admin`, `/staff`, `/os`, and password-related routes are forced to `Cache-Control: no-store, max-age=0` with `Pragma: no-cache`.
- Unsafe cross-site requests are rejected before application handlers using Fetch Metadata and same-origin `Origin` validation while requests without browser-origin headers remain available for deliberate server-to-server integrations.
- Existing Staff cookies retain `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, bounded `Max-Age`, non-cacheable auth responses, and refresh-token exchange through the auth provider.
- Added `scripts/verify-security-hardening-wave-1.mjs` to lock header, session, CSRF, cache, and committed-secret boundaries.
- Made the new verification mandatory in `.github/workflows/ci.yml`.

## Verification required before completion

- Typecheck.
- Existing RBAC, authentication, input-contract, and abuse-control checks.
- New Security Hardening Wave 1 contract.
- Lint and Build.
- All existing read-only CI contracts.
- No Preview, deployment, external API execution, or Production write is permitted.

## Next strategic wave

Attack Surface Reduction:

1. Public API surface inventory and unnecessary endpoint closure.
2. File upload MIME, size, filename, and ownership hardening.
3. Error response and logging sanitization.
4. Read-only CI contracts preventing regression.

## Resume instruction

Verify the current PR and CI status. The wave is complete only after successful CI, merge, and this Handoff being updated with the final PR and merge commit. Then continue directly to Attack Surface Reduction without creating a parallel security system.
