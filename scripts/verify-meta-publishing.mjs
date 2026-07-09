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
  "supabase/migrations/20260710_000026_add_publication_receipts.sql",
);
for (const needle of [
  "create table if not exists public.content_publication_receipts",
  "unique (content_item_id, platform)",
  "alter table public.content_publication_receipts enable row level security",
  "revoke all on table public.content_publication_receipts from public, anon, authenticated",
  "'reserved', 'container_created', 'published', 'ambiguous', 'failed'",
  "claim_publication_receipt",
  "record_publication_container",
  "mark_publication_receipt_ambiguous",
  "complete_publication_receipt",
  "coalesce(auth.role(), '') <> 'service_role'",
  "PUBLICATION_PROVIDER_MISMATCH",
  "PUBLICATION_CONTAINER_MISMATCH",
  "PUBLICATION_POST_MISMATCH",
  "grant execute on function public.claim_publication_receipt(uuid, text, text) to service_role",
]) {
  requireText(migration, needle, "publication receipt database contract");
}

const secret = await text("src/platform/supabase-secret.server.ts");
for (const needle of [
  'const MEDIA_BUCKET = "relax-fix-media"',
  "PUBLISH_SIGNED_URL_TTL_SECONDS = 60 * 60",
  "INVALID_PRIVATE_MEDIA_STORAGE_PATH",
  "/storage/v1/object/sign/",
  "Authorization: `Bearer ${key}`",
  "createPublishingMediaSignedUrl",
]) {
  requireText(secret, needle, "private publishing media URL contract");
}
forbidText(secret, "/object/public/", "private publishing media URL contract");

const meta = await text("src/platform/meta-publishing.server.ts");
for (const needle of [
  'META_GRAPH_BASE_URL = "https://graph.facebook.com"',
  'value("META_GRAPH_VERSION")',
  'value("META_PAGE_ACCESS_TOKEN")',
  'value("META_PAGE_ID")',
  'value("INSTAGRAM_BUSINESS_ACCOUNT_ID")',
  'Authorization: `Bearer ${config.pageAccessToken}`',
  "claim_publication_receipt",
  "record_publication_container",
  "mark_publication_receipt_ambiguous",
  "complete_publication_receipt",
  'status === "published" && receipt.externalPostId',
  'status === "ambiguous"',
  "META_PUBLISH_AMBIGUOUS_REQUIRES_RECONCILIATION",
  "createPublishingMediaSignedUrl",
  'media_type: "REELS"',
  'path: `${accountId}/media_publish`',
  'path: `${pageId}/feed`',
  'asset.assetType === "video" ? "videos" : "photos"',
  "META_INSTAGRAM_EXACTLY_ONE_MEDIA_REQUIRED",
  "META_FACEBOOK_MULTIPLE_MEDIA_UNSUPPORTED",
  "META_INSTAGRAM_CONTAINER_NOT_READY",
  "configuredMetaPublishingPlatforms",
  "createMetaPublishingProvider",
]) {
  requireText(meta, needle, "Meta publishing adapter contract");
}
for (const needle of [
  "access_token:",
  'url.searchParams.set("access_token"',
  "META_PAGE_ACCESS_TOKEN=",
]) {
  forbidText(meta, needle, "Meta access token isolation");
}

const registry = await text("src/platform/provider-registry.server.ts");
for (const needle of [
  "createMetaPublishingProvider",
  "configuredMetaPublishingPlatforms",
  "const configuredMetaPublishingProvider = createMetaPublishingProvider()",
  "publishingAdapters.set(platform, configuredMetaPublishingProvider)",
  'provider: metaPublishingConfigured ? "meta-graph-publishing" : "meta"',
  "META_GRAPH_VERSION, META_PAGE_ACCESS_TOKEN",
]) {
  requireText(registry, needle, "Meta provider registry contract");
}

const readModels = await text("src/platform/os-read-models.ts");
for (const needle of [
  "const OsContentItemWireSchema",
  "OsContentItemWireSchema.transform",
  'item.status === "approved" ? item.plannedFor : null',
]) {
  requireText(readModels, needle, "Planner schedule suggestion contract");
}

const envExample = await text(".env.example");
for (const needle of [
  "OPENAI_API_KEY=server-secret-only",
  "AI_TEXT_PROVIDER=openai-responses-text",
  "AI_TEXT_MODEL=gpt-5.6-luna",
  "AI_IMAGE_PROVIDER=openai-gpt-image",
  "AI_IMAGE_MODEL=gpt-image-2",
  "GEMINI_API_KEY=server-secret-only",
  "AI_VIDEO_PROVIDER=google-veo",
  "AI_VIDEO_MODEL=veo-3.1-fast-generate-preview",
  "META_GRAPH_VERSION=vXX.X",
  "META_PAGE_ACCESS_TOKEN=server-secret-only",
  "META_PAGE_ID=server-config-only",
  "INSTAGRAM_BUSINESS_ACCOUNT_ID=server-config-only",
]) {
  requireText(envExample, needle, "server configuration documentation");
}

console.log(`Meta publishing verification passed (${checks} assertions).`);
