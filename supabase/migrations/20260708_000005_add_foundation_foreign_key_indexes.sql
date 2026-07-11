begin;

-- Some indexes target legacy tables or columns that are present in Production but are
-- intentionally absent from the Fresh AI OS foundation. Create each index only when
-- its exact table/column dependency exists.
do $foundation_indexes$
declare
  v_index record;
begin
  for v_index in
    select *
    from (values
      ('campaigns_user_id_idx', 'campaigns', 'user_id'),
      ('content_items_campaign_id_idx', 'content_items', 'campaign_id'),
      ('content_metrics_content_item_id_idx', 'content_metrics', 'content_item_id'),
      ('conversations_lead_id_idx', 'conversations', 'lead_id'),
      ('follow_up_jobs_conversation_id_idx', 'follow_up_jobs', 'conversation_id'),
      ('follow_up_jobs_lead_id_idx', 'follow_up_jobs', 'lead_id'),
      ('invoices_user_id_idx', 'invoices', 'user_id'),
      ('media_assets_content_item_id_idx', 'media_assets', 'content_item_id'),
      ('sessions_user_id_idx', 'sessions', 'user_id')
    ) as indexes(index_name, table_name, column_name)
  loop
    if exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = v_index.table_name
        and c.column_name = v_index.column_name
    ) then
      execute format(
        'create index if not exists %I on public.%I (%I)',
        v_index.index_name,
        v_index.table_name,
        v_index.column_name
      );
    end if;
  end loop;
end;
$foundation_indexes$;

commit;
