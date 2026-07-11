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
DATABASE_RUNNING=0
MIGRATIONS_HIDDEN=0

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

node scripts/audit-supabase-migration-history.mjs

if [[ ! -f "$PHASE_A_PATH" ]]; then
  echo "Missing current Phase A migration: $PHASE_A_PATH" >&2
  exit 1
fi
cp "$PHASE_A_PATH" "$PHASE_A_FILE"

mv "$MIGRATIONS_DIR" "$MIGRATIONS_BACKUP/migrations"
mkdir -p "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=1

supabase db start
DATABASE_RUNNING=1

rm -rf "$MIGRATIONS_DIR"
mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=0

mapfile -d '' migration_files < <(
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' ! -name "$PHASE_A_FILENAME" -print0 | LC_ALL=C sort -z
)

if [[ "${#migration_files[@]}" -ne 32 ]]; then
  echo "Expected 32 exact historical SQL files before Phase A, found ${#migration_files[@]}" >&2
  exit 1
fi

for migration in "${migration_files[@]}"; do
  echo "Applying exact historical repository migration: ${migration#${MIGRATIONS_DIR}/}"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-stacked-phase-a-pre.sql

echo "Applying current Phase A migration from this PR..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$PHASE_A_FILE"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-stacked-phase-a-post.sql

supabase stop --no-backup
DATABASE_RUNNING=0

echo "Current Phase A passed stacked disposable validation over the repaired exact historical SQL chain."
