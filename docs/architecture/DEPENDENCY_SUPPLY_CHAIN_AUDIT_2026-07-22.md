# Dependency & Supply-Chain Assurance Audit — 2026-07-22

## Scope and safety boundary

This audit is source-only and read-only with respect to runtime systems. It did not run Preview, Deploy, Production writes, database writes, migrations, seeds, Cron, workers, publishing, external providers, or Production secrets.

## Dependency inventory

- Package manager manifests: `package.json`, `package-lock.json`, and `bun.lock`.
- Direct runtime dependencies: 53.
- Direct development dependencies: 18.
- Package scripts: 22.
- Lifecycle installation hooks: none (`preinstall`, `install`, `postinstall`, and `prepare` are absent).
- Direct dependency specifiers: registry version ranges only; no Git, HTTP(S), GitHub shorthand, or local-file specifiers.
- The npm lock is lockfile version 3 and records registry resolution plus SHA-512 integrity for resolved packages.
- The Bun lock remains present and its root dependency declarations must match `package.json`.

## Unused and high-risk review

The direct inventory was reviewed conservatively against the application’s UI, form, router, chart, upload, build, lint, test, and server responsibilities. No dependency was removed without reliable source-reachability proof. The large Radix set is consumed through shared UI wrappers, so name-only usage checks are not sufficient evidence of non-use.

Build-time packages currently classified under runtime dependencies are retained to avoid changing installation/runtime assumptions in a security-only wave. This classification can be optimized separately with a build verification branch. No broad dependency upgrade was performed.

The upload client and provider-facing libraries remain covered by the previously merged media and provider isolation contracts. This phase introduces no provider execution.

## Workflow assurance

Six non-migration workflows now:

- pin reviewed third-party actions to full commit SHAs;
- use deterministic `npm ci`;
- pass `--ignore-scripts`, `--no-audit`, and `--no-fund`;
- retain explicit least-privilege top-level permissions.

The two migration-validation workflows are intentionally not modified in this phase. Editing either path would activate its pull-request migration job, which violates the program’s no-migration execution constraint. Their existing action tags are accepted only by a filename-scoped, exact-target CI exception, and the Supabase CLI binary remains fixed at `2.84.2`. The exception cannot authorize any additional action, workflow, permission, or CLI version.

## CI regression contract

`scripts/verify-dependency-supply-chain.mjs` fails CI when:

- either lock root drifts from `package.json`;
- npm lock entries resolve outside the npm registry or lack SHA-512 integrity;
- lifecycle install hooks or non-registry direct dependency specifiers appear;
- a workflow omits top-level permissions or uses `write-all`;
- a non-exempt action is not pinned to the reviewed full SHA;
- a non-exempt workflow uses `npm install` instead of `npm ci`;
- any workflow installation enables lifecycle scripts;
- a narrowly exempt migration workflow changes its reviewed action set or Supabase CLI version.

## Residual constraints

- The migration workflows retain mutable action tags solely because safely pinning them would trigger prohibited migration execution on the PR. This is documented and bounded in CI, not silently accepted.
- License review is manifest/registry-origin based in this phase; no external license-scanner binary or install scripts were executed.
- Vercel `build-rate-limit` remains an external constraint. No Preview or Deploy retry is authorized or attempted.

## Transition gate

Transition is safe only after the phase PR’s latest commit passes GitHub Actions, review threads are clear, the handoff records the PR and CI evidence, and the PR is merged. External Vercel rate-limit status is recorded separately and is not retried.
