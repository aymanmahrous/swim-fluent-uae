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

const adapter = await text("src/platform/alibaba-model-studio.server.ts");
requireText(adapter, "normalizeEndpoint", "Alibaba endpoint normalization");
requireText(adapter, '"/compatible-mode/v1"', "Alibaba endpoint normalization");
requireText(adapter, '"/api/v1"', "Alibaba endpoint normalization");
requireText(adapter, "pathname.endsWith(suffix)", "Alibaba endpoint normalization");
requireText(adapter, "url.protocol !== \"https:\"", "Alibaba endpoint normalization");

const openAiImage = await text("src/platform/openai-image.server.ts");
for (const needle of [
  'DEFAULT_IMAGE_MODEL = "gpt-image-2"',
  'OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations"',
  'value("OPENAI_API_KEY")',
  'b64_json: z.string().min(1)',
  'output_format: "jpeg"',
  'background: "opaque"',
  'moderation: "auto"',
  'id: "openai-gpt-image"',
]) {
  requireText(openAiImage, needle, "OpenAI image provider");
}

const googleVeo = await text("src/platform/google-veo.server.ts");
for (const needle of [
  'DEFAULT_VIDEO_MODEL = "veo-3.1-fast-generate-preview"',
  'value("GEMINI_API_KEY")',
  ':predictLongRunning',
  'aspectRatio: aspectRatio(input.aspectRatio)',
  'durationSeconds: durationSeconds(input.durationSeconds)',
  'resolution: "720p"',
  'return sourceAssetUrl ? "allow_adult" : "allow_all"',
  'personGeneration: personGeneration(input.sourceAssetUrl)',
  'googleErrorDetail(parsed.data.error, response.status)',
  'normalized.includes("..")',
  'downloadHeaders: { "x-goog-api-key": apiKey }',
  'id: "google-veo"',
]) {
  requireText(googleVeo, needle, "Google Veo provider");
}
forbidText(googleVeo, "numberOfVideos", "Google Veo unsupported request parameter");
forbidText(googleVeo, 'personGeneration: "allow_adult"', "Google Veo text-to-video person generation");

const registry = await text("src/platform/provider-registry.server.ts");
for (const needle of [
  '[openAiGptImageProvider.id, openAiGptImageProvider]',
  '[googleVeoProvider.id, googleVeoProvider]',
  '? "openai-gpt-image"',
  '? "google-veo"',
  'providerId === "openai-gpt-image"',
  'providerId === "google-veo"',
]) {
  requireText(registry, needle, "AI provider registry");
}

const hardeningPath =
  "supabase/migrations/20260709_000024_harden_ai_media_ownership.sql";
const hardening = (await text(hardeningPath)).toLowerCase();
for (const needle of [
  "created_by uuid references auth.users(id)",
  "created_by = auth.uid()",
  "requested_by = auth.uid()",
  "public = false",
  "active staff can read own media folder",
  "for select",
  "storage.foldername(name)",
  "can_manage_relax_fix_media",
  "revoke all on table public.media_assets from public, anon, authenticated",
  "idx_media_assets_created_by_created",
  "job_ownership_conflict",
]) {
  requireText(hardening, needle, "AI media ownership migration");
}

const storage = await text("src/platform/media-storage.server.ts");
requireText(storage, "mediaSignedUrl", "private media storage");
requireText(storage, "/storage/v1/object/sign/", "private media storage");
requireText(storage, "authenticatedObjectExists", "private media storage");
requireText(storage, 'method: "HEAD"', "private media storage");
requireText(storage, "SIGNED_URL_TTL_SECONDS", "private media storage");
requireText(storage, "Authorization: `Bearer ${accessToken}`", "private media storage");
requireText(storage, "tus.Upload", "private media storage");
requireText(storage, "chunkSize: STANDARD_UPLOAD_LIMIT", "private media storage");
requireText(storage, "6 * 1024 * 1024", "private media storage");
requireText(storage, '"google-veo": ["googleapis.com", "googleusercontent.com"]', "Veo host allowlist");
requireText(storage, 'new Set(["x-goog-api-key"])', "Veo download header allowlist");
requireText(storage, "PROVIDER_ASSET_DOWNLOAD_HEADER_REJECTED", "provider header rejection");
requireText(storage, "persistProviderAssetBytes", "direct image byte persistence");
forbidText(storage, "/object/public/", "private media storage");
forbidText(storage, "SUPABASE_SECRET_KEY", "private media storage");
forbidText(storage, "SUPABASE_SERVICE_ROLE_KEY", "private media storage");

const imageRoute = await text("src/routes/api.os-media-generate-image.ts");
for (const needle of [
  "persistProviderAssetBytes",
  'Buffer.from(generation.assetBase64, "base64")',
  "generation.assetUrl",
  'throw new Error("IMAGE_PROVIDER_ASSET_MISSING")',
]) {
  requireText(imageRoute, needle, "image provider persistence route");
}
forbidText(imageRoute, "OPENAI_API_KEY", "image route secret isolation");
forbidText(imageRoute, "GEMINI_API_KEY", "image route secret isolation");

const mediaApi = await text("src/routes/api.os-media.ts");
requireText(mediaApi, "createdBy", "media API ownership");
requireText(mediaApi, "mediaSignedUrl", "media API signed URLs");
requireText(mediaApi, '"MEDIA_SIGN_FAILED"', "media API signed URLs");
requireText(mediaApi, "resolveStaffSession", "media API auth");

