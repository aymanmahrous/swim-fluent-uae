# GOV-E Readiness Report

Document status: CURRENT
Authority: EVIDENCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Decision

`GOV-E: COMPLETED — READY FOR GOV-F`

This means branch-only CI normalization is complete. It does not mean any Workflow was run or any required check was activated on `main`.

## Completed scope

1. Established stable check names: `verify:source`, `verify:ci`, `verify:release`, `test:unit`, `test:security`, `test:contracts`, `test:integration:disposable`, and `test:e2e:preview`.
2. Separated `typecheck` (`tsc --noEmit`) from `build:dev` and `build`.
3. Rebuilt the main CI into source, unit, security, contracts, build/release and supply-chain jobs.
4. Added an independent `supply-chain` job with script-free lockfile install, lockfile dry-run, runtime audit, unused-package check, license summary, CycloneDX SBOM artifact, existing supply-chain contract verification and Action-pinning check.
5. Replaced floating Action tags in the reviewed migration Workflows with full SHAs, including `supabase/setup-cli` pinned to `3c2f5e2ae34c34e428e8e206e2c4d21fa2d20fbf`.
6. Named Disposable migration jobs under `test:integration:disposable`.
7. Added a manual `preview-readonly` Workflow exposing `test:e2e:preview` and using the existing mobile Preview verifier.
8. Named the existing Production read-only smoke level `verify:production-readonly` and bound it to `production-readonly`.
9. Kept Production-writing and AI-spend Workflows isolated and manual; none were dispatched.

## Verification-level separation

- Source: PR and push-to-main CI without external write credentials.
- Disposable: migration compatibility Workflows using local/disposable Supabase only.
- Preview: manual `preview-readonly`, exact Preview URL and target SHA, no write credentials.
- Production-readonly: isolated smoke Workflow with read-only page/header verification.
- Production-write and AI-spend: outside normal CI and remain protected/frozen.

## Important limitations

- All definitions were statically reviewed only; no Workflow, test, build, audit, browser or migration scenario ran.
- `npx`-based unused-package and license tools are version-pinned in the Workflow but are not lockfile dependencies; GOV-F should decide whether to vendor them as devDependencies.
- Required-check activation remains blocked until a separately authorized settings stage observes successful checks with the exact stable names.

## Safety receipt

No Workflow, script, test, build, Preview, deployment, Migration, Supabase/provider connection, generation, publishing, Production action or `main` change occurred.

## Transition condition

GOV-F may begin only after separate explicit instruction.
