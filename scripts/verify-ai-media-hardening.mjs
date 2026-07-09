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
forbidText(storage, "/object/public/", "private media storage");
forbidText(storage, "SUPABASE_SECRET_KEY", "private media storage");
forbidText(storage, "SUPABASE_SERVICE_ROLE_KEY", "private media storage");

const mediaApi = await text("src/routes/api.os-media.ts");
requireText(mediaApi, "createdBy", "media API ownership");
requireText(mediaApi, "mediaSignedUrl", "media API signed URLs");
requireText(mediaApi, '"MEDIA_SIGN_FAILED"', "media API signed URLs");
requireText(mediaApi, "resolveStaffSession", "media API auth");

const videoRoute = await text("src/routes/api.os-media-generate-video.ts");
requireText(videoRoute, "mediaSignedUrl", "video route signed URLs");
requireText(videoRoute, "getVideoProviderById(job.data.provider)", "video route provider resume");
requireText(videoRoute, '"STORED_PROVIDER_NOT_READY"', "video route provider resume");

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
  'EXPECTED_REF = "refs/pull/9/merge"',
  'event_name: z.literal("pull_request")',
  "RSASSA-PKCS1-v1_5",
  "crypto.subtle.verify",
]) {
  requireText(oidc, needle, "GitHub Actions OIDC verifier");
}
forbidText(oidc, "SUPABASE_SECRET_KEY", "GitHub Actions OIDC verifier");

const e2eRoute = await text("src/routes/api.internal.ai-media-e2e.ts");
for (const needle of [
  'process.env.VERCEL_ENV === "preview"',
  'process.env.VERCEL_GIT_COMMIT_REF === EXPECTED_PREVIEW_BRANCH',
  "verifyGithubActionsOidc",
  'action: z.literal("provision")',
  'action: z.literal("cleanup")',
]) {
  requireText(e2eRoute, needle, "preview E2E control route");
}
forbidText(e2eRoute, "SUPABASE_SECRET_KEY", "preview E2E control route");
forbidText(e2eRoute, "ALIBABA_MODEL_STUDIO_API_KEY", "preview E2E control route");

const e2eAdmin = await text("src/platform/ai-media-e2e-admin.server.ts");
requireText(e2eAdmin, "process.env.SUPABASE_SECRET_KEY", "E2E admin helper");
requireText(e2eAdmin, 'headers.set("apikey", secretKey())', "E2E admin helper");
requireText(e2eAdmin, 'E2E_PURPOSE = "relax-fix-ai-media-e2e"', "E2E admin helper");
requireText(e2eAdmin, "user.user_metadata.purpose !== E2E_PURPOSE", "E2E cleanup guard");
forbidText(e2eAdmin, "SUPABASE_SERVICE_ROLE_KEY", "E2E admin helper");

const e2eClient = await text("scripts/ai-media-e2e-admin.mjs");
requireText(e2eClient, "ACTIONS_ID_TOKEN_REQUEST_URL", "E2E GitHub client");
requireText(e2eClient, "ACTIONS_ID_TOKEN_REQUEST_TOKEN", "E2E GitHub client");
requireText(e2eClient, 'console.log(`::add-mask::${user.password}`)', "E2E credential masking");
forbidText(e2eClient, "SUPABASE_SECRET_KEY", "E2E GitHub client");
forbidText(e2eClient, "ALIBABA_MODEL_STUDIO_API_KEY", "E2E GitHub client");

const e2eSpec = await text("tests/e2e/ai-media.spec.ts");
for (const needle of [
  "/api/os-media-generate-image",
  'provider: z.literal("alibaba-wan-image")',
  'provider: z.literal("alibaba-wan-video")',
  "assertOwnedImageInLibrary",
  "assertOwnedVideoInLibrary",
  "verifyIsolation",
  'page.reload({ waitUntil: "domcontentloaded" })',
  'name: "خروج"',
]) {
  requireText(e2eSpec, needle, "AI media browser E2E");
}

console.log(`AI media hardening verification passed (${checks} assertions).`);
