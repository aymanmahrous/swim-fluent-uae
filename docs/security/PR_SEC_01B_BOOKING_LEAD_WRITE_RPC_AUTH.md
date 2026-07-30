# PR-SEC-01B — Booking and Lead Write RPC Authorization

## Scope

This draft is limited to:

- `update_booking_request_status(uuid,text)`
- `update_staff_lead_workflow(uuid,text,boolean,boolean,timestamp with time zone)`
- `set_staff_conversation_mode(uuid,text)`

No content/media RPCs, Auth, RLS, Storage, provider calls, workers, cron, or production execution are included.

## Confirmed findings

1. All three functions are `SECURITY DEFINER`, revoke `anon`, grant `authenticated` and `service_role`, and call `is_active_staff(...)`.
2. Authenticated non-staff and inactive staff are denied by the database helper.
3. API and database role contracts match for booking and lead workflow.
4. `set_staff_conversation_mode` currently allows `coach` in SQL while the API permission map denies `coach`; direct RPC invocation is therefore broader than the supported API contract.
5. UUID lookup is exact and returns `NOT_FOUND`; there is no user-owned object boundary in the current staff-wide operating model. IDOR protection therefore depends on the staff-role boundary rather than per-record ownership.
6. Status, stage, mode, and follow-up time allowlists exist in SQL and API.
7. Existing audit rows record successful writes, but booking and conversation audit details only record the resulting value, not the previous value.
8. Repeating the same booking status or conversation mode creates another update/audit row. Repeating lead workflow can stop and recreate follow-up jobs. Idempotent replay contracts are not currently explicit.
9. Error payloads use stable codes and do not expose SQL text. Authorization raises `STAFF_ACCESS_DENIED` with SQLSTATE `42501`.

## Approved role matrix proposed by this draft

| Role | Booking status | Lead workflow | Conversation mode |
|---|---:|---:|---:|
| anon | deny | deny | deny |
| authenticated non-staff | deny | deny | deny |
| inactive staff | deny | deny | deny |
| content_manager | deny | deny | deny |
| coach | deny | allow | deny |
| reception | allow | allow | allow |
| admin | allow | allow | allow |
| super_admin | allow | allow | allow |
| service_role | deny unless an authenticated staff JWT is deliberately supplied | same | same |

## Repair in this draft

- Align `set_staff_conversation_mode` with the current API contract by removing `coach` from the SQL allowlist.
- Add read-only/static contract checks for exact role lists, ACLs, allowlists, stable error codes, and audit presence.
- Do not expand any PASS classification until disposable role execution is added and succeeds.

## Follow-up required before merge approval

Disposable tests must execute each function under isolated fixtures for every role, including replay/no-op behavior, previous/next audit values, nonexistent UUIDs, invalid values, and follow-up job duplication. Any behavioral migration beyond the role mismatch must remain separately reviewable within this draft and must not run in Production without owner approval.

## Rollback

Revert the PR commit. The migration is append-only and only replaces the function body for `set_staff_conversation_mode`; no table data migration is included.
