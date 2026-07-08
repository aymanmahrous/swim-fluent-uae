begin;

create index if not exists campaigns_user_id_idx
  on public.campaigns (user_id);

create index if not exists content_items_campaign_id_idx
  on public.content_items (campaign_id);

create index if not exists content_metrics_content_item_id_idx
  on public.content_metrics (content_item_id);

create index if not exists conversations_lead_id_idx
  on public.conversations (lead_id);

create index if not exists follow_up_jobs_conversation_id_idx
  on public.follow_up_jobs (conversation_id);

create index if not exists follow_up_jobs_lead_id_idx
  on public.follow_up_jobs (lead_id);

create index if not exists invoices_user_id_idx
  on public.invoices (user_id);

create index if not exists media_assets_content_item_id_idx
  on public.media_assets (content_item_id);

create index if not exists sessions_user_id_idx
  on public.sessions (user_id);

commit;
