begin;

create or replace function public.can_manage_relax_fix_media()
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
      and sp.role in ('super_admin','admin','content_manager')
  );
$$;

revoke all on function public.can_manage_relax_fix_media() from public, anon;
grant execute on function public.can_manage_relax_fix_media() to authenticated, service_role;

drop policy if exists "Active staff can upload own media folder" on storage.objects;
create policy "Active staff can upload own media folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'relax-fix-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.can_manage_relax_fix_media()
);

commit;
