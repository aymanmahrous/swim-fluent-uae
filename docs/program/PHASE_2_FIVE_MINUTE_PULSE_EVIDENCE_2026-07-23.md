# Phase 2 — Five-Minute Pulse Evidence

Verified: 2026-07-23 (Asia/Dubai)

## Preconditions

- Phase 1 Vercel Production was already verified as READY.
- Vercel project: `swim-fluent-uae-w532`.
- Production reference: `dpl_iWLWWSucJ` from `main` commit `1a9b946`.
- Supabase project: `nmzxrjdxvmmzzmajrskm` (`swim-fluent-uae-app`).

## Vault and scheduler activation

- Vault contains the required scheduler token secret named `relax_fix_content_automation_scheduler_token`.
- No secret value was read into evidence or committed.
- pg_cron job: `relax-fix-content-automation-pulse`.
- Schedule: `*/5 * * * *`.
- pg_cron job was enabled using `cron.alter_job`.
- Scheduler authorization record `content_automation_scheduler_auth.primary` was changed from `active=false` to `active=true` only after Production readiness was confirmed.
- Activation timestamp: `2026-07-23 09:26:52.764674+00`.

## Scheduled pulse evidence

- First live scheduled pulse after scheduler activation:
  - pg_cron run at `2026-07-23 09:30:00+00`.
  - pg_cron status: `succeeded`.
  - HTTP status: `200`.
  - Result code: `CONTENT_AUTOMATION_COMPLETED`.
  - Media attempts/processed: `0/0`.
  - Publish attempts/processed: `0/0`.
  - Human approval remained required.
- Second scheduled pulse at `2026-07-23 09:35:00+00` also completed normally because the lease is released when a short run finishes. This is expected for non-overlapping five-minute runs.

## Lease concurrency verification

Two pulses were dispatched concurrently through the same scheduler dispatch function without changing application code:

- Request `14`: HTTP `200`, result `CONTENT_AUTOMATION_COMPLETED`.
- Request `15`: HTTP `200`, result `AUTOMATION_LEASE_HELD`.
- The held lease reported a lock through `2026-07-23 09:40:22.038751+00`.

This proves the concurrency guard allows one owner and rejects an overlapping second run.

## Queue health

After activation, scheduled runs, and the concurrency test:

- `background_jobs` total rows: `0`.
- Non-terminal rows: `0`.
- Oldest non-terminal row: none.
- No queue buildup was observed.

## Safety

- No media was generated.
- No content was published.
- No real message, booking, email, Calendar write, Ads, billing, or spend occurred.
- No Vault secret value was exposed.
- No Phase 3 work was started.
