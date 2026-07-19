# Session Test Isolation Patch Specification V1 — 2026-07-19

Status: `SESSION_TEST_ISOLATION_PATCH_READY_RUNTIME_VALIDATION_PENDING`

## Confirmed context

- Replit OIDC and Owner session were previously verified.
- Audit actor identity was corrected to `userId:role` with anonymous fallback.
- Audit, security, RBAC, typecheck, and build suites previously passed.
- Session suite remained partially failing because tests depended on shared live-state assumptions.
- Replit runtime and database are currently unavailable due account restriction.

## Objective

Make session tests isolated, deterministic, and non-destructive without modifying Production authentication behavior or deleting live Owner/session/audit records.

## Required test pattern

For each test or test group create:

- `runId = crypto.randomUUID()`;
- unique test user ID/name containing `runId`;
- unique test session ID containing `runId`;
- unique audit marker containing `runId`;
- explicit created-record registry for cleanup.

## Assertions

Tests must query by their unique identifiers. They must not assert global table emptiness or fixed total counts.

Replace unsafe assertions such as:

- `COUNT(*) = 0` for all sessions;
- first/last row assumptions;
- fixed sequential ID assumptions;
- expectation that no other Owner or audit records exist.

With scoped assertions such as:

- session with the generated ID exists or is removed as expected;
- audit rows containing the generated marker match the expected count;
- unrelated pre-existing sessions remain unchanged;
- owner session identifier observed before the test still exists after cleanup when the test environment exposes it.

## Cleanup contract

Use `try/finally` for every test that creates records.

Cleanup order:

1. delete only test session rows matching `runId`;
2. delete only test role/membership rows matching the test user;
3. delete only the test user;
4. delete only audit rows containing the test marker when test policy permits;
5. verify scoped test rows equal zero.

Cleanup must never execute unbounded statements against sessions, users, roles, audit logs, or global tables.

## Transaction strategy

Preferred order:

1. use per-test transaction rollback when application/session semantics remain testable;
2. otherwise use unique records plus scoped cleanup;
3. never truncate shared tables;
4. never restart or reset the database as part of the suite.

## Concurrency

Tests must remain safe under parallel execution:

- no shared static usernames or session IDs;
- no shared mutable global fixture;
- no reliance on execution order;
- bounded polling for asynchronous persistence;
- deterministic cleanup even after assertion failure.

## Minimum verification matrix when runtime returns

1. run the session suite alone twice consecutively;
2. run it with the live Owner session present;
3. run security and RBAC suites afterward;
4. run full audit suite;
5. run typecheck and build;
6. compare pre/post counts and confirm no unrelated deletion;
7. confirm actor format remains `userId:role`;
8. produce a runtime acceptance receipt with exact commands, timestamps, pass counts, and HEAD.

## Acceptance target

- session tests: `19/19 PASS` or the then-current complete suite count;
- no live Owner/session deletion;
- no unbounded cleanup;
- all previously passing security/RBAC/audit/typecheck/build checks remain passing;
- working tree clean after the isolated test-only patch;
- no GitHub push, PR, merge, or deployment without the separately stated gate.

## Explicit exclusions

This specification does not authorize database reset, Production change, authentication weakening, global cleanup, secret change, deployment, migration, billing action, or Replit project recreation.