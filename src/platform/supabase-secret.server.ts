import { supabaseProjectUrl } from "./supabase-project.server";

const MEDIA_BUCKET = "relax-fix-media";
const PUBLISH_SIGNED_URL_TTL_SECONDS = 60 * 60;

function supabaseSecretKey(): string | null {
  const value = process.env.SUPABASE_SECRET_KEY?.trim();
  return value || null;
}

function encodedObjectPath(path: string): string {
  const normalized = path.trim();
  if (
    normalized.length < 1 ||
    normalized.length > 1024 ||
    normalized.startsWith("/") ||
    normalized.includes("..") ||
    !/^[A-Za-z0-9._/-]+$/.test(normalized)
  ) {
    throw new Error("INVALID_PRIVATE_MEDIA_STORAGE_PATH");
  }

  return normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function isSupabaseSecretConfigured(): boolean {
  return Boolean(supabaseSecretKey());
}

export async function supabaseSecretRpc(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<Response> {
  const key = supabaseSecretKey();
  if (!key) {
    return Response.json(
      { success: false, code: "SUPABASE_SECRET_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  return fetch(`${supabaseProjectUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  });
}

export async function createPublishingMediaSignedUrl(storagePath: string): Promise<string> {
  const key = supabaseSecretKey();
  if (!key) throw new Error("SUPABASE_SECRET_NOT_CONFIGURED");

  const response = await fetch(
    `${supabaseProjectUrl}/storage/v1/object/sign/${MEDIA_BUCKET}/${encodedObjectPath(storagePath)}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: PUBLISH_SIGNED_URL_TTL_SECONDS }),
    },
  );
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`SUPABASE_PUBLISH_MEDIA_SIGN_${response.status}`);
  }

  const signedURL =
    payload && typeof payload === "object" && "signedURL" in payload
      ? (payload as { signedURL?: unknown }).signedURL
      : null;
  if (typeof signedURL !== "string" || signedURL.length < 1) {
    throw new Error("SUPABASE_PUBLISH_MEDIA_SIGN_INVALID_RESPONSE");
  }

  const storageApiBase = `${supabaseProjectUrl}/storage/v1`;
  return encodeURI(
    signedURL.startsWith("https://")
      ? signedURL
      : `${storageApiBase}${signedURL.startsWith("/") ? "" : "/"}${signedURL}`,
  );
}
