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

## Current completed phase

- Branch: `agent/abuse-control-boundaries`.
- PR: #159.
- Added `src/platform/abuse-control.server.ts` with hashed IP/subject keys, bounded in-memory cleanup, standardized `429 RATE_LIMITED`, `Cache-Control: no-store`, and `Retry-After`.
- Staff login is limited to 8 attempts per IP + normalized email in 15 minutes.
- Public booking ingress is limited to 8 attempts per IP in 15 minutes before the Supabase booking RPC is contacted.
- Existing password recovery protection remains 3 attempts per IP + normalized email in 15 minutes and keeps enumeration-safe responses.
- AI provider routes remain protected by Staff Session, centralized RBAC, runtime schemas, and explicit input-size ceilings before provider invocation.
- Added `scripts/verify-abuse-control-boundaries.mjs` and made it a mandatory CI step.

## Verification

- CI run `29861760295` / run number 559 passed Typecheck, RBAC, authentication boundaries, mutation RBAC, mutation input contracts, abuse-control boundaries, Lint, Build, and all existing read-only contracts.
- The final Handoff-only head must pass the same CI suite before PR #159 is merged.

## Next security phase

1. Audit security response headers and browser boundaries: CSP, frame protection, MIME sniffing, referrer policy, and sensitive-route cache controls.
2. Add a read-only CI contract that prevents weakening those headers.
3. Preserve the same no-Preview, no-write, no-secret restrictions.

## Resume instruction

Read this file and `docs/program/CURRENT_EXECUTION_HANDOFF_2026-07-20.md`, verify current `main`, then continue from the next security phase. Do not start from zero and do not create a parallel security system.
