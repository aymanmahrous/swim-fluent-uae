#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
MIGRATIONS_DIR="supabase/migrations"
BACKUP_DIR="$(mktemp -d /tmp/booking-phone-migrations.XXXXXX)"
DATABASE_RUNNING=0
MIGRATIONS_STAGED=0

FOUNDATION_SOURCE="20260711003100_international_booking_phone_foundation.sql"
FOUNDATION_STAGED="20260711003100_international_booking_phone_foundation.sql"
BOOKING_MIGRATIONS=(
  "20260708_000002_public_booking_requests.sql:20260708000002_public_booking_requests.sql"
  "20260708_000002b_booking_request_compatibility_and_concurrency.sql:20260708000003_booking_request_compatibility_and_concurrency.sql"
  "20260708_000003_business_settings.sql:20260708000004_business_settings.sql"
  "20260708_000006_harden_public_booking_rpc.sql:20260708000006_harden_public_booking_rpc.sql"
  "20260708_000023_harden_public_booking_ingress.sql:20260708000023_harden_public_booking_ingress.sql"
)

cleanup() {
  if [[ "$DATABASE_RUNNING" -eq 1 ]]; then
    supabase stop --no-backup >/dev/null 2>&1 || true
  fi
  if [[ "$MIGRATIONS_STAGED" -eq 1 ]]; then
    rm -rf "$MIGRATIONS_DIR"
    mkdir -p "$MIGRATIONS_DIR"
    cp -a "$BACKUP_DIR"/. "$MIGRATIONS_DIR"/
  fi
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

cp -a "$MIGRATIONS_DIR"/. "$BACKUP_DIR"/
rm -rf "$MIGRATIONS_DIR"
mkdir -p "$MIGRATIONS_DIR"
MIGRATIONS_STAGED=1

for mapping in "${BOOKING_MIGRATIONS[@]}"; do
  source_name="${mapping%%:*}"
  staged_name="${mapping#*:}"
  if [[ ! -f "$BACKUP_DIR/$source_name" ]]; then
    echo "Missing required booking migration: $source_name" >&2
    exit 1
  fi
  cp "$BACKUP_DIR/$source_name" "$MIGRATIONS_DIR/$staged_name"
done

if [[ ! -f "$BACKUP_DIR/$FOUNDATION_SOURCE" ]]; then
  echo "Missing Phase A migration: $FOUNDATION_SOURCE" >&2
  exit 1
fi

echo "[1/2] Applying the current booking migration chain without Phase A..."
supabase db start
DATABASE_RUNNING=1

psql "$DATABASE_URL" -f scripts/sql/verify-booking-phone-pre-foundation.sql

echo "Applying Phase A over the current booking schema..."
psql "$DATABASE_URL" -f "$BACKUP_DIR/$FOUNDATION_SOURCE"
psql "$DATABASE_URL" -f scripts/sql/verify-booking-phone-foundation-readonly.sql
psql "$DATABASE_URL" -f scripts/sql/verify-booking-phone-foundation.sql

supabase stop --no-backup
DATABASE_RUNNING=0

cp "$BACKUP_DIR/$FOUNDATION_SOURCE" "$MIGRATIONS_DIR/$FOUNDATION_STAGED"

echo "[2/2] Applying the complete booking migration chain including Phase A from scratch..."
supabase db start
DATABASE_RUNNING=1
psql "$DATABASE_URL" -f scripts/sql/verify-booking-phone-foundation-readonly.sql
psql "$DATABASE_URL" -f scripts/sql/verify-booking-phone-foundation-fresh.sql

supabase stop --no-backup
DATABASE_RUNNING=0

echo "Booking phone foundation passed staged, fresh-booking-chain, executable, and read-only verification."
