import { readFile, readdir } from "node:fs/promises";
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

const staffApiRoutes = [
  "src/routes/api.os-analytics.ts",
  "src/routes/api.os-command-center.ts",
  "src/routes/api.os-content-generate.ts",
  "src/routes/api.os-content-items.ts",
  "src/routes/api.os-content-transition.ts",
  "src/routes/api.os-content-update.ts",
  "src/routes/api.os-crm.ts",
  "src/routes/api.os-inbox.ts",
  "src/routes/api.os-integrations.ts",
  "src/routes/api.os-media.ts",
  "src/routes/api.os-media-copy.ts",
  "src/routes/api.os-media-generate-image.ts",
  "src/routes/api.os-media-generate-video.ts",
  "src/routes/api.os-operations.ts",
];

for (const path of staffApiRoutes) {
  const source = await text(path);
  requireText(source, "resolveStaffSession", path);
  requireText(source, '"UNAUTHORIZED"', path);
  forbidText(source, "SUPABASE_SERVICE_ROLE_KEY", path);
  forbidText(source, "SUPABASE_SECRET_KEY", path);
  forbidText(source, "ALIBABA_MODEL_STUDIO_API_KEY", path);
}

const worker = await text("src/routes/api.internal.publish-worker.ts");
requireText(worker, "verifyInternalWorkerRequest", "publish worker");
requireText(worker, "supabaseSecretRpc", "publish worker");
requireText(worker, "isSupabaseSecretConfigured", "publish worker");
requireText(worker, "getPublishingProvider", "publish worker");
requireText(worker, "idempotencyKey", "publish worker");
requireText(worker, '"SUPABASE_SECRET_NOT_CONFIGURED"', "publish worker");
forbidText(worker, "resolveStaffSession", "publish worker");
forbidText(worker, "serviceRoleRpc", "publish worker");
forbidText(worker, "SUPABASE_SERVICE_ROLE_KEY", "publish worker");

const secretClient = await text("src/platform/supabase-secret.server.ts");
requireText(secretClient, "process.env.SUPABASE_SECRET_KEY", "Supabase secret client");
requireText(secretClient, "apikey: key", "Supabase secret client");
requireText(secretClient, '"SUPABASE_SECRET_NOT_CONFIGURED"', "Supabase secret client");
forbidText(secretClient, "Authorization", "Supabase secret client");
forbidText(secretClient, "SUPABASE_SERVICE_ROLE_KEY", "Supabase secret client");

const envExample = await text(".env.example");
requireText(envExample, "SUPABASE_SECRET_KEY=", "environment template");
requireText(envExample, "INTERNAL_WORKER_TOKEN=", "environment template");
requireText(envExample, "MAAS_ENDPOINT=", "environment template");
requireText(envExample, "ALIBABA_MODEL_STUDIO_API_KEY=", "environment template");
requireText(envExample, "AI_TEXT_MODEL=qwen3.7-max", "environment template");
requireText(envExample, "AI_IMAGE_MODEL=wan2.7-image-pro", "environment template");
requireText(envExample, "AI_VIDEO_TEXT_MODEL=wan2.7-t2v-2026-06-12", "environment template");
requireText(envExample, "AI_VIDEO_IMAGE_MODEL=wan2.7-i2v-2026-04-25", "environment template");
forbidText(envExample, "SUPABASE_SERVICE_ROLE_KEY", "environment template");

const internalAuth = await text("src/platform/internal-auth.server.ts");
requireText(internalAuth, "timingSafeEqual", "internal worker auth");
requireText(internalAuth, "process.env.INTERNAL_WORKER_TOKEN", "internal worker auth");

const routeFiles = await readdir(join(root, "src/routes"));
const osPages = routeFiles.filter((name) => name.startsWith("os.") && name.endsWith(".tsx"));
for (const name of osPages) {
  const source = await text(`src/routes/${name}`);
  forbidText(source, "loadPlatformSnapshot", name);
  forbidText(source, "replaceContentPlan", name);
  forbidText(source, "VITE_AI_OS_DEMO_DATA", name);
  forbidText(source, '"15.4K"', name);
}

