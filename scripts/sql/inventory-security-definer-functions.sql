\set ON_ERROR_STOP on

begin read only;

create temporary table security_definer_inventory on commit drop as
with functions as (
  select
    p.oid,
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as identity_arguments,
    format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as full_signature,
    owner_role.rolname as owner,
    case when p.prosecdef then 'DEFINER' else 'INVOKER' end as security_mode,
    coalesce((select string_agg(cfg, ', ' order by cfg) from unnest(coalesce(p.proconfig, '{}'::text[])) cfg where cfg like 'search_path=%'), '') as search_path,
    case p.provolatile when 'i' then 'IMMUTABLE' when 's' then 'STABLE' else 'VOLATILE' end as volatility,
    pg_get_function_arguments(p.oid) as argument_types,
    pg_get_function_result(p.oid) as return_type,
    coalesce(array_to_string(p.proacl, ','), '') as execute_acl,
    has_function_privilege('PUBLIC', p.oid, 'EXECUTE') as public_execute,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
    has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute,
    encode(digest(pg_get_functiondef(p.oid), 'sha256'), 'hex') as function_source_hash,
    n.nspname in ('public', 'storage', 'graphql_public') as exposed_schema,
    pg_get_function_arguments(p.oid) ~* '(^|, )[^,]*uuid([, ]|$)' as accepts_uuid,
    pg_get_function_arguments(p.oid) ~* '(^|, )[^,]*(json|jsonb)([, ]|$)' as accepts_json_or_jsonb,
    case
      when has_function_privilege('authenticated', p.oid, 'EXECUTE') then 'AUTHENTICATED_RPC'
      when p.proname = 'submit_booking_request_ingress' then 'BOOKING_INGRESS'
      when pg_get_function_result(p.oid) = 'trigger' then 'INTERNAL_TRIGGER'
      when p.proname ~* '(worker|job|queue|claim|complete|fail|retry|pulse|publish|scheduler)' then 'WORKER_OPERATION'
      when has_function_privilege('service_role', p.oid, 'EXECUTE') then 'SERVICE_ONLY'
      else 'UNCLASSIFIED'
    end as classification
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  join pg_roles owner_role on owner_role.oid = p.proowner
  where p.prosecdef
    and n.nspname not in ('pg_catalog', 'information_schema')
)
select * from functions;

do $$
declare
  v_unclassified text;
  v_count integer;
begin
  select count(*) into v_count from security_definer_inventory;
  if v_count = 0 then
    raise exception 'SECURITY_DEFINER_INVENTORY_EMPTY';
  end if;

  select string_agg(full_signature, E'\n' order by full_signature)
    into v_unclassified
  from security_definer_inventory
  where classification = 'UNCLASSIFIED';

  if v_unclassified is not null then
    raise exception 'SECURITY_DEFINER_UNCLASSIFIED:%', E'\n' || v_unclassified;
  end if;
end
$$;

select jsonb_pretty(jsonb_agg(to_jsonb(i) order by i.full_signature)) as security_definer_inventory
from security_definer_inventory i;

select classification, count(*) as function_count
from security_definer_inventory
group by classification
order by classification;

commit;
