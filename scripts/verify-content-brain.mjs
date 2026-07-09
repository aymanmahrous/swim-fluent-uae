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
  'DEFAULT_TEXT_MODEL = "gpt-5.6-luna"',
  'value("OPENAI_API_KEY")',
  'type: "json_schema"',
  "strict: true",
  "schema: input.jsonSchema.schema",
  "output: z",
  'item.type === "message"',
  'content.type === "output_text"',
  "responseText(parsed.data)",
  "instructions: input.system",
  "input: input.prompt",
  "store: false",
  'id: "openai-responses-text"',
]) {
  requireText(openAiText, needle, "OpenAI Responses text provider");
}
forbidText(openAiText, "output_text: z.string().min(1)", "SDK-only Responses convenience property");
forbidText(openAiText, "json_object", "OpenAI structured output mode");

const registry = await text("src/platform/provider-registry.server.ts");
for (const needle of [
  "openAiResponsesTextProvider",
  '[openAiResponsesTextProvider.id, openAiResponsesTextProvider]',
  '? "openai-responses-text"',
  'providerId === "openai-responses-text"',
  "OpenAI Responses requires OPENAI_API_KEY",
]) {
  requireText(registry, needle, "text provider registry");
}

const route = await text("src/routes/api.os-content-generate.ts");
for (const needle of [
  '"trust_morning"',
  '"education_midday"',
  '"conversion_evening"',
  "dubaiHour: 8",
  "dubaiHour: 14",
  "dubaiHour: 20",
  "parsed.data.days * SLOT_PLAN.length",
  "generateOpenAiStructuredText",
  'name: "relax_fix_content_brain_batch"',
  "structuredBatchSchema(requestedItems)",
  "validateCadence",
  "contentFingerprint",
  'timeZone: "Asia/Dubai"',
  "base.day + 1 + dayIndex",
  '"get_staff_content_brain_context"',
  "recentContentToAvoidRepeating: context.data",
  "Every item is going to needs_review",
  "plannedFor: plannedFor(item.dayIndex, item.contentSlot)",
]) {
  requireText(route, needle, "three-daily Content Brain route");
}
forbidText(route, "Return one item per requested day", "legacy one-per-day generation");
forbidText(route, "generated.items.length !== parsed.data.days", "legacy batch cardinality");

const migration = await text(
  "supabase/migrations/20260710_000025_content_brain_three_daily.sql",
);
for (const needle of [
  "add column if not exists planned_for timestamptz",
  "add column if not exists language text not null default 'ar'",
  "add column if not exists content_pillar text",
  "add column if not exists content_slot text",
  "add column if not exists content_fingerprint text",
  "content_items_planned_for_unique_idx",
  "content_items_content_fingerprint_created_idx",
  "now() - interval '90 days'",
  "CONTENT_FATIGUE_DUPLICATE",
  "CONTENT_SLOT_ALREADY_PLANNED",
  "v_count > 90",
  "'needs_review'",
  "content_brain_batch_saved_for_review",
  "'dailyCadence', 3",
  "get_staff_content_brain_context",
  "'plannedFor', c.planned_for",
  "'contentPillar', c.content_pillar",
  "'contentSlot', c.content_slot",
  "'contentFingerprint', c.content_fingerprint",
]) {
  requireText(migration, needle, "Content Brain database contract");
}
forbidText(migration, "insert into public.background_jobs", "approval-before-scheduling boundary");

const readModels = await text("src/platform/os-read-models.ts");
for (const needle of [
  "plannedFor: z.string().nullable()",
  'language: z.enum(["ar", "en"])',
  "contentPillar: z.string().nullable()",
  "contentSlot: z.string().nullable()",
  "contentFingerprint: z.string().nullable()",
]) {
  requireText(readModels, needle, "planner Content Brain read model");
}

console.log(`Content Brain verification passed (${checks} assertions).`);
