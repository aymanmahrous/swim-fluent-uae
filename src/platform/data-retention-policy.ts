// Owner-approved data retention decision (Issue #59 / PRIVACY_ANALYTICS_OWNER_DECISION_PACK D07/D08),
// recorded 2026-08-21. This module documents the policy value only — it does not implement
// automated deletion. No cron/job exists yet; building one is out of scope for this change
// and is tracked as a separate follow-up (BLOCKED: requires new backend infrastructure).
export const BOOKING_RECORD_RETENTION_MONTHS = 12;
export const COMMUNICATIONS_RECORD_RETENTION_MONTHS = 12;
