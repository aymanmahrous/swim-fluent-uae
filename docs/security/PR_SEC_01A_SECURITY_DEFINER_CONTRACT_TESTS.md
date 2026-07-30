# PR-SEC-01A — SECURITY DEFINER inventory and disposable contracts

Status: `DRAFT_TEST_TOOLING_ONLY`

## Safety boundary

This scope is limited to read-only inventory SQL, disposable-database contract tests, and documentation.

It does not change function bodies, function grants, RLS, Auth, Storage, schemas, Production data, Production configuration, Workers, Cron, providers, secrets, or environment variables.

The inventory runs only after the repository migration history has been applied to the local Supabase disposable database at `127.0.0.1:54322`. It does not accept a Production project reference or remote database URL.

## Inventory output

`scripts/sql/inventory-security-definer-functions.sql` emits a deterministic, signature-sorted JSON inventory and classification counts for every non-system `SECURITY DEFINER` function.

Recorded fields include:

- schema, function name, identity arguments, and full signature;
- owner, security mode, search path, volatility, arguments, and return type;
- ACL text and effective `PUBLIC`, `anon`, `authenticated`, and `service_role` execution;
- stable definition hash;
- exposed-schema flag;
- UUID and JSON/JSONB argument flags;
- classification.

Classifications are:

- `AUTHENTICATED_RPC`
- `SERVICE_ONLY`
- `INTERNAL_TRIGGER`
- `BOOKING_INGRESS`
- `WORKER_OPERATION`
- `UNCLASSIFIED`

The test fails when any function remains `UNCLASSIFIED`.

## Authorization contract status

The authenticated allowlist remains 23 exact signatures.

Only these two functions are currently marked `VERIFIED` by the role-contract test:

- `get_staff_command_center()`
- `get_staff_operations_queue()`

The remaining 21 authenticated functions remain explicitly `NOT_VERIFIED`. This PR does not infer or change their expected role behavior.

For the two verified functions, the contract checks:

- `anon` execution denied;
- `authenticated` and `service_role` execution retained;
- explicit active Staff role matrix: `super_admin`, `admin`, `reception`, and `coach`;
- `content_manager` excluded;
- coach operational errors replaced with `JOB_FAILED` in `get_staff_operations_queue()`.

The static role checks rely on the existing disposable migration-history fixtures and do not invoke Production RPCs.

## Test command

```bash
bash scripts/test-fresh-supabase-history.sh
```

The command starts and stops the repository's local Supabase database, applies the exact migration history, runs the existing security contracts, generates the inventory, runs the role-contract matrix, and cleans up the disposable database.

## Limitations

- No live Production `pg_proc` extraction is performed.
- Function owner and ACL values are verified from the disposable catalog generated from repository migrations.
- The 21 `NOT_VERIFIED` functions require later function-specific fixtures and owner-approved role decisions.
- Caller references and migration origins remain repository-analysis metadata for a later tooling increment; they are not inferred from Production activity.

## Rollback

Do not merge the Draft PR, or revert its test/tooling commits. No database rollback exists because this scope does not change schema or data.
