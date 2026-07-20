# Current Execution Handoff — 2026-07-20

## Verified main baseline

- Repository: `aymanmahrous/swim-fluent-uae`
- Latest verified merged commit: `c38e566b8a2a53f5735326a8c631707b11f97d42`
- Merged PR #136: high-intent conversion event coverage.
- Merged PR #137: mobile sticky assessment and WhatsApp conversion bar.

## Active safe work

- Issue #138: Codex read-only performance audit with zero Production risk.
- Codex must use a new branch, open a review PR, and never merge or deploy Production.
- No booking, Supabase, authentication, environment-variable, pricing, workflow, or Production-writing changes are allowed.

## Next execution order

1. Fix the confirmed accessible-name defect for the booking form full-name and phone inputs on Arabic and English routes.
2. Preserve booking behavior and bilingual parity.
3. Require Typecheck, Lint, Build, SEO, sitemap, Production Quality Gate, and existing CI checks before merge.
4. Review Codex performance findings only after independent evidence and no-overlap confirmation.

## Non-overlap rule

- Main execution owns accessibility and conversion correctness.
- Codex owns only the isolated public-route performance audit in Issue #138.
- Neither lane may change booking submission, database code, Production configuration, or external integrations.

## Resume instruction

Read this file, `PROJECT_HANDOFF.md`, `PROJECT_STRATEGY_HANDOFF.md`, and Issue #138. Verify current `main` before changing code. Do not start from zero and do not create parallel systems.
