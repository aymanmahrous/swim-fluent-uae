#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
MIGRATION="supabase/migrations/20260708_000001b_legacy_campaigns_and_missing_ai_os_tables.sql"
MIGRATIONS_DIR="supabase/migrations"
MIGRATIONS_BACKUP="$(mktemp -d /tmp/relax-fix-campaign-migrations.XXXXXX)"
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

mv "$MIGRATIONS_DIR" "$MIGRATIONS_BACKUP/migrations"
mkdir -p "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=1

supabase db start
DATABASE_RUNNING=1

rm -rf "$MIGRATIONS_DIR"
mv "$MIGRATIONS_BACKUP/migrations" "$MIGRATIONS_DIR"
MIGRATIONS_HIDDEN=0

reset_public_schema() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
drop schema if exists public cascade;
create schema public authorization postgres;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
create extension if not exists pgcrypto;
drop schema if exists migration_test cascade;
create schema migration_test authorization postgres;
create table public.leads (
  id uuid primary key default gen_random_uuid()
);
SQL
}

snapshot_campaign_state() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table migration_test.before_security as
select
  c.relacl::text as relacl,
  c.relrowsecurity,
  c.relforcerowsecurity,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') as anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') as anon_delete,
  has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') as authenticated_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') as authenticated_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'campaigns';

create table migration_test.before_rows as
select count(*)::bigint as row_count
from public.campaigns;
SQL
}

apply_migration_twice() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table migration_test.after_first_rows as
select id, to_jsonb(c) as row_data
from public.campaigns c
order by id;
SQL
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION"
}

assert_common_security_and_idempotency() {
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$
declare
  v_before migration_test.before_security%rowtype;
  v_after record;
  v_before_count bigint;
  v_after_count bigint;
begin
  select * into strict v_before from migration_test.before_security;

  select
    c.relacl::text as relacl,
    c.relrowsecurity,
    c.relforcerowsecurity,
    has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
    has_table_privilege('anon', c.oid, 'INSERT') as anon_insert,
    has_table_privilege('anon', c.oid, 'UPDATE') as anon_update,
    has_table_privilege('anon', c.oid, 'DELETE') as anon_delete,
    has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select,
    has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_insert,
    has_table_privilege('authenticated', c.oid, 'UPDATE') as authenticated_update,
    has_table_privilege('authenticated', c.oid, 'DELETE') as authenticated_delete
  into strict v_after
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'campaigns';

  if v_after.relacl is distinct from v_before.relacl
     or v_after.relforcerowsecurity is distinct from v_before.relforcerowsecurity
     or v_after.anon_select is distinct from v_before.anon_select
     or v_after.anon_insert is distinct from v_before.anon_insert
     or v_after.anon_update is distinct from v_before.anon_update
     or v_after.anon_delete is distinct from v_before.anon_delete
     or v_after.authenticated_select is distinct from v_before.authenticated_select
     or v_after.authenticated_insert is distinct from v_before.authenticated_insert
     or v_after.authenticated_update is distinct from v_before.authenticated_update
     or v_after.authenticated_delete is distinct from v_before.authenticated_delete then
    raise exception 'CAMPAIGNS_SECURITY_OR_GRANTS_CHANGED';
  end if;

  if v_after.relrowsecurity is distinct from true then
    raise exception 'CAMPAIGNS_RLS_NOT_ENABLED';
  end if;

  select row_count into strict v_before_count from migration_test.before_rows;
  select count(*) into v_after_count from public.campaigns;
  if v_after_count <> v_before_count then
    raise exception 'CAMPAIGNS_ROW_COUNT_CHANGED: before %, after %', v_before_count, v_after_count;
  end if;

  if exists (
    (select id, to_jsonb(c) as row_data from public.campaigns c)
    except
    (select id, row_data from migration_test.after_first_rows)
  ) or exists (
    (select id, row_data from migration_test.after_first_rows)
    except
    (select id, to_jsonb(c) as row_data from public.campaigns c)
  ) then
    raise exception 'CAMPAIGNS_SECOND_EXECUTION_CHANGED_ROWS';
  end if;
end
$$;
SQL
}

echo "[1/4] Fresh schema with name and goal only"
reset_public_schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table public.campaigns (
  id uuid primary key,
  name text,
  goal text
);
insert into public.campaigns (id, name, goal) values
  ('10000000-0000-4000-8000-000000000001', 'Valid fresh campaign', 'Valid fresh goal'),
  ('10000000-0000-4000-8000-000000000002', '   ', null);
