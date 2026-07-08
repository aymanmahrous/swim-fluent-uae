begin;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;

drop policy if exists "aymanmahrous's Org" on public.leads;
revoke all on table public.leads from anon, authenticated;

commit;