const migrations = new Map([
  ["supabase/migrations/20260708_000010_add_staff_crm_read_rpc.sql", ["get_staff_crm_leads"]],
  [
    "supabase/migrations/20260708_000011_add_staff_inbox_read_rpcs.sql",
    ["get_staff_inbox", "get_staff_conversation_messages"],
  ],
  [
    "supabase/migrations/20260708_000012_add_staff_conversation_mode_rpc.sql",
    ["set_staff_conversation_mode"],
  ],
  [
    "supabase/migrations/20260708_000013_add_staff_generated_content_rpc.sql",
    ["create_staff_generated_content_batch"],
  ],
  [
    "supabase/migrations/20260708_000014_add_staff_os_read_models.sql",
    ["get_staff_content_items", "get_staff_growth_analytics", "get_staff_command_center"],
  ],
  [
    "supabase/migrations/20260708_000015_add_staff_operations_media_read_models.sql",
    ["get_staff_operations_queue", "get_staff_media_assets"],
  ],
  [
    "supabase/migrations/20260708_000016_add_staff_content_review_schedule_rpc.sql",
    ["transition_staff_content_item"],
  ],
  [
    "supabase/migrations/20260708_000017_add_publish_worker_rpcs.sql",
    ["claim_next_publish_job", "defer_publish_job", "fail_publish_job", "complete_publish_job"],
  ],
  [
    "supabase/migrations/20260708_000018_add_staff_content_edit_rpc.sql",
    ["update_staff_content_item"],
  ],
  [
    "supabase/migrations/20260708_000019_add_staff_crm_workflow_rpc.sql",
    ["update_staff_lead_workflow"],
  ],
]);

for (const [path, functions] of migrations) {
  const source = (await text(path)).toLowerCase();
  for (const functionName of functions) requireText(source, functionName, path);
  requireText(source, "security definer", path);
  requireText(source, "set search_path = public, pg_temp", path);
  requireText(source, "revoke all on function", path);
  requireText(source, "grant execute on function", path);
}

const transitionMigration = (
  await text("supabase/migrations/20260708_000016_add_staff_content_review_schedule_rpc.sql")
).toLowerCase();
requireText(transitionMigration, "for update", "content transition migration");
requireText(transitionMigration, "background_jobs", "content transition migration");
requireText(transitionMigration, "publish_content", "content transition migration");
requireText(transitionMigration, "scheduled_for", "content transition migration");

const workerMigration = (
  await text("supabase/migrations/20260708_000017_add_publish_worker_rpcs.sql")
).toLowerCase();
requireText(workerMigration, "for update skip locked", "publish worker migration");
requireText(workerMigration, "to service_role", "publish worker migration");
requireText(workerMigration, "attempt_count", "publish worker migration");
requireText(workerMigration, "already_published", "publish worker migration");

const editMigration = (
  await text("supabase/migrations/20260708_000018_add_staff_content_edit_rpc.sql")
).toLowerCase();
requireText(editMigration, "published_content_immutable", "content edit migration");
requireText(editMigration, "content_edited_review_required", "content edit migration");
requireText(editMigration, "status = 'needs_review'", "content edit migration");
requireText(editMigration, "scheduled_for = null", "content edit migration");

const crmWorkflowMigration = (
  await text("supabase/migrations/20260708_000019_add_staff_crm_workflow_rpc.sql")
).toLowerCase();
requireText(crmWorkflowMigration, "for update", "CRM workflow migration");
requireText(crmWorkflowMigration, "do_not_contact", "CRM workflow migration");
requireText(crmWorkflowMigration, "follow_up_limit_reached", "CRM workflow migration");
requireText(crmWorkflowMigration, "audit_logs", "CRM workflow migration");

const mediaMigrationPath = "supabase/migrations/20260708_000020_add_ai_media_generation_storage.sql";
const mediaMigration = (await text(mediaMigrationPath)).toLowerCase();
for (const functionName of [
  "create_staff_media_asset_record",
  "create_staff_video_generation_job",
  "get_staff_video_generation_job",
  "update_staff_video_generation_job",
]) {
  requireText(mediaMigration, functionName, mediaMigrationPath);
}
requireText(mediaMigration, "relax-fix-media", "AI media migration");
requireText(mediaMigration, "storage.foldername(name)", "AI media migration");
requireText(mediaMigration, "auth.uid()::text", "AI media migration");
requireText(mediaMigration, "staff_profiles", "AI media migration");
requireText(mediaMigration, "security definer", "AI media migration");
requireText(mediaMigration, "set search_path = public, storage, pg_temp", "AI media migration");
requireText(mediaMigration, "revoke all on function", "AI media migration");
requireText(mediaMigration, "from public, anon", "AI media migration");
requireText(mediaMigration, "for update", "AI media migration");
requireText(mediaMigration, "storage_object_not_found", "AI media migration");

const mediaPolicyFixPath = "supabase/migrations/20260708_000021_fix_ai_media_storage_policy.sql";
const mediaPolicyFix = (await text(mediaPolicyFixPath)).toLowerCase();
requireText(mediaPolicyFix, "can_manage_relax_fix_media", "AI media policy fix");
requireText(mediaPolicyFix, "security definer", "AI media policy fix");
requireText(mediaPolicyFix, "set search_path = public, pg_temp", "AI media policy fix");
requireText(mediaPolicyFix, "from public, anon", "AI media policy fix");
requireText(mediaPolicyFix, "to authenticated, service_role", "AI media policy fix");
requireText(mediaPolicyFix, "storage.foldername(name)", "AI media policy fix");
requireText(mediaPolicyFix, "auth.uid()::text", "AI media policy fix");
requireText(mediaPolicyFix, "public.can_manage_relax_fix_media()", "AI media policy fix");

