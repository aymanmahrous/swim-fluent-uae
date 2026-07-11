#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
MIGRATIONS_DIR="supabase/migrations"
MIGRATIONS_BACKUP="$(mktemp -d /tmp/relax-fix-full-history.XXXXXX)"
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

mapfile -d '' migration_files < <(
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -print0 | LC_ALL=C sort -z
)

if [[ "${#migration_files[@]}" -ne 32 ]]; then
  echo "Expected 32 exact historical SQL files, found ${#migration_files[@]}" >&2
  exit 1
fi

for migration in "${migration_files[@]}"; do
  echo "Applying exact repository migration: ${migration#${MIGRATIONS_DIR}/}"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/verify-fresh-supabase-history.sql

supabase stop --no-backup
DATABASE_RUNNING=0

echo "Exact historical Supabase SQL chain completed in full-filename lexical order on a disposable database."
echo "This is a validation strategy only; Supabase CLI migration deployment remains blocked by historical version collisions."
