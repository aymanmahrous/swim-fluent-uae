#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
MIGRATIONS_DIR="supabase/migrations"
MIGRATIONS_BACKUP="$(mktemp -d /tmp/relax-fix-stacked-phase-a.XXXXXX)"
PHASE_A_FILENAME="20260711003100_international_booking_phone_foundation.sql"
PHASE_A_PATH="$MIGRATIONS_DIR/$PHASE_A_FILENAME"
PHASE_A_FILE="$(mktemp /tmp/phase-a-foundation.XXXXXX.sql)"
EXPECTED_PRE_PHASE_A_COUNT=32
POST_PHASE_A_FILENAMES=(
  "20260729144612_harden_booking_ingress_rpc.sql"
  "20260729221600_restrict_os_rbac_sanitize_errors.sql"
  "20260730213000_sec_01b_align_conversation_mode_role_contract.sql"
  "20260730214500_sec_01b_idempotent_booking_lead_conversation_writes.sql"
)
DATABASE_RUNNING=0
MIGRATIONS_HIDDEN=0

declare -A APPLIED_MIGRATIONS=()

cleanup() {
  if [[ "$DATABASE_RUNNING" -eq 1 ]]; then
    supabase stop --no-backup >/dev/null 2>&1 || true
  fi
  if [[ "$MIGRATIONS_HIDDEN" -eq 1 ]]; then
    rm -rf "$MIGRATIONS_DIR"
    mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
  fi
  rm -rf "$MIGRATIONS_BACKUP"
  rm -f "$PHASE_A_FILE"
}
trap cleanup EXIT

apply_migration_once() {
  local migration_path="$1"
  local migration_name="${migration_path#${MIGRATIONS_DIR}/}"

  if [[ -n "${APPLIED_MIGRATIONS[$migration_name]:-}" ]]; then
    echo "Migration would be applied more than once: $migration_name" >&2
    exit 1
  fi

  echo "Applying repository migration: $migration_name"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration_path"
  APPLIED_MIGRATIONS[$migration_name]=1
}

# The central audit owns the approved duplicate-version inventory and exact filename/version contracts.
node scripts/audit-supabase-migration-history.mjs

if [[ ! -f "$PHASE_A_PATH" ]]; then
  echo "Missing pinned Phase A migration: $PHASE_A_PATH" >&2
  exit 1
fi
cp "$PHASE_A_PATH" "$PHASE_A_FILE"

for filename in "${POST_PHASE_A_FILENAMES[@]}"; do
  if [[ ! -f "$MIGRATIONS_DIR/$filename" ]]; then
    echo "Missing required post-Phase-A migration: $filename" >&2
    exit 1
  fi
done

if [[ "${POST_PHASE_A_FILENAMES[2]}" != "20260730213000_sec_01b_align_conversation_mode_role_contract.sql" \
   || "${POST_PHASE_A_FILENAMES[3]}" != "20260730214500_sec_01b_idempotent_booking_lead_conversation_writes.sql" ]]; then
  echo "SEC-01B role migration must precede the idempotency migration" >&2
  exit 1
fi

mapfile -d '' all_migration_files < <(
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -print0 | LC_ALL=C sort -z
)

mapfile -d '' pre_phase_a_history < <(
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' \
    ! -name "$PHASE_A_FILENAME" \
    ! -name "${POST_PHASE_A_FILENAMES[0]}" \
    ! -name "${POST_PHASE_A_FILENAMES[1]}" \
    ! -name "${POST_PHASE_A_FILENAMES[2]}" \
    ! -name "${POST_PHASE_A_FILENAMES[3]}" \
    -print0 | LC_ALL=C sort -z
)

if [[ "${#pre_phase_a_history[@]}" -ne "$EXPECTED_PRE_PHASE_A_COUNT" ]]; then
  echo "Expected $EXPECTED_PRE_PHASE_A_COUNT exact historical SQL files before Phase A, found ${#pre_phase_a_history[@]}" >&2
  exit 1
fi

expected_total=$((EXPECTED_PRE_PHASE_A_COUNT + 1 + ${#POST_PHASE_A_FILENAMES[@]}))
if [[ "${#all_migration_files[@]}" -ne "$expected_total" ]]; then
  echo "Migration partition is incomplete: expected $expected_total total files, found ${#all_migration_files[@]}" >&2
  exit 1
fi

mv "$MIGRATIONS_DIR" "$MIGRATIONS_BACKUP/migrations"
mkdir -p "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=1

supabase db start
DATABASE_RUNNING=1

rm -rf "$MIGRATIONS_DIR"
mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=0

printf '%s\n' "PRE_PHASE_A_HISTORY (${#pre_phase_a_history[@]} files)"
for migration in "${pre_phase_a_history[@]}"; do
  apply_migration_once "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-stacked-phase-a-pre.sql

printf '%s\n' "PINNED_PHASE_A ($PHASE_A_FILENAME)"
apply_migration_once "$PHASE_A_PATH"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-stacked-phase-a-post.sql

printf '%s\n' "POST_PHASE_A_MIGRATIONS (${#POST_PHASE_A_FILENAMES[@]} files)"
for filename in "${POST_PHASE_A_FILENAMES[@]}"; do
  apply_migration_once "$MIGRATIONS_DIR/$filename"
done

if [[ "${#APPLIED_MIGRATIONS[@]}" -ne "$expected_total" ]]; then
  echo "Expected $expected_total migrations to be applied exactly once, applied ${#APPLIED_MIGRATIONS[@]}" >&2
  exit 1
fi

for migration in "${all_migration_files[@]}"; do
  filename="${migration#${MIGRATIONS_DIR}/}"
  if [[ -z "${APPLIED_MIGRATIONS[$filename]:-}" ]]; then
    echo "Migration was not applied by the stacked Phase A partition: $filename" >&2
    exit 1
  fi
done

supabase stop --no-backup
DATABASE_RUNNING=0

echo "Pinned Phase A and all post-Phase-A migrations passed ordered stacked disposable validation."