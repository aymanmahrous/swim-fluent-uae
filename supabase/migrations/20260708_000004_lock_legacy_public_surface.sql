begin;

-- Production's legacy schema contains this helper, while the Fresh foundation does not.
-- Harden it when present without inventing a compatibility stub solely for Fresh installs.
do $rls_helper_hardening$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
    execute 'grant execute on function public.rls_auto_enable() to service_role';
  end if;
end;
$rls_helper_hardening$;

drop policy if exists "aymanmahrous's Org" on public.leads;
revoke all on table public.leads from anon, authenticated;

commit;
