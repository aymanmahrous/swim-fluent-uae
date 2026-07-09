import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
let checks = 0;

async function text(path) {
  return readFile(join(root, path), "utf8");
}

function requireText(source, needle, label) {
  checks += 1;
  if (!source.includes(needle)) {
    throw new Error(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function forbidText(source, needle, label) {
  checks += 1;
  if (source.includes(needle)) {
    throw new Error(`${label}: forbidden ${JSON.stringify(needle)}`);
  }
}

const migration = await text(
  "supabase/migrations/20260710_000027_content_media_worker_queue.sql",
);
for (const needle of [
  "add column if not exists created_by uuid references auth.users(id) on delete set null",
  "background_jobs_content_media_active_unique_idx",
  "job_type = 'generate_content_media'",
  "status in ('queued', 'processing', 'retrying')",
  "media_assets_autonomous_content_type_unique_idx",
  "metadata->>'autonomous' = 'true'",
  "prepare_content_item_for_media",
  "new.content_slot = 'conversion_evening'",
  "new.content_type := 'reel'",
  "new.content_slot in ('trust_morning', 'education_midday')",
  "new.content_type := 'image_post'",
  "enqueue_content_media_after_insert",
  "'generate_content_media'",
  "claim_next_content_media_job",
  "for update skip locked",
  "when v_content.content_type = 'image_post' then 'image'",
  "when v_content.content_type = 'reel' then 'video'",
  "'aspectRatio', case when v_asset_type = 'video' then '9:16' else '4:5' end",
  "'durationSeconds', case when v_asset_type = 'video' then 8 else null end",
  "record_content_media_video_provider_job",
  "now() + interval '15 seconds'",
  "insert into public.ai_media_jobs",
  "'autonomous', true",
  "defer_content_media_job",
  "attempt_count = greatest(attempt_count - 1, 0)",
  "fail_content_media_job",
  "v_job.attempt_count >= 5",
  "interval '5 minutes'",
  "interval '15 minutes'",
  "interval '1 hour'",
  "interval '3 hours'",
  "complete_content_media_job",
  "insert into public.media_assets",
  "'content_media_generated'",
  "coalesce(auth.role(), '') <> 'service_role'",
  "grant execute on function public.claim_next_content_media_job() to service_role",
  "grant execute on function public.complete_content_media_job(uuid, text, text, text, jsonb) to service_role",
]) {
  requireText(migration.toLowerCase(), needle.toLowerCase(), "content media queue contract");
}
for (const needle of [
  "create table public.background_jobs",
  "create table if not exists public.background_jobs",
  "insert into public.content_items",
  "insert into public.content_publication_receipts",
]) {
  forbidText(migration.toLowerCase(), needle.toLowerCase(), "existing queue and workflow boundaries");
}

const terminalRetry = await text(
  "supabase/migrations/20260710_000028_retry_terminal_video_generation_with_new_provider_job.sql",
);
for (const needle of [
  "fail_content_media_video_provider_job",
  "CONTENT_MEDIA_VIDEO_PROVIDER_JOB_MISSING",
  "update public.ai_media_jobs",
  "status = 'failed'",
  "payload - 'provider' - 'providerJobId'",
  "when v_final_status = 'retrying'",
  "willCreateNewProviderJob",
  "v_job.attempt_count >= 5",
  "grant execute on function public.fail_content_media_video_provider_job(uuid, text) to service_role",
]) {
  requireText(terminalRetry, needle, "terminal video provider retry contract");
}

const storage = await text("src/platform/content-media-worker-storage.server.ts");
for (const needle of [
  'const MEDIA_BUCKET = "relax-fix-media"',
  "MAX_PROVIDER_ASSET_BYTES = 100 * 1024 * 1024",
  '"google-veo": ["googleapis.com", "googleusercontent.com"]',
  'new Set(["x-goog-api-key"])',
  "PROVIDER_ASSET_HOST_NOT_ALLOWLISTED",
  "PROVIDER_ASSET_DOWNLOAD_HEADER_REJECTED",
  "MAX_PROVIDER_REDIRECTS = 3",
  "autonomous-${jobId}",
  "supabaseServerKeyHeaders()",
  "headers: { apikey: secretKey(), ...supabaseServerKeyHeaders() }",
  "apikey: secretKey()",
  '"x-upsert": "false"',
  "authenticatedObjectExists",
  "persistContentMediaImageBytes",
  "persistContentMediaRemoteAsset",
  'uploadMode: "standard"',
]) {
  requireText(storage, needle, "content media private storage contract");
}
for (const needle of [
  "Authorization",
  "/object/public/",
  "SUPABASE_SERVICE_ROLE_KEY",
  "tus.Upload",
]) {
  forbidText(storage, needle, "server key and private storage boundary");
}

const processor = await text("src/platform/content-media-worker.server.ts");
for (const needle of [
  "processOneContentMediaJob",
  "isSupabaseSecretConfigured()",
  'rpcJson("claim_next_content_media_job")',
  "getImageProvider()",
  "persistContentMediaImageBytes",
  "persistContentMediaRemoteAsset",
  '"IMAGE_PROVIDER_NOT_READY"',
  "getVideoProvider()",
  'rpcJson("record_content_media_video_provider_job"',
  '"VIDEO_PROVIDER_JOB_STARTED"',
  "getVideoProviderById(job.provider)",
  'providerState.status === "queued" || providerState.status === "running"',
  '"VIDEO_PROVIDER_PENDING"',
  "providerState.downloadHeaders",
  'rpcJson("complete_content_media_job"',
  'rpcJson("fail_content_media_job"',
  'rpcJson("fail_content_media_video_provider_job"',
  "failVideoProviderJob(",
]) {
  requireText(processor, needle, "content media processor contract");
}
for (const needle of [
  "claim_next_publish_job",
  "complete_publish_job",
  "getPublishingProvider",
  "content_publication_receipts",
]) {
  forbidText(processor, needle, "media versus publishing boundary");
}

const route = await text("src/routes/api.internal.content-media-worker.ts");
for (const needle of [
  'createFileRoute("/api/internal/content-media-worker")',
  "verifyInternalWorkerRequest(request)",
  "processOneContentMediaJob()",
  "Response.json(result.body, { status: result.status })",
]) {
  requireText(route, needle, "authenticated media worker wrapper");
}
for (const needle of [
  "claim_next_content_media_job",
  "getImageProvider",
  "getVideoProvider",
  "SUPABASE_SECRET_KEY",
]) {
  forbidText(route, needle, "media route processor extraction");
}

console.log(`Content media worker verification passed (${checks} assertions).`);
