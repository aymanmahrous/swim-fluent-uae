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
- PR #160 — Strategic Security Hardening Wave 1; merge `9240e1cb489679bb649e2339a1aba2781d34bd26`; GitHub Actions CI run 563 succeeded.

## Current phase

- Strategic wave 2: Attack Surface Reduction.
- Branch: `agent/security-wave-2-attack-surface`.
- PR: #161.
- Added an explicit CI-enforced API route inventory. Routes must be classified as intentionally public, Staff-session protected, or machine-authenticated internal/Cron endpoints.
- Existing remote media boundaries remain locked: HTTPS-only allowlisted provider hosts, literal-IP rejection, manual redirect validation, bounded declared size, MIME allowlist, encoded storage paths, and no overwrite uploads.
- Added media magic-byte validation for PNG, JPEG, WebP, and MP4 signatures.
- Image-provider base64 assets are signature-validated before any storage operation.
- Image generation now exposes only allowlisted public error codes rather than deriving arbitrary codes from provider messages.
- Existing structured video provider logging remains URL, bearer credential, header credential, and query-secret redacted.
- Added `scripts/verify-attack-surface-wave-2.mjs` and made it mandatory in `.github/workflows/ci.yml`.

## Verification required before completion

- Typecheck.
- Existing RBAC, authentication, mutation input, abuse-control, and Wave 1 checks.
- New Attack Surface Wave 2 contract.
- Lint and Build.
- All existing read-only CI contracts.
- No Preview, deployment, provider execution, or Production write is permitted.
- GitHub Actions must report a completed successful run for the current PR head before merge.

## External non-code constraint

- Vercel status checks may report build-rate-limit failures. This does not authorize triggering Preview or deployment and is tracked separately from the mandatory GitHub Actions CI result.

## Next strategic wave

Architecture and AI verification:

1. Re-audit AI OS authorization, provider isolation, and production/demo data boundaries after security consolidation.
2. Verify module ownership and dependency direction.
3. Review performance-sensitive imports, route isolation, and bundle boundaries without running Preview.
4. Add read-only CI contracts preventing architectural regression.

## Resume instruction

The wave is complete only after the pull request has successful GitHub Actions CI, is merged, and this Handoff records the final PR and merge commit. Then continue directly to Architecture and AI verification without creating a parallel security system.
