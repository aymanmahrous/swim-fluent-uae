-- Compatibility patch for the existing production campaigns table and the partially-applied AI OS foundation.
-- Preserves all legacy campaigns columns and rows.

begin;

create extension if not exists pgcrypto;

do $$ begin
  create type public.channel_type as enum ('instagram','facebook','whatsapp','website');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.conversation_mode as enum ('ai_active','human_takeover','human_required','paused');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.content_status as enum ('idea','draft','generated','needs_review','approved','scheduled','published','failed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.job_status as enum ('queued','processing','completed','failed','retrying','dead');
exception when duplicate_object then null; end $$;

alter table public.campaigns add column if not exists name text;
alter table public.campaigns add column if not exists goal text;
alter table public.campaigns add column if not exists audience text;
alter table public.campaigns add column if not exists starts_on date;
alter table public.campaigns add column if not exists ends_on date;
alter table public.campaigns add column if not exists created_at timestamptz default now();

-- Preserve legacy title/type semantics only when those optional columns exist.
-- Dynamic SQL prevents PostgreSQL from resolving absent legacy columns during parse time.
do $campaign_name_backfill$
declare
  v_has_title boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'campaigns'
      and column_name = 'title'
  ) into v_has_title;

  if v_has_title then
    execute $sql$
      update public.campaigns
      set name = nullif(btrim(title), '')
      where (name is null or btrim(name) = '')
        and nullif(btrim(title), '') is not null
    $sql$;
  end if;

  update public.campaigns
  set name = 'Legacy campaign'
  where name is null or btrim(name) = '';
end;
$campaign_name_backfill$;

do $campaign_goal_backfill$
declare
  v_has_type boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'campaigns'
      and column_name = 'type'
  ) into v_has_type;

  if v_has_type then
    execute $sql$
      update public.campaigns
      set goal = nullif(btrim(type), '')
      where (goal is null or btrim(goal) = '')
        and nullif(btrim(type), '') is not null
    $sql$;
  end if;

  update public.campaigns
  set goal = 'unspecified'
  where goal is null or btrim(goal) = '';
end;
$campaign_goal_backfill$;

update public.campaigns
set created_at = now()
where created_at is null;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel public.channel_type not null,
  external_thread_id text,
  mode public.conversation_mode not null default 'ai_active',
  unread_count integer not null default 0 check (unread_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(channel, external_thread_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  external_message_id text,
  direction text not null check (direction in ('inbound','outbound')),
  author_type text not null check (author_type in ('customer','ai','human','system')),
  body text not null,
  safety_classification text,
  created_at timestamptz not null default now(),
  unique(conversation_id, external_message_id)
);

create table if not exists public.follow_up_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  attempt_number integer not null check (attempt_number between 1 and 3),
  scheduled_for timestamptz not null,
  status public.job_status not null default 'queued',
  stopped_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_brain (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text,
  content text not null,
  language text not null default 'ar' check (language in ('ar','en')),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  scheduled_for timestamptz,
  platform text not null check (platform in ('instagram','facebook','tiktok')),
  content_type text not null,
  topic text,
  hook text,
  caption text,
  cta text,
  hashtags text[] not null default '{}',
  visual_prompt text,
  status public.content_status not null default 'draft',
  provider_external_id text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete set null,
  asset_type text not null check (asset_type in ('image','video','logo','other')),
  source text not null check (source in ('upload','ai_generated','external')),
  storage_path text,
  provider text,
  provider_job_id text,
  prompt text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.background_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status public.job_status not null default 'queued',
  payload jsonb not null default '{}',
  result jsonb,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_retry_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table if not exists public.content_metrics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  views bigint not null default 0,
  reach bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  saves bigint not null default 0,
  shares bigint not null default 0,
  dm_count bigint not null default 0,
  leads_count bigint not null default 0,
  bookings_count bigint not null default 0,
  revenue_aed numeric(12,2) not null default 0
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_type text not null check (actor_type in ('user','ai','system','provider')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.campaigns enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.follow_up_jobs enable row level security;
alter table public.brand_brain enable row level security;
alter table public.knowledge_entries enable row level security;
alter table public.content_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.background_jobs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.content_metrics enable row level security;
alter table public.audit_logs enable row level security;

commit;
