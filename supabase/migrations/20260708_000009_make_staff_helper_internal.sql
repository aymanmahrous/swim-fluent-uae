begin;

revoke all on function public.is_active_staff(text[]) from authenticated;
grant execute on function public.is_active_staff(text[]) to service_role;

commit;
