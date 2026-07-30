#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
MIGRATIONS_DIR="supabase/migrations"
MIGRATIONS_BACKUP="$(mktemp -d /tmp/relax-fix-full-history.XXXXXX)"
DATABASE_RUNNING=0
MIGRATIONS_HIDDEN=0
PHASE_A_FILENAME="20260711003100_international_booking_phone_foundation.sql"
BOOKING_INGRESS_FILENAME="20260729144612_harden_booking_ingress_rpc.sql"
OS_RBAC_FILENAME="20260729221600_restrict_os_rbac_sanitize_errors.sql"
SEC01B_ROLE_FILENAME="20260730213000_sec_01b_align_conversation_mode_role_contract.sql"
SEC01B_IDEMPOTENCY_FILENAME="20260730214500_sec_01b_idempotent_booking_lead_conversation_writes.sql"

cleanup() {
  if [[ "$DATABASE_RUNNING" -eq 1 ]]; then supabase stop --no-backup >/dev/null 2>&1 || true; fi
  if [[ "$MIGRATIONS_HIDDEN" -eq 1 ]]; then
    rm -rf "$MIGRATIONS_DIR"
    mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
  fi
  rm -rf "$MIGRATIONS_BACKUP"
}
trap cleanup EXIT

node scripts/audit-supabase-migration-history.mjs

mv "$MIGRATIONS_DIR" "$MIGRATIONS_BACKUP/migrations"
mkdir -p "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=1
supabase db start
DATABASE_RUNNING=1
rm -rf "$MIGRATIONS_DIR"
mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=0

mapfile -d '' migration_files < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -print0 | LC_ALL=C sort -z)
expected_count=32
for controlled in "$PHASE_A_FILENAME" "$BOOKING_INGRESS_FILENAME" "$OS_RBAC_FILENAME" "$SEC01B_ROLE_FILENAME" "$SEC01B_IDEMPOTENCY_FILENAME"; do
  if [[ -f "$MIGRATIONS_DIR/$controlled" ]]; then expected_count=$((expected_count + 1)); fi
done
if [[ "${#migration_files[@]}" -ne "$expected_count" ]]; then
  echo "Expected $expected_count exact repository SQL files, found ${#migration_files[@]}" >&2
  exit 1
fi

for migration in "${migration_files[@]}"; do
  echo "Applying exact repository migration: ${migration#${MIGRATIONS_DIR}/}"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-fresh-supabase-history.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-no-anon-security-definer.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-authenticated-security-definer-contract.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/inventory-security-definer-functions.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-security-definer-role-contracts.sql

if [[ -f "$MIGRATIONS_DIR/$PHASE_A_FILENAME" && ! -f "$MIGRATIONS_DIR/$BOOKING_INGRESS_FILENAME" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-booking-phone-foundation-readonly.sql
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-booking-phone-foundation-fresh.sql
fi
if [[ -f "$MIGRATIONS_DIR/$BOOKING_INGRESS_FILENAME" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-booking-ingress-hardening.sql
fi
if [[ -f "$MIGRATIONS_DIR/$OS_RBAC_FILENAME" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-os-rbac-sanitized-errors.sql
fi
if [[ -f "$MIGRATIONS_DIR/$SEC01B_ROLE_FILENAME" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-sec-01b-booking-lead-write-contracts.sql
fi
if [[ -f "$MIGRATIONS_DIR/$SEC01B_IDEMPOTENCY_FILENAME" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-sec-01b-disposable-role-replay.sql
fi

supabase stop --no-backup
DATABASE_RUNNING=0

echo "Exact repository Supabase SQL chain and scoped disposable contracts completed."
echo "Validation only; Supabase CLI migration deployment remains blocked by historical version collisions."
