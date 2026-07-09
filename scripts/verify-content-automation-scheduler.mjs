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

const schedulerMigration = await text(
  "supabase/migrations/20260710_000029_content_automation_scheduler.sql",
);
for (const needle of [
  "create table if not exists public.automation_leases",
  "create table if not exists public.content_automation_runs",
  "alter table public.automation_leases enable row level security",
  "alter table public.content_automation_runs enable row level security",
  "revoke all on table public.automation_leases from public, anon, authenticated",
  "revoke all on table public.content_automation_runs from public, anon, authenticated",
  "claim_content_automation_lease",
  "for update",
  "p_lease_seconds < 30 or p_lease_seconds > 900",
  "AUTOMATION_LEASE_HELD",
  "gen_random_uuid()",
  "release_content_automation_lease",
  "start_content_automation_run",
  "complete_content_automation_run",
  "fail_content_automation_run",
  "get_staff_content_automation_status",
  "'mediaDead'",
  "'publishDead'",
  "'ambiguousPublications'",
  "limit 20",
  "coalesce(auth.role(), '') <> 'service_role'",
  "grant execute on function public.claim_content_automation_lease(text, integer) to service_role",
  "grant execute on function public.get_staff_content_automation_status() to authenticated",
]) {
  requireText(schedulerMigration, needle, "automation scheduler database contract");
}

const pulseMigration = await text(
  "supabase/migrations/20260710_000030_supabase_content_automation_pulse.sql",
);
for (const needle of [
  "create extension if not exists pg_cron",
  "create extension if not exists pg_net",
  "create table if not exists public.content_automation_scheduler_auth",
  "alter table public.content_automation_scheduler_auth enable row level security",
  "revoke all on table public.content_automation_scheduler_auth from public, anon, authenticated",
  "relax_fix_content_automation_scheduler_token",
  "extensions.gen_random_bytes(32)",
  "vault.create_secret",
  "extensions.digest(v_token, 'sha256')",
  "'https://swim-fluent-uae-w532.vercel.app/api/cron/content-automation'",
  "false",
  "verify_content_automation_scheduler_token",
  "v_auth.active and v_hash = v_auth.token_hash",
  "dispatch_content_automation_pulse",
  "vault.decrypted_secrets",
  "net.http_get",
  "'Authorization', 'Bearer ' || v_token",
  "'X-Relax-Fix-Scheduler', 'supabase_cron'",
  "timeout_milliseconds := 55000",
  "set_content_automation_pulse_active",
  "cron.alter_job(v_job_id, active := p_active)",
  "'vercel_cron', 'supabase_cron', 'internal_manual'",
  "grant execute on function public.verify_content_automation_scheduler_token(text) to service_role",
  "grant execute on function public.set_content_automation_pulse_active(boolean) to service_role",
  "'relax-fix-content-automation-pulse'",
  "'*/5 * * * *'",
  "'select public.dispatch_content_automation_pulse();'",
  "active := false",
]) {
  requireText(pulseMigration, needle, "Supabase Cron pulse contract");
}
for (const needle of [
  "insert into public.content_items",
  "create_staff_generated_content_batch",
  "transition_staff_content_item",
  "decrypted_secret,",
]) {
  forbidText(pulseMigration, needle, "scheduler pulse approval boundary");
}

const cronAuth = await text("src/platform/cron-auth.server.ts");
for (const needle of [
  'import { timingSafeEqual } from "node:crypto"',
  'process.env.CRON_SECRET?.trim()',
  'const prefix = "Bearer "',
  "timingSafeEqual(expectedBuffer, providedBuffer)",
  'supabaseSecretRpc("verify_content_automation_scheduler_token"',
  'return "vercel_cron"',
  'return "supabase_cron"',
  "authenticateContentAutomationRequest",
]) {
  requireText(cronAuth, needle, "scheduler authentication contract");
}

