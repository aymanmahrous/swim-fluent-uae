begin;

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 120),
  role text not null check (role in ('super_admin', 'admin', 'reception', 'coach', 'content_manager')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

revoke all on table public.staff_profiles from anon, authenticated;
grant select on table public.staff_profiles to authenticated;

create or replace function public.is_active_staff(allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = auth.uid()
      and sp.active = true
      and (allowed_roles is null or sp.role = any(allowed_roles))
  );
$$;

revoke all on function public.is_active_staff(text[]) from public, anon;
grant execute on function public.is_active_staff(text[]) to authenticated, service_role;

drop policy if exists "Staff can read own profile" on public.staff_profiles;
create policy "Staff can read own profile"
on public.staff_profiles
for select
to authenticated
using (id = auth.uid() and active = true);

insert into public.staff_profiles (id, display_name, role, active)
select u.id, 'Coach Ayman', 'super_admin', true
from auth.users u
where lower(u.email) = lower('swimmingayman@gmail.com')
  and u.email_confirmed_at is not null
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    active = true,
    updated_at = now();

revoke all on table public.booking_requests from anon, authenticated;
grant select, update on table public.booking_requests to authenticated;

drop policy if exists "Active staff can read booking requests" on public.booking_requests;
create policy "Active staff can read booking requests"
on public.booking_requests
for select
to authenticated
using (public.is_active_staff(array['super_admin','admin','reception','coach']));

drop policy if exists "Booking operators can update booking requests" on public.booking_requests;
create policy "Booking operators can update booking requests"
on public.booking_requests
for update
to authenticated
using (public.is_active_staff(array['super_admin','admin','reception']))
with check (public.is_active_staff(array['super_admin','admin','reception']));

grant update on table public.business_settings to authenticated;
drop policy if exists "Admins can update business settings" on public.business_settings;
create policy "Admins can update business settings"
on public.business_settings
for update
to authenticated
using (public.is_active_staff(array['super_admin','admin']))
with check (id = 'primary' and public.is_active_staff(array['super_admin','admin']));

-- AI OS tables are deny-by-default to anon and visible only to approved active staff.
do $$
declare
  table_name text;
  os_tables text[] := array[
    'leads', 'conversations', 'messages', 'follow_up_jobs', 'brand_brain',
    'knowledge_entries', 'campaigns', 'content_items', 'media_assets',
    'background_jobs', 'webhook_events', 'content_metrics', 'audit_logs'
  ];
begin
  foreach table_name in array os_tables loop
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select on table public.%I to authenticated', table_name);
    execute format('drop policy if exists %L on public.%I', 'Active staff can read ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_active_staff(null))',
      'Active staff can read ' || table_name,
      table_name
    );
  end loop;
end
$$;

-- CRM/inbox operations.
grant insert, update on table public.leads, public.conversations, public.messages, public.follow_up_jobs to authenticated;

create policy "CRM staff can create leads"
on public.leads for insert to authenticated
with check (public.is_active_staff(array['super_admin','admin','reception']));
create policy "CRM staff can update leads"
on public.leads for update to authenticated
using (public.is_active_staff(array['super_admin','admin','reception']))
with check (public.is_active_staff(array['super_admin','admin','reception']));

create policy "Inbox staff can create conversations"
on public.conversations for insert to authenticated
with check (public.is_active_staff(array['super_admin','admin','reception']));
create policy "Inbox staff can update conversations"
on public.conversations for update to authenticated
using (public.is_active_staff(array['super_admin','admin','reception']))
with check (public.is_active_staff(array['super_admin','admin','reception']));

create policy "Inbox staff can create messages"
on public.messages for insert to authenticated
with check (public.is_active_staff(array['super_admin','admin','reception']));

create policy "CRM staff can create follow ups"
on public.follow_up_jobs for insert to authenticated
with check (public.is_active_staff(array['super_admin','admin','reception']));
create policy "CRM staff can update follow ups"
on public.follow_up_jobs for update to authenticated
using (public.is_active_staff(array['super_admin','admin','reception']))
with check (public.is_active_staff(array['super_admin','admin','reception']));

-- Content and brand operations.
grant insert, update on table public.brand_brain, public.knowledge_entries, public.campaigns, public.content_items, public.media_assets to authenticated;

create policy "Content staff can manage brand brain"
on public.brand_brain for all to authenticated
using (public.is_active_staff(array['super_admin','admin','content_manager']))
with check (public.is_active_staff(array['super_admin','admin','content_manager']));

create policy "Content staff can manage knowledge"
on public.knowledge_entries for all to authenticated
using (public.is_active_staff(array['super_admin','admin','content_manager']))
with check (public.is_active_staff(array['super_admin','admin','content_manager']));

create policy "Content staff can manage campaigns"
on public.campaigns for all to authenticated
using (public.is_active_staff(array['super_admin','admin','content_manager']))
with check (public.is_active_staff(array['super_admin','admin','content_manager']));

create policy "Content staff can manage content items"
on public.content_items for all to authenticated
using (public.is_active_staff(array['super_admin','admin','content_manager']))
with check (public.is_active_staff(array['super_admin','admin','content_manager']));

create policy "Content staff can manage media assets"
on public.media_assets for all to authenticated
using (public.is_active_staff(array['super_admin','admin','content_manager']))
with check (public.is_active_staff(array['super_admin','admin','content_manager']));

commit;
