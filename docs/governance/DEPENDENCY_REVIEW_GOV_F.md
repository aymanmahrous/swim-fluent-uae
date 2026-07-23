# Dependency Review — GOV-F

Document status: CURRENT
Authority: GOVERNANCE
Applies to: swim-fluent-uae
Reviewed: 2026-07-23 (Asia/Dubai)

## Decision

All `dependencies` and `devDependencies` were reviewed statically. Because GOV-F prohibits running the pinned unused-package check, build, typecheck or tests, no package is declared confirmed-unused and no lockfile or package entry was removed.

The large Radix/shadcn UI set, TanStack packages, Playwright, TypeScript, Vite, Tailwind, validation and formatting dependencies remain `RETAIN PENDING EXECUTED EVIDENCE`. Static absence from one search is not sufficient proof because dynamic imports, generated routes and component registries can hide usage.

## Removal gate

A package may be removed only in a separate isolated PR after all of the following succeed under explicit authorization:

1. pinned unused-package check;
2. repository-wide import and dynamic-use review;
3. typecheck and source checks;
4. build and relevant tests;
5. lockfile regeneration with a scoped diff;
6. independent approval.

No dependency, devDependency, `package-lock.json` or `bun.lock` change occurred in GOV-F.