const providerRegistry = await text("src/platform/provider-registry.server.ts");
requireText(providerRegistry, "configured", "provider registry");
requireText(providerRegistry, "executable", "provider registry");
requireText(providerRegistry, "idempotencyKey", "provider registry");
requireText(providerRegistry, "registerPublishingProvider", "provider registry");
requireText(providerRegistry, 'all("SUPABASE_SECRET_KEY", "INTERNAL_WORKER_TOKEN")', "provider registry");
requireText(providerRegistry, "alibabaQwenProvider", "provider registry");
requireText(providerRegistry, "alibabaWanImageProvider", "provider registry");
requireText(providerRegistry, "alibabaWanVideoProvider", "provider registry");
requireText(providerRegistry, "getVideoProviderById", "provider registry");
forbidText(providerRegistry, "SUPABASE_SERVICE_ROLE_KEY", "provider registry");

const alibabaAdapter = await text("src/platform/alibaba-model-studio.server.ts");
requireText(alibabaAdapter, '"qwen3.7-max"', "Alibaba adapter");
requireText(alibabaAdapter, '"wan2.7-image-pro"', "Alibaba adapter");
requireText(alibabaAdapter, '"wan2.7-t2v-2026-06-12"', "Alibaba adapter");
requireText(alibabaAdapter, '"wan2.7-i2v-2026-04-25"', "Alibaba adapter");
requireText(alibabaAdapter, "/compatible-mode/v1/chat/completions", "Alibaba adapter");
requireText(alibabaAdapter, "/api/v1/services/aigc/multimodal-generation/generation", "Alibaba adapter");
requireText(alibabaAdapter, "/api/v1/services/aigc/video-generation/video-synthesis", "Alibaba adapter");
requireText(alibabaAdapter, '"X-DashScope-Async": "enable"', "Alibaba adapter");
requireText(alibabaAdapter, 'type: "first_frame"', "Alibaba adapter");
requireText(alibabaAdapter, "usesSourceImage ? {} : { ratio:", "Alibaba adapter");
requireText(alibabaAdapter, "/api/v1/tasks/", "Alibaba adapter");

const mediaStorage = await text("src/platform/media-storage.server.ts");
requireText(mediaStorage, 'MEDIA_BUCKET = "relax-fix-media"', "media storage");
requireText(mediaStorage, "providerHostSuffixes", "media storage");
requireText(mediaStorage, '"aliyuncs.com"', "media storage");
requireText(mediaStorage, '"alicdn.com"', "media storage");
requireText(mediaStorage, 'url.protocol !== "https:"', "media storage");
requireText(mediaStorage, "isIP(url.hostname) !== 0", "media storage");
requireText(mediaStorage, 'url.hostname === "localhost"', "media storage");
requireText(mediaStorage, 'redirect: "manual"', "media storage");
requireText(mediaStorage, "MAX_PROVIDER_REDIRECTS", "media storage");
requireText(mediaStorage, "PROVIDER_ASSET_HOST_NOT_ALLOWLISTED", "media storage");
requireText(mediaStorage, "tus.Upload", "media storage");
requireText(mediaStorage, "chunkSize: STANDARD_UPLOAD_LIMIT", "media storage");
requireText(mediaStorage, "6 * 1024 * 1024", "media storage");
requireText(mediaStorage, ".storage.supabase.co/storage/v1/upload/resumable", "media storage");
requireText(mediaStorage, "Authorization: `Bearer ${accessToken}`", "media storage");
requireText(mediaStorage, "publicObjectExists(path)", "media storage");
forbidText(mediaStorage, "SUPABASE_SECRET_KEY", "media storage");
forbidText(mediaStorage, "SUPABASE_SERVICE_ROLE_KEY", "media storage");

const videoRoute = await text("src/routes/api.os-media-generate-video.ts");
requireText(videoRoute, "getVideoProviderById(job.data.provider)", "video generation route");
requireText(videoRoute, '"STORED_PROVIDER_NOT_READY"', "video generation route");

const contentStudio = await text("src/routes/os.content.tsx");
requireText(contentStudio, "generateAiImage", "Content Studio");
requireText(contentStudio, "createAiVideo", "Content Studio");
requireText(contentStudio, "fetchAiVideoJob", "Content Studio");
requireText(contentStudio, "generateMatchingCopy", "Content Studio");
forbidText(contentStudio, "onClick: () => undefined", "Content Studio");

console.log(
  `AI OS contract verification passed (${checks} assertions across ${osPages.length} OS pages).`,
);
