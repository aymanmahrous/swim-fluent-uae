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
  'active staff can read own media folder',
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

console.log(`AI media hardening verification passed (${checks} assertions).`);