const automation = await text("src/platform/content-automation.server.ts");
for (const needle of [
  "processOneContentMediaJob",
  "processOnePublishJob",
  'AUTOMATION_LEASE_NAME = "content_automation"',
  "AUTOMATION_LEASE_SECONDS = 240",
  "MAX_MEDIA_ATTEMPTS_PER_CYCLE = 2",
  "MAX_PUBLISH_ATTEMPTS_PER_CYCLE = 6",
  'source: z.enum(["vercel_cron", "supabase_cron", "internal_manual"])',
  'summary.code === "NO_DUE_CONTENT_MEDIA_JOB"',
  'summary.code === "NO_JOB"',
  'rpcJson("claim_content_automation_lease"',
  'rpcJson("start_content_automation_run"',
  'rpcJson("complete_content_automation_run"',
  'rpcJson("fail_content_automation_run"',
  'rpcJson("release_content_automation_lease"',
  "humanApprovalRequired: true",
  "contentBrainGenerationTriggered: false",
]) {
  requireText(automation, needle, "server-side automation cycle contract");
}
for (const needle of [
  "generateOpenAiStructuredText",
  "create_staff_generated_content_batch",
  "transition_staff_content_item",
  'fetch("/api/internal',
  "INTERNAL_WORKER_TOKEN",
]) {
  forbidText(automation, needle, "human approval and in-process worker boundary");
}

const mediaRoute = await text("src/routes/api.internal.content-media-worker.ts");
requireText(mediaRoute, "processOneContentMediaJob()", "media worker wrapper");
requireText(mediaRoute, "verifyInternalWorkerRequest(request)", "media worker wrapper");
forbidText(mediaRoute, "claim_next_content_media_job", "media route processor extraction");

const publishRoute = await text("src/routes/api.internal.publish-worker.ts");
requireText(publishRoute, "processOnePublishJob()", "publish worker wrapper");
requireText(publishRoute, "verifyInternalWorkerRequest(request)", "publish worker wrapper");
forbidText(publishRoute, "claim_next_publish_job", "publish route processor extraction");

const cronRoute = await text("src/routes/api.cron.content-automation.ts");
for (const needle of [
  'createFileRoute("/api/cron/content-automation")',
  "authenticateContentAutomationRequest(request)",
  "runContentAutomationCycle(source)",
  '"Cache-Control": "no-store"',
]) {
  requireText(cronRoute, needle, "content automation cron route");
}

const statusRoute = await text("src/routes/api.os-automation-status.ts");
for (const needle of [
  "resolveStaffSession(request)",
  '["super_admin", "admin", "content_manager"]',
  '"get_staff_content_automation_status"',
]) {
  requireText(statusRoute, needle, "automation staff status route");
}

const readModel = await text("src/platform/os-operations-data.ts");
for (const needle of [
  'z.enum(["vercel_cron", "supabase_cron", "internal_manual"])',
  "ContentAutomationStatusSchema",
  "ambiguousPublications",
  "fetchContentAutomationStatus",
  'fetch("/api/os-automation-status"',
]) {
  requireText(readModel, needle, "automation UI read model");
}

const page = await text("src/routes/os.automations.tsx");
for (const needle of [
  "fetchContentAutomationStatus",
  'queryKey: ["os", "content-automation-status"]',
  "Active media jobs",
  "Active publish jobs",
  "Ambiguous publications",
  "Human approval remains mandatory before scheduling",
  "The scheduler does not create Content Brain batches and cannot publish a needs-review item",
  'source === "supabase_cron"',
  "Supabase Cron pulse",
]) {
  requireText(page, needle, "automation health UI");
}

const vercel = JSON.parse(await text("vercel.json"));
checks += 1;
if (
  !Array.isArray(vercel.crons) ||
  vercel.crons.length !== 1 ||
  vercel.crons[0]?.path !== "/api/cron/content-automation" ||
  vercel.crons[0]?.schedule !== "15 0 * * *"
) {
  throw new Error("Vercel daily recovery cron contract invalid");
}
checks += 1;
if (JSON.stringify(vercel.crons).includes("*/5 * * * *")) {
  throw new Error("Vercel high-frequency cron is forbidden on the current plan");
}

const envExample = await text(".env.example");
requireText(envExample, "CRON_SECRET=server-secret-only", "server configuration documentation");

console.log(`Content automation scheduler verification passed (${checks} assertions).`);