const videoRoute = await text("src/routes/api.os-media-generate-video.ts");
for (const needle of [
  "mediaSignedUrl",
  "getVideoProviderById(job.data.provider)",
  '"STORED_PROVIDER_NOT_READY"',
  "downloadHeaders: providerState.downloadHeaders",
  "sanitizeProviderDetail",
  "safeProviderError",
  '"[REDACTED_URL]"',
  '"Bearer [REDACTED]"',
  '"?[REDACTED_QUERY]"',
  "{ success: false, ...safeProviderError(error) }",
]) {
  requireText(videoRoute, needle, "video route safe provider errors");
}
for (const needle of [
  'message.split(":")[0]',
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "Authorization: `Bearer",
]) {
  forbidText(videoRoute, needle, "video route secret isolation");
}

const mediaPage = await text("src/routes/os.media.tsx");
for (const needle of [
  "fetchAiVideoJobs",
  "fetchAiVideoJob",
  "activeVideoJob",
  "incompleteVideoJobs",
  "refetchInterval",
  'queryKey: ["os", "media-assets"]',
]) {
  requireText(mediaPage, needle, "Media Library live state");
}

const mediaReadModel = await text("src/platform/os-operations-data.ts");
requireText(mediaReadModel, "createdBy: z.string().uuid()", "media client ownership schema");

const oidc = await text("src/platform/github-actions-oidc.server.ts");
for (const needle of [
  'AI_MEDIA_E2E_AUDIENCE = "relax-fix-ai-media-e2e"',
  'EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae"',
  'EXPECTED_REF = "refs/heads/main"',
  "EXPECTED_SUBJECT",
  'event_name: z.literal("push")',
  "sha: z.string().regex",
  "RSASSA-PKCS1-v1_5",
  "crypto.subtle.verify",
]) {
  requireText(oidc, needle, "GitHub Actions OIDC verifier");
}
forbidText(oidc, "SUPABASE_SECRET_KEY", "GitHub Actions OIDC verifier");

const e2eRoute = await text("src/routes/api.internal.ai-media-e2e.ts");
for (const needle of [
  'process.env.VERCEL_ENV === "production"',
  'process.env.VERCEL_GIT_COMMIT_REF === "main"',
  "process.env.VERCEL_GIT_COMMIT_SHA === context.sha",
  "verifyGithubActionsOidc",
  'z.literal("status")',
  'code: "DEPLOYMENT_NOT_READY"',
  "sha: oidc.sha",
]) {
  requireText(e2eRoute, needle, "production E2E status route");
}
forbidText(e2eRoute, 'z.literal("provision")', "production E2E status route");
forbidText(e2eRoute, 'z.literal("cleanup")', "production E2E status route");
forbidText(e2eRoute, "SUPABASE_SECRET_KEY", "production E2E status route");
forbidText(e2eRoute, "ALIBABA_MODEL_STUDIO_API_KEY", "production E2E status route");

const edgeAdmin = await text("supabase/functions/ai-media-e2e-admin/index.ts");
for (const needle of [
  'OIDC_AUDIENCE = "relax-fix-ai-media-e2e"',
  'EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae"',
  'EXPECTED_REF = "refs/heads/main"',
  "crypto.subtle.verify",
  'Deno.env.get("SUPABASE_SECRET_KEYS")',
  'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
  'E2E_PURPOSE = "relax-fix-ai-media-e2e"',
  "user.user_metadata?.purpose !== E2E_PURPOSE",
  "created_by=eq.${encoded}",
  "requested_by=eq.${encoded}",
]) {
  requireText(edgeAdmin, needle, "Supabase Edge E2E admin");
}
forbidText(edgeAdmin, "sb_secret_", "Supabase Edge E2E admin");
forbidText(edgeAdmin, "ALIBABA_MODEL_STUDIO_API_KEY", "Supabase Edge E2E admin");

const e2eClient = await text("scripts/ai-media-e2e-admin.mjs");
for (const needle of [
  "ACTIONS_ID_TOKEN_REQUEST_URL",
  "ACTIONS_ID_TOKEN_REQUEST_TOKEN",
  '"wait", "provision", "cleanup"',
  "DEPLOYMENT_WAIT_ATTEMPTS",
  "E2E_ADMIN_URL",
  '`${baseUrl}/api/internal/ai-media-e2e`',
  "oidcCall(adminUrl",
  'code !== "DEPLOYMENT_NOT_READY"',
  "AI_MEDIA_E2E_DEPLOYMENT_TIMEOUT",
  'console.log(`::add-mask::${user.password}`)',
]) {
  requireText(e2eClient, needle, "E2E GitHub client");
}
forbidText(e2eClient, "SUPABASE_SECRET_KEY", "E2E GitHub client");
forbidText(e2eClient, "ALIBABA_MODEL_STUDIO_API_KEY", "E2E GitHub client");

const e2eSpec = await text("tests/e2e/ai-media.spec.ts");
for (const needle of [
  "/api/os-media-generate-image",
  'provider: z.enum(["openai-gpt-image", "alibaba-wan-image"])',
  'provider: z.enum(["google-veo", "alibaba-wan-video"])',
  "expect(imageResponse.status()).toBe(201)",
  "assertOwnedImageInLibrary",
  "assertOwnedVideoInLibrary",
  "verifyIsolation",
  'page.reload({ waitUntil: "domcontentloaded" })',
  'name: "خروج"',
]) {
  requireText(e2eSpec, needle, "AI media browser E2E");
}

console.log(`AI media hardening verification passed (${checks} assertions).`);