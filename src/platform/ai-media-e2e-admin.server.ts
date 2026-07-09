import { z } from "zod";
import { MEDIA_BUCKET } from "./media-storage.server";
import { supabaseProjectUrl } from "./supabase-project.server";

const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable().optional(),
});

const MediaRowsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    storage_path: z.string().nullable(),
  }),
);

const VideoRowsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    storage_path: z.string().nullable(),
  }),
);

export type TemporaryStaff = {
  userId: string;
  email: string;
  password: string;
};

function secretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SECRET_NOT_CONFIGURED");
  return key;
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("apikey", secretKey());
  headers.set("Accept", "application/json");
  headers.set("Cache-Control", "no-store");
  headers.set("User-Agent", "relax-fix-ai-media-e2e-server/1.0");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${supabaseProjectUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

async function requireOk(response: Response, code: string): Promise<void> {
  if (response.ok) return;
  throw new Error(`${code}_${response.status}`);
}

function password(): string {
  return `${crypto.randomUUID()}Aa1!${crypto.randomUUID()}`;
}

async function deleteAuthUser(userId: string): Promise<void> {
  const response = await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (response.ok || response.status === 404) return;
  throw new Error(`E2E_AUTH_USER_DELETE_${response.status}`);
}

export async function provisionTemporaryStaff(label: string): Promise<TemporaryStaff> {
  const email = `rf-e2e-${crypto.randomUUID()}@example.com`;
  const generatedPassword = password();
  const userResponse = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: { purpose: "relax-fix-ai-media-e2e", label },
    }),
  });
  const userBody: unknown = await userResponse.json().catch(() => null);
  const user = AdminUserSchema.safeParse(userBody);
  if (!userResponse.ok || !user.success) {
    throw new Error(`E2E_AUTH_USER_CREATE_${userResponse.status}`);
  }

  const profileResponse = await adminFetch("/rest/v1/staff_profiles", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      id: user.data.id,
      display_name: `AI Media E2E ${label}`,
      role: "content_manager",
      active: true,
    }),
  });

  if (!profileResponse.ok) {
    await deleteAuthUser(user.data.id).catch(() => undefined);
    throw new Error(`E2E_STAFF_PROFILE_CREATE_${profileResponse.status}`);
  }

  return { userId: user.data.id, email, password: generatedPassword };
}

async function readOwnedStoragePaths(userId: string): Promise<string[]> {
  const encoded = encodeURIComponent(userId);
  const [mediaResponse, jobsResponse] = await Promise.all([
    adminFetch(
      `/rest/v1/media_assets?select=id,storage_path&created_by=eq.${encoded}`,
    ),
    adminFetch(
      `/rest/v1/ai_media_jobs?select=id,storage_path&requested_by=eq.${encoded}`,
    ),
  ]);
  await requireOk(mediaResponse, "E2E_MEDIA_READ");
  await requireOk(jobsResponse, "E2E_VIDEO_JOBS_READ");

  const media = MediaRowsSchema.safeParse(await mediaResponse.json().catch(() => null));
  const jobs = VideoRowsSchema.safeParse(await jobsResponse.json().catch(() => null));
  if (!media.success || !jobs.success) throw new Error("E2E_CLEANUP_ROWS_INVALID");

  return Array.from(
    new Set(
      [...media.data, ...jobs.data]
        .map((row) => row.storage_path)
        .filter((path): path is string => Boolean(path)),
    ),
  );
}

async function deleteStorageObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const response = await adminFetch(`/storage/v1/object/${MEDIA_BUCKET}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: paths }),
  });
  await requireOk(response, "E2E_STORAGE_DELETE");
}

async function deleteRows(table: string, column: string, userId: string): Promise<void> {
  const response = await adminFetch(
    `/rest/v1/${table}?${column}=eq.${encodeURIComponent(userId)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  await requireOk(response, `E2E_${table.toUpperCase()}_DELETE`);
}

export async function cleanupTemporaryStaff(userId: string): Promise<void> {
  const paths = await readOwnedStoragePaths(userId);
  await deleteStorageObjects(paths);
  await deleteRows("media_assets", "created_by", userId);
  await deleteRows("ai_media_jobs", "requested_by", userId);
  await deleteRows("audit_logs", "actor_id", userId);
  await deleteRows("staff_profiles", "id", userId);
  await deleteAuthUser(userId);
}
