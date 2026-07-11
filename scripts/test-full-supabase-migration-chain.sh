#!/usr/bin/env bash
set -euo pipefail

DATABASE_RUNNING=0

cleanup() {
  if [[ "$DATABASE_RUNNING" -eq 1 ]]; then
    supabase stop --no-backup >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Applying the complete repository migration chain from scratch in disposable Supabase..."
supabase db start
DATABASE_RUNNING=1
supabase stop --no-backup
DATABASE_RUNNING=0

echo "Complete repository migration chain applied successfully."
