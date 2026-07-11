# Supabase migration history audit

Status: **MIGRATION_VERSION_STRATEGY_BLOCKED for Production deployment**

This audit was performed read-only before changing the campaigns compatibility SQL. No Production migration, history repair, rename, deletion, or data write was performed.

## Parsing rule observed

Supabase CLI 2.84.2 treats the text before the first underscore as the migration version. Therefore files beginning with `20260708_...` all parse as version `20260708`, regardless of the later sequence token.

Repository lexical execution order is the full filename order shown below. This order is used only by the disposable validation runner, which executes each exact SQL file through `psql`. It is not presented as a `supabase db push` strategy.

Production currently records 36 distinct 14-digit timestamp versions, such as `20260708035927`, rather than repository prefixes `20260708`, `20260709`, or `20260710`. No exact repository parsed prefix is registered as a Production migration version. The `recorded in Production` column below indicates whether a matching logical migration name was found; `UNKNOWN` means schema effects may exist but there is no direct one-to-one history record.

| filename | parsed migration version | duplicate version | recorded in Production | safe to edit | safe to rename |
|---|---:|:---:|:---:|:---:|:---:|
| `20260708_000001_relax_fix_ai_os_foundation.sql` | `20260708` | YES | UNKNOWN | REQUIRES APPROVAL | NO |
| `20260708_000001b_legacy_campaigns_and_missing_ai_os_tables.sql` | `20260708` | YES | UNKNOWN | YES | NO |
| `20260708_000002_public_booking_requests.sql` | `20260708` | YES | UNKNOWN | REQUIRES APPROVAL | NO |
| `20260708_000002b_booking_request_compatibility_and_concurrency.sql` | `20260708` | YES | UNKNOWN | REQUIRES APPROVAL | NO |
| `20260708_000003_business_settings.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000004_lock_legacy_public_surface.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000005_add_foundation_foreign_key_indexes.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000006_harden_public_booking_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000007_add_staff_auth_rbac.sql` | `20260708` | YES | UNKNOWN | REQUIRES APPROVAL | NO |
| `20260708_000008_add_staff_booking_rpcs.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000009_make_staff_helper_internal.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000010_add_staff_crm_read_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000011_add_staff_inbox_read_rpcs.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000012_add_staff_conversation_mode_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000013_add_staff_generated_content_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000014_add_staff_os_read_models.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000015_add_staff_operations_media_read_models.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000016_add_staff_content_review_schedule_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000017_add_publish_worker_rpcs.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000018_add_staff_content_edit_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000019_add_staff_crm_workflow_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000020_add_ai_media_generation_storage.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000021_fix_ai_media_storage_policy.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000022_add_staff_video_generation_jobs_read_rpc.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260708_000023_harden_public_booking_ingress.sql` | `20260708` | YES | YES | REQUIRES APPROVAL | NO |
| `20260709_000024_harden_ai_media_ownership.sql` | `20260709` | NO | UNKNOWN | REQUIRES APPROVAL | NO |
| `20260710_000025_content_brain_three_daily.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |
| `20260710_000026_add_publication_receipts.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |
| `20260710_000027_content_media_worker_queue.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |
| `20260710_000028_retry_terminal_video_generation_with_new_provider_job.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |
| `20260710_000029_content_automation_scheduler.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |
| `20260710_000030_supabase_content_automation_pulse.sql` | `20260710` | YES | YES | REQUIRES APPROVAL | NO |

## Production history differences

- Production has no exact migration versions `20260708`, `20260709`, or `20260710`.
- Production records many matching logical migrations under separate 14-digit timestamps.
- The foundation, campaigns compatibility, initial booking, and booking compatibility files have no direct one-to-one Production history entry.
- The repository ownership hardening migration combines changes represented by several split Production history records.
- Whether unrecorded repository files were applied manually, generated from an earlier baseline, or reconstructed later cannot be established safely from the migration table alone.
- No Production history mutation is permitted without a separately approved mapping and reconciliation plan.

## Strategy comparison

| option | Production impact | Fresh installs | `supabase db push` | `migration list` | schema drift risk | rollback | Production history change | approval |
|---|---|---|---|---|---|---|---|---|
| **A — preserve files; execute exact SQL by full filename in disposable validation** | None | Verifies the real SQL and ordering, but is not a supported deployment path | BLOCKED by parsed-version collisions/history mismatch | Continues to show mismatch or collisions | Low for SQL verification; deployment drift remains unresolved | Delete disposable DB | No | Not needed for CI; required before adopting any deployment process |
| **B — official Fresh-install baseline with legacy upgrade history retained separately** | None if the baseline is never pushed to the existing project | Clean and deterministic after an authoritative schema baseline is reviewed | Requires explicit configuration separating fresh baseline from existing upgrade path | Becomes bifurcated and must be documented | Medium until baseline is compared against Production and exact history | Replace baseline before release; does not roll back Production | Not necessarily, if strictly fresh-only | REQUIRES APPROVAL |
| **C — renumber historical files with mapping and future repair** | High risk of reapplying existing changes | Could make CLI ordering valid | Dangerous until every Production record is mapped/repaired | Changes all local versions | High | Difficult; renames and repaired history must move together | Yes | REQUIRES APPROVAL and forbidden in this PR |
| **D — Supabase squash/baseline plus history reconciliation** | Depends on authoritative reconciliation; may require repair/linking | Good after a verified squash point | Safe only after remote history is reconciled | Replaced by squash-point history | Medium to high before full schema diff | Forward correction or restore from backup | Usually yes for an existing linked project | REQUIRES APPROVAL |

## Decision

- Implement Option A for CI/disposable verification only.
- Keep every historical filename unchanged.
- Execute the exact repository SQL files in deterministic full-filename lexical order.
- Do not insert synthetic rows into `supabase_migrations.schema_migrations`.
- Do not call `supabase migration repair`.
- Keep Production `db push`, normal migration-list alignment, renumbering, and baseline adoption **BLOCKED**.

This PR fixes only the column-aware campaigns compatibility defect. It does not claim that Production migration history has been reconciled.
