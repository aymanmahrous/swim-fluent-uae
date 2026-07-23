# GOV-F Readiness Report

Document status: CURRENT
Authority: EVIDENCE
Applies to: swim-fluent-uae
Last verified: 2026-07-23 (Asia/Dubai)

## Decision

`GOV-F: COMPLETED — READY FOR GOV-G`

This is a branch-only static hardening decision. No command, Workflow, test, build, audit, browser, migration or external connection ran.

## Completed

1. Reviewed all package declarations statically; no package or lockfile was changed without executed evidence.
2. Archived four active Production-write/AI-spend Workflows by recording their exact blob SHAs in `docs/history/GOV_F_ARCHIVED_PRODUCTION_WRITE_WORKFLOWS.md`, then removed them from `.github/workflows/` on this branch.
3. Active Production verification is now limited to `production-smoke-readonly.yml`; it uses GET/read-only verification and contains no declared write credential.
4. Added browser runtime write blocklist entries to the Write/Workflow Registry.
5. Added `PRODUCTION_HOST_ALLOWLIST.md` allowing only `www.relaxfixuae.com` and `relaxfixuae.com` for HTTPS GET/HEAD.
6. Added `SECRETS_SCOPE_MAP.md`; read-only environments may not contain database, AI, Storage, publishing or webhook write credentials.
7. Kept migrations, AI, media generation, Storage mutation, publishing, scheduling and Production writes frozen or blocked.

## Archived active workflows

- `production-booking-smoke.yml`;
- `ai-media-e2e.yml`;
- `ai-media-current-production-e2e.yml`;
- `ai-media-live-fallback.yml`.

Their exact content remains recoverable from Git history and recorded blob SHAs. Reintroduction requires a new isolated protected PR and separate authorization.

## Limitations

Unused dependencies, committed-secret absence and Workflow behavior were reviewed statically only. GitHub Environment secret inventories were not queried. Disposable, Preview and Production-readonly definitions were not dispatched.

## Safety receipt

Only the governance branch changed. `main`, PR metadata, repository settings, secrets, deployments, Supabase, providers and external accounts remained untouched.

## Transition

GOV-G may begin only after a separate explicit instruction.