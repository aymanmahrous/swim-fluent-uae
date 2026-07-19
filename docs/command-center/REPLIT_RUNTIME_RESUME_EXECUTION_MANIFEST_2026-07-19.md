# Replit Runtime Resume Execution Manifest — 2026-07-19

Status: `RUNTIME_RESUME_PACKAGE_READY_ACCESS_BLOCKED`

## Preserved target

- existing project: `Command Center Hub`;
- do not create a replacement project;
- preserve the existing branch, worktree, database, Owner session, checkpoints, and backups;
- current known test-only target: Session test isolation.

## Mandatory read-only entry audit

Before any edit:

1. record project identity;
2. record current branch and exact HEAD;
3. record `git status --short`;
4. confirm database availability without mutation;
5. confirm Owner authentication/session still works;
6. inventory any uncommitted changes;
7. stop if the project was reset, replaced, or materially diverged from the preserved state.

## Authorized patch scope

Only the Session test suite may be changed to:

- generate a unique `runId`;
- create unique test user/session/audit identifiers;
- query only records carrying those identifiers;
- use `try/finally` cleanup;
- delete only records created by that test run;
- avoid global table counts and global cleanup;
- preserve live Owner and unrelated sessions/data.

No Production authentication behavior may be changed to make tests pass.

## Forbidden commands and patterns

- `TRUNCATE` on any table;
- unconditional `DELETE FROM sessions`;
- unconditional audit-log deletion;
- database reset, reseed, drop, or migration;
- clearing all cookies/sessions for the project;
- deleting checkpoints, backups, or the project;
- changing secrets or authentication providers;
- pushing to GitHub, opening a PR, deploying, or writing Production without a later isolated gate.

## Verification matrix

Run and record exact results for:

1. Session suite — complete pass required;
2. audit tests;
3. security tests;
4. RBAC tests;
5. typecheck;
6. build;
7. live Owner session preservation;
8. unrelated data preservation;
9. clean or explicitly documented worktree state.

## Acceptance receipt requirements

The final runtime receipt must record:

- before/after branch and HEAD;
- files changed;
- exact test commands and pass counts;
- cleanup evidence scoped to the unique run marker;
- evidence that Owner and unrelated sessions remained;
- whether a local Replit checkpoint/commit was created;
- explicit statement that no GitHub push, PR, merge, deployment, migration, Production write, secret change, or destructive reset occurred.

## Current blocker

Replit account restrictions and suspended services prevent runtime execution. The patch must not be claimed applied or verified until the preserved runtime becomes accessible.

Final state: `OFFLINE_PACKAGE_COMPLETE_RUNTIME_EXECUTION_PENDING_ACCESS`.
