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
  "src/routes/api.os-operations.ts",
];

for (const path of staffApiRoutes) {
  const source = await text(path);
  requireText(source, "resolveStaffSession", path);
  requireText(source, '"UNAUTHORIZED"', path);
  forbidText(source, "SUPABASE_SERVICE_ROLE_KEY", path);
  forbidText(source, "SUPABASE_SECRET_KEY", path);
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

const providerRegistry = await text("src/platform/provider-registry.server.ts");
requireText(providerRegistry, "configured", "provider registry");
requireText(providerRegistry, "executable", "provider registry");
requireText(providerRegistry, "idempotencyKey", "provider registry");
requireText(providerRegistry, "registerPublishingProvider", "provider registry");
requireText(providerRegistry, 'all("SUPABASE_SECRET_KEY", "INTERNAL_WORKER_TOKEN")', "provider registry");
forbidText(providerRegistry, "SUPABASE_SERVICE_ROLE_KEY", "provider registry");

console.log(
  `AI OS contract verification passed (${checks} assertions across ${osPages.length} OS pages).`,
);
