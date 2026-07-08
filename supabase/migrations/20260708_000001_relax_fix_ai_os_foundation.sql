-- Relax Fix AI OS foundation
-- Compatibility-safe for the existing production schema.
-- Preserves the legacy public.leads columns and rows.

create extension if not exists pgcrypto;

do $$ begin
  create type public.lead_stage as enum ('new','contacted','qualified','booking_intent','booked','follow_up','lost','customer');
exception when duplicate_object then null; end $$;
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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  service text,
  message text,
  created_at timestamptz default now()
);

alter table public.leads add column if not exists full_name text;
alter table public.leads add column if not exists normalized_phone text;
alter table public.leads add column if not exists language text default 'ar';
alter table public.leads add column if not exists stage public.lead_stage default 'new';
alter table public.leads add column if not exists score integer default 0;
alter table public.leads add column if not exists intent text;
alter table public.leads add column if not exists fear_of_water boolean;
alter table public.leads add column if not exists source_channel public.channel_type default 'website';
alter table public.leads add column if not exists do_not_contact boolean default false;
alter table public.leads add column if not exists human_required boolean default false;
alter table public.leads add column if not exists next_follow_up_at timestamptz;
alter table public.leads add column if not exists updated_at timestamptz default now();

update public.leads
set full_name = coalesce(nullif(btrim(full_name), ''), nullif(btrim(name), ''), 'Legacy lead')
where full_name is null or btrim(full_name) = '';

update public.leads
set language = coalesce(language, 'ar'),
    stage = coalesce(stage, 'new'),
    score = coalesce(score, 0),
    source_channel = coalesce(source_channel, 'website'),
    do_not_contact = coalesce(do_not_contact, false),
    human_required = coalesce(human_required, false),
    updated_at = coalesce(updated_at, created_at, now());

-- Only normalize clearly valid UAE mobile numbers. Legacy/test numbers stay NULL.
update public.leads
set normalized_phone = case
  when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') ~ '^(00971|971|0)?5[0-9]{8}$' then
    '971' || regexp_replace(
      regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'),
      '^(00971|971|0)',
      ''
    )
  else null
end
where normalized_phone is null;

alter table public.leads alter column full_name set not null;
alter table public.leads alter column language set default 'ar';
alter table public.leads alter column language set not null;
alter table public.leads alter column stage set default 'new';
alter table public.leads alter column stage set not null;
alter table public.leads alter column score set default 0;
alter table public.leads alter column score set not null;
alter table public.leads alter column source_channel set default 'website';
alter table public.leads alter column source_channel set not null;
alter table public.leads alter column do_not_contact set default false;
alter table public.leads alter column do_not_contact set not null;
alter table public.leads alter column human_required set default false;
alter table public.leads alter column human_required set not null;
alter table public.leads alter column updated_at set default now();
alter table public.leads alter column updated_at set not null;

create index if not exists leads_normalized_phone_idx
  on public.leads(normalized_phone)
  where normalized_phone is not null;
create index if not exists leads_priority_idx
  on public.leads(human_required desc, score desc, updated_at desc);

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

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  goal text not null,
  audience text,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
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
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.follow_up_jobs enable row level security;
alter table public.brand_brain enable row level security;
alter table public.knowledge_entries enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.background_jobs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.content_metrics enable row level security;
alter table public.audit_logs enable row level security;

-- Legacy columns (name/service/message) are intentionally preserved.
-- No permissive client policies are created here intentionally.