SQL
snapshot_campaign_state
apply_migration_twice
assert_common_security_and_idempotency
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'campaigns'
      and column_name in ('title', 'type')
  ) then
    raise exception 'FRESH_SCHEMA_GAINED_LEGACY_COLUMNS';
  end if;

  if (select name from public.campaigns where id = '10000000-0000-4000-8000-000000000001') <> 'Valid fresh campaign'
     or (select goal from public.campaigns where id = '10000000-0000-4000-8000-000000000001') <> 'Valid fresh goal' then
    raise exception 'VALID_FRESH_VALUES_CHANGED';
  end if;

  if (select name from public.campaigns where id = '10000000-0000-4000-8000-000000000002') <> 'Legacy campaign'
     or (select goal from public.campaigns where id = '10000000-0000-4000-8000-000000000002') <> 'unspecified' then
    raise exception 'FRESH_FALLBACK_BACKFILL_FAILED';
  end if;
end
$$;
SQL

echo "[2/4] Legacy schema with title and type only"
reset_public_schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table public.campaigns (
  id uuid primary key,
  title text,
  type text
);
insert into public.campaigns (id, title, type) values
  ('20000000-0000-4000-8000-000000000001', 'Legacy title', 'Legacy type'),
  ('20000000-0000-4000-8000-000000000002', null, '   ');
SQL
snapshot_campaign_state
apply_migration_twice
assert_common_security_and_idempotency
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if (select title from public.campaigns where id = '20000000-0000-4000-8000-000000000001') <> 'Legacy title'
     or (select type from public.campaigns where id = '20000000-0000-4000-8000-000000000001') <> 'Legacy type' then
    raise exception 'LEGACY_COLUMNS_CHANGED';
  end if;

  if (select name from public.campaigns where id = '20000000-0000-4000-8000-000000000001') <> 'Legacy title'
     or (select goal from public.campaigns where id = '20000000-0000-4000-8000-000000000001') <> 'Legacy type' then
    raise exception 'LEGACY_BACKFILL_FAILED';
  end if;

  if (select name from public.campaigns where id = '20000000-0000-4000-8000-000000000002') <> 'Legacy campaign'
     or (select goal from public.campaigns where id = '20000000-0000-4000-8000-000000000002') <> 'unspecified' then
    raise exception 'LEGACY_EMPTY_FALLBACK_FAILED';
  end if;
end
$$;
SQL

echo "[3/4] Production-like mixed legacy and current schema"
reset_public_schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table public.campaigns (
  id uuid primary key,
  user_id uuid,
  title text,
  type text,
  prompt text,
  status text default 'draft',
  created_at timestamptz,
  name text,
  goal text,
  audience text,
  starts_on date,
  ends_on date
);
alter table public.campaigns enable row level security;
grant select, insert, update, delete on public.campaigns to anon, authenticated;
insert into public.campaigns (id, title, type, created_at, name, goal) values
  ('30000000-0000-4000-8000-000000000001', 'Legacy replacement title', 'Legacy replacement type', null, '   ', null),
  ('30000000-0000-4000-8000-000000000002', 'Old title must remain', 'Old type must remain', now(), 'Current valid name', 'Current valid goal'),
  ('30000000-0000-4000-8000-000000000003', '   ', 'Type-only fallback', now(), 'Current name only', '');
SQL
snapshot_campaign_state
apply_migration_twice
assert_common_security_and_idempotency
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if (select name from public.campaigns where id = '30000000-0000-4000-8000-000000000001') <> 'Legacy replacement title'
     or (select goal from public.campaigns where id = '30000000-0000-4000-8000-000000000001') <> 'Legacy replacement type'
     or (select created_at from public.campaigns where id = '30000000-0000-4000-8000-000000000001') is null then
    raise exception 'PRODUCTION_LIKE_MISSING_VALUE_BACKFILL_FAILED';
  end if;

  if (select name from public.campaigns where id = '30000000-0000-4000-8000-000000000002') <> 'Current valid name'
     or (select goal from public.campaigns where id = '30000000-0000-4000-8000-000000000002') <> 'Current valid goal'
     or (select title from public.campaigns where id = '30000000-0000-4000-8000-000000000002') <> 'Old title must remain'
     or (select type from public.campaigns where id = '30000000-0000-4000-8000-000000000002') <> 'Old type must remain' then
    raise exception 'PRODUCTION_LIKE_VALID_VALUES_CHANGED';
  end if;

  if (select name from public.campaigns where id = '30000000-0000-4000-8000-000000000003') <> 'Current name only'
     or (select goal from public.campaigns where id = '30000000-0000-4000-8000-000000000003') <> 'Type-only fallback' then
    raise exception 'PRODUCTION_LIKE_MIXED_BACKFILL_FAILED';
  end if;
end
$$;
SQL

echo "[4/4] Empty campaigns table"
reset_public_schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table public.campaigns (
  id uuid primary key,
  name text,
  goal text
);
SQL
snapshot_campaign_state
apply_migration_twice
assert_common_security_and_idempotency
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
do $$
begin
  if exists (select 1 from public.campaigns) then
    raise exception 'EMPTY_CAMPAIGNS_TABLE_GAINED_ROWS';
  end if;
end
$$;
SQL

echo "Campaigns compatibility migration passed fresh, legacy, mixed, empty, security, preservation, and repeat-execution tests."
