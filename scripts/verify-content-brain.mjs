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

const openAiText = await text("src/platform/openai-text.server.ts");
for (const needle of [
  'OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses"',
  'value("OPENAI_API_KEY") && value("AI_TEXT_MODEL")',
  'const model = value("AI_TEXT_MODEL")',
  'signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)',
  'MAX_RESPONSE_BYTES = 1_000_000',
  'type: "json_schema"',
  "strict: true",
  "schema: input.jsonSchema.schema",
  "store: false",
  'id: "openai-responses-text"',
]) {
  requireText(openAiText, needle, "OpenAI Responses text provider");
}
forbidText(openAiText, "gpt-5.6-luna", "unverified default model");
forbidText(openAiText, "json_object", "OpenAI structured output mode");

const route = await text("src/routes/api.os-content-generate.ts");
for (const needle of [
  "days: z.literal(1)",
  'PHASE3_MAX_OUTPUT_TOKENS = 8_000',
  'PHASE3_GENERATION_MODE = "text_only_validation"',
  'request.headers.get("idempotency-key")',
  '"reserve_staff_content_generation"',
  '"create_staff_generated_content_batch_guarded"',
  '"fail_staff_content_generation"',
  '"DAILY_GENERATION_LIMIT"',
  '"Retry-After": "86400"',
  'name: "relax_fix_content_brain_phase3_batch"',
  "structuredBatchSchema()",
  "containsRestrictedClaim",
  'timeZone: "Asia/Dubai"',
  "targetDubaiDate()",
  'generationMode: PHASE3_GENERATION_MODE',
  '"Every item is going to needs_review."',
]) {
  requireText(route, needle, "guarded Content Brain route");
}
for (const forbidden of [
  "maxOutputTokens: 40_000",
  "adaptive aquatic coaching for People of Determination",
  'days: z.number().int().min(1).max(30)',
  '"create_staff_generated_content_batch"',
]) {
  forbidText(route, forbidden, "unsafe Content Brain route contract");
}

const baseMigration = await text(
  "supabase/migrations/20260710_000025_content_brain_three_daily.sql",
);
for (const needle of [
  "content_items_planned_for_unique_idx",
  "content_items_content_fingerprint_created_idx",
  "now() - interval '90 days'",
  "CONTENT_FATIGUE_DUPLICATE",
  "CONTENT_SLOT_ALREADY_PLANNED",
  "'needs_review'",
]) {
  requireText(baseMigration, needle, "base Content Brain database contract");
}

const safetyMigration = await text(
  "supabase/migrations/20260723_000030_content_brain_safety_gates.sql",
);
for (const needle of [
  "content_generation_requests",
  "generation_run_id uuid",
  "generation_mode text not null default 'standard'",
  "text_only_validation",
  "reserve_staff_content_generation",
  "pg_advisory_xact_lock",
  "DAILY_GENERATION_LIMIT",
  "content_generation_requests_active_hash_unique_idx",
  "fail_staff_content_generation",
  "create_staff_generated_content_batch_guarded",
  "jsonb_array_length(p_items) <> 3",
  "generation_run_id, generation_mode",
  "new.generation_mode <> 'text_only_validation'",
  "content_brain_guarded_batch_saved_for_review",
]) {
  requireText(safetyMigration, needle, "Phase 3 database safety contract");
}
forbidText(
  safetyMigration,
  "delete from public.audit_logs",
  "audit history rollback boundary",
);

console.log(`Content Brain safety verification passed (${checks} assertions).`);
