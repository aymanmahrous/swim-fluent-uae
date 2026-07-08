begin;

create table if not exists public.business_settings (
  id text primary key default 'primary' check (id = 'primary'),
  business_name text not null,
  coach_name text not null,
  whatsapp_number text not null check (whatsapp_number ~ '^9715[0-9]{8}$'),
  public_phone text not null,
  public_email text not null,
  booking_price numeric(10,2) not null check (booking_price >= 0),
  currency text not null default 'AED',
  session_duration_minutes integer not null check (session_duration_minutes > 0),
  timezone text not null default 'Asia/Dubai',
  locations text[] not null default '{}',
  booking_enabled boolean not null default true,
  opening_offer_text_ar text,
  opening_offer_text_en text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  website_url text,
  updated_at timestamptz not null default now()
);

insert into public.business_settings (
  id,
  business_name,
  coach_name,
  whatsapp_number,
  public_phone,
  public_email,
  booking_price,
  currency,
  session_duration_minutes,
  timezone,
  locations,
  booking_enabled,
  opening_offer_text_ar,
  opening_offer_text_en,
  website_url
)
values (
  'primary',
  'Relax Fix UAE',
  'Coach Ayman',
  '971551378660',
  '+971 55 137 8660',
  'swimmingayman@gmail.com',
  150,
  'AED',
  45,
  'Asia/Dubai',
  array['Al Muroor','Al Ma''amoor','Al Khalidiya','Al Falah','Electra','Al Reem Island','Yas Island'],
  true,
  'عرض الافتتاح: 150 درهم / 45 دقيقة مع تقييم أولي مجاني',
  'Opening offer: 150 AED / 45 minutes with a free first assessment',
  'https://www.relaxfixuae.com'
)
on conflict (id) do update set
  business_name = excluded.business_name,
  coach_name = excluded.coach_name,
  whatsapp_number = excluded.whatsapp_number,
  public_phone = excluded.public_phone,
  public_email = excluded.public_email,
  booking_price = excluded.booking_price,
  currency = excluded.currency,
  session_duration_minutes = excluded.session_duration_minutes,
  timezone = excluded.timezone,
  locations = excluded.locations,
  booking_enabled = excluded.booking_enabled,
  opening_offer_text_ar = excluded.opening_offer_text_ar,
  opening_offer_text_en = excluded.opening_offer_text_en,
  website_url = excluded.website_url,
  updated_at = now();

alter table public.business_settings enable row level security;

revoke all on table public.business_settings from public, anon, authenticated;
grant select on table public.business_settings to anon, authenticated;

create policy "Public business settings are readable"
on public.business_settings
for select
to anon, authenticated
using (id = 'primary');

commit;
