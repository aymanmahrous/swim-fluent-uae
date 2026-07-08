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

revoke all on table public.staff_profiles from anon, authenticated;
grant select on table public.staff_profiles to authenticated;

drop policy if exists "Staff can read own profile" on public.staff_profiles;
create policy "Staff can read own profile"
on public.staff_profiles
for select
to authenticated
using (id = auth.uid() and active = true);

-- Initial staff provisioning is intentionally not performed by migration.
-- An authorized project administrator must explicitly assign the first role.

commit;
