# PROJECT HANDOFF

Document status: CURRENT
Authority: OPERATIONAL
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)
Owner: Repository Owner
Historical evidence: `docs/history/PROJECT_HANDOFF_PRE_C7C0F118_FULL.md`

## Purpose

This is the current operational continuation source. Historical evidence remains immutable and non-executable. No governance stage authorizes runtime, database, provider, deployment or Production action without separate explicit approval.

## Source-of-truth order

1. `AGENT_CONSTITUTION.md`.
2. `docs/governance/PHASE_NAMESPACE.md`.
3. This Handoff.
4. `docs/governance/GOV_E_READINESS_REPORT.md`.
5. Normalized Workflow files under `.github/workflows/`.
6. `docs/governance/GITHUB_RULESETS_DESIGN.md` and `GITHUB_ENVIRONMENTS_DESIGN.md`.
7. `docs/governance/WRITE_AND_WORKFLOW_REGISTRY.md` and `RISK_OWNERSHIP_MATRIX.md`.
8. `docs/governance/PR_REGISTRY.md`.
9. Historical and superseded evidence only.

## Current governance stage

`GOV-E: COMPLETED — READY FOR GOV-F`

GOV-A restored source truth, GOV-B organized PR risk, GOV-C inventoried writes and ownership, GOV-D designed GitHub enforcement, and GOV-E normalized branch-only CI. No Workflow or verification command was run.

## Stable check names

- `verify:source`;
- `verify:ci`;
- `verify:release`;
- `test:unit`;
- `test:security`;
- `test:contracts`;
- `test:integration:disposable`;
- `test:e2e:preview`.

Production read-only is intentionally separate as `verify:production-readonly` and must not be confused with source CI or release checks.

## Typecheck and build separation

`package.json` now defines:

- `typecheck`: `tsc --noEmit`;
- `build:dev`: `vite build --mode development`;
- `build`: `vite build`.

Type checking no longer performs a Vite build implicitly.

## Main CI normalization

`.github/workflows/ci.yml` now separates:

- `supply-chain`;
- `verify:source`;
- `test:unit`;
- `test:security`;
- `test:contracts`;
- `verify:ci`;
- `verify:release`.

The workflow remains limited to PRs and pushes to `main` and contains no Production-write credentials.

## Supply-chain job

The independent job defines:

- `npm ci --ignore-scripts`;
- lockfile dry-run integrity;
- `npm audit --omit=dev`;
- version-pinned unused-package and license checks;
- the existing supply-chain contract verifier;
- CycloneDX SBOM generation and pinned artifact upload;
- rejection of `@v*`, `@main`, and `@master` Action references.

These commands were not executed during GOV-E.

## Action pinning

- The main CI was already using full SHAs and remains pinned.
- `booking-phone-foundation.yml` and `fresh-supabase-migration-compatibility.yml` were changed from floating tags to full SHAs.
- `supabase/setup-cli` is pinned to `3c2f5e2ae34c34e428e8e206e2c4d21fa2d20fbf` (`v2.1.1`).
- Checkout, Setup Node, Upload Artifact and other modified Action references use full SHAs.

## Verification-level separation

### Source

PR and push-to-main CI. Static source, tests, contracts, development build, production build and release-source verification only.

### Disposable environment

Migration compatibility remains in dedicated Workflows with job names under `test:integration:disposable`. These use local/disposable Supabase only and were not dispatched.

### Preview

`.github/workflows/preview-readonly.yml` is manual-only, requires an exact HTTPS Preview URL and target SHA, is bound to `preview-readonly`, uses no write credentials and exposes `test:e2e:preview` through the existing mobile browser verifier.

### Production-readonly

`production-smoke-readonly.yml` exposes `verify:production-readonly`, is bound to `production-readonly`, and verifies pages and headers without writes. It was not run by GOV-E.

### Production-write and AI-spend

Remain isolated from normal CI, manual/protected and frozen. Existing AI media or Production-writing definitions were not dispatched.

## PR and risk state

- PR #168 remains blocked and overlapping.
- PR #169 remains evidence only.
- PR #170 remains frozen and non-merge-ready.
- PR #46 remains blocked by privacy/legal/owner decisions.
- PR #36 remains blocked by database-foundation dependency.
- AI, migrations, media generation, publishing, scheduling, Storage mutation, secrets and Production writes remain frozen or blocked.

## Enforcement limitation

Rulesets, Branch Protection, Required Checks, Code Owner enforcement and GitHub Environments are not active on `main` merely because files exist on this branch. Required checks must not be activated until a separately authorized run observes successful contexts with the exact stable names.

## Safety receipt

No Workflow, script, test, audit, build, Preview, deployment, Migration, Supabase/provider connection, generation, publishing, scheduling, Production action, PR metadata change, secret change or `main` modification occurred.

## Transition gate

GOV-E is complete as a branch-only CI-normalization stage. GOV-F may begin only under a separate explicit instruction.
