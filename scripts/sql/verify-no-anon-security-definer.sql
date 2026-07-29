\set ON_ERROR_STOP on

do $$
declare
  v_exposed_functions text;
begin
  select string_agg(
    format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)),
    E'\n'
    order by p.proname, pg_get_function_identity_arguments(p.oid)
  )
  into v_exposed_functions
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prosecdef
    and has_function_privilege('anon', p.oid, 'EXECUTE');

  if v_exposed_functions is not null then
    raise exception 'ANON_SECURITY_DEFINER_EXPOSED:%', E'\n' || v_exposed_functions;
  end if;
end
$$;

select 'no_anon_security_definer_exposure_verified' as result;
