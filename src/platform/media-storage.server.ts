import { isIP } from "node:net";
import * as tus from "tus-js-client";
import { supabaseProjectUrl, supabasePublishableKey } from "./supabase-project.server";

export const MEDIA_BUCKET = "relax-fix-media";
const STANDARD_UPLOAD_LIMIT = 6 * 1024 * 1024;
const MAX_PROVIDER_ASSET_BYTES = 100 * 1024 * 1024;
const MAX_PROVIDER_REDIRECTS = 3;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const providerHostSuffixes: Readonly<Record<string, readonly string[]>> = {
  "alibaba-wan-image": ["aliyuncs.com", "alicdn.com"],
  "alibaba-wan-video": ["aliyuncs.com", "alicdn.com"],
};

function encodedObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function extensionFor(contentType: string, assetType: "image" | "video"): string {
  if (assetType === "video") return "mp4";
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  return "png";
}

function allowedContentType(contentType: string, assetType: "image" | "video"): boolean {
  if (assetType === "video") return contentType === "video/mp4";
  return ["image/png", "image/jpeg", "image/webp"].includes(contentType);
}

function allowedProviderUrl(providerId: string, candidate: string): URL {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("PROVIDER_ASSET_URL_INVALID");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error("PROVIDER_ASSET_URL_REJECTED");
  }
  if (isIP(url.hostname) !== 0 || url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
    throw new Error("PROVIDER_ASSET_HOST_REJECTED");
  }

  const suffixes = providerHostSuffixes[providerId];
  if (!suffixes?.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`))) {
    throw new Error("PROVIDER_ASSET_HOST_NOT_ALLOWLISTED");
  }
  return url;
}

async function fetchProviderAsset(
  providerId: string,
  providerUrl: string,
  assetType: "image" | "video",
): Promise<Response> {
  let current = allowedProviderUrl(providerId, providerUrl);

  for (let redirects = 0; redirects <= MAX_PROVIDER_REDIRECTS; redirects += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: assetType === "video" ? "video/mp4" : "image/*" },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get("location");
    if (!location || redirects === MAX_PROVIDER_REDIRECTS) {
      throw new Error("PROVIDER_ASSET_REDIRECT_REJECTED");
    }
    current = allowedProviderUrl(providerId, new URL(location, current).toString());
  }

  throw new Error("PROVIDER_ASSET_REDIRECT_REJECTED");
}

function objectPath(input: {
  staffId: string;
  assetType: "image" | "video";
  contentItemId?: string | null;
  contentType: string;
  deterministicId?: string;
}): string {
  const group = input.contentItemId ?? "standalone";
  const id = input.deterministicId ?? crypto.randomUUID();
  const extension = extensionFor(input.contentType, input.assetType);
  return `${input.staffId}/${input.assetType}/${group}/${id}.${extension}`;
}

function storageObjectUrl(path: string): string {
  return `${supabaseProjectUrl}/storage/v1/object/${MEDIA_BUCKET}/${encodedObjectPath(path)}`;
}

// The legacy publicObjectExists(path) probe is intentionally replaced by an authenticated HEAD.
async function authenticatedObjectExists(path: string, accessToken: string): Promise<boolean> {
  const response = await fetch(storageObjectUrl(path), {
    method: "HEAD",
    cache: "no-store",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => null);
  return Boolean(response?.ok);
}

export async function mediaSignedUrl(storagePath: string, accessToken: string): Promise<string> {
  const response = await fetch(
    `${supabaseProjectUrl}/storage/v1/object/sign/${MEDIA_BUCKET}/${encodedObjectPath(storagePath)}`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
    },
  );
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`SUPABASE_STORAGE_SIGN_${response.status}`);
  }
  const signedURL =
    payload && typeof payload === "object" && "signedURL" in payload
      ? (payload as { signedURL?: unknown }).signedURL
      : null;
  if (typeof signedURL !== "string" || signedURL.length < 1) {
    throw new Error("SUPABASE_STORAGE_SIGN_INVALID_RESPONSE");
  }
  const storageApiBase = `${supabaseProjectUrl}/storage/v1`;
  return encodeURI(
    signedURL.startsWith("https://")
      ? signedURL
      : `${storageApiBase}${signedURL.startsWith("/") ? "" : "/"}${signedURL}`,
  );
}

async function standardUpload(
  path: string,
  bytes: Uint8Array,
  contentType: string,
  accessToken: string,
): Promise<void> {
  const uploadBytes = new Uint8Array(bytes.byteLength);
  uploadBytes.set(bytes);
  const response = await fetch(storageObjectUrl(path), {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
      "Cache-Control": "max-age=3600",
      "x-upsert": "false",
    },
    body: uploadBytes.buffer,
  });

  if (response.ok) return;
  const detail = await response.text();
  if (response.status === 400 && /already exists|duplicate/i.test(detail)) return;
  if (await authenticatedObjectExists(path, accessToken)) return;
  throw new Error(`SUPABASE_STORAGE_UPLOAD_${response.status}:${detail}`.slice(0, 1000));
}

async function resumableUpload(
  path: string,
  bytes: Uint8Array,
  contentType: string,
  accessToken: string,
): Promise<void> {
  const projectRef = new URL(supabaseProjectUrl).hostname.split(".")[0];
  const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(Buffer.from(bytes), {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: supabasePublishableKey,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: MEDIA_BUCKET,
        objectName: path,
        contentType,
        cacheControl: "3600",
      },
      chunkSize: STANDARD_UPLOAD_LIMIT,
      onError(error) {
        void authenticatedObjectExists(path, accessToken)
          .then((exists) => {
            if (exists) {
              resolve();
              return;
            }
            reject(new Error(`SUPABASE_TUS_UPLOAD_FAILED:${error.message}`.slice(0, 1000)));
          })
          .catch(() => {
            reject(new Error(`SUPABASE_TUS_UPLOAD_FAILED:${error.message}`.slice(0, 1000)));
          });
      },
      onSuccess() {
        resolve();
      },
    });

    upload.start();
  });
}

export async function persistRemoteProviderAsset(input: {
  providerId: string;
  providerUrl: string;
  accessToken: string;
  staffId: string;
  assetType: "image" | "video";
  contentItemId?: string | null;
  deterministicId?: string;
}): Promise<{
  storagePath: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
  uploadMode: "standard" | "tus";
}> {
  const response = await fetchProviderAsset(input.providerId, input.providerUrl, input.assetType);
  if (!response.ok) throw new Error(`PROVIDER_ASSET_DOWNLOAD_${response.status}`);

  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!allowedContentType(contentType, input.assetType)) {
    throw new Error(`UNSUPPORTED_PROVIDER_ASSET_TYPE:${contentType || "unknown"}`);
  }

  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PROVIDER_ASSET_BYTES) {
    throw new Error("PROVIDER_ASSET_TOO_LARGE");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 1) throw new Error("PROVIDER_ASSET_EMPTY");
  if (bytes.byteLength > MAX_PROVIDER_ASSET_BYTES) throw new Error("PROVIDER_ASSET_TOO_LARGE");

  const storagePath = objectPath({
    staffId: input.staffId,
    assetType: input.assetType,
    contentItemId: input.contentItemId,
    contentType,
    deterministicId: input.deterministicId,
  });
  const useTus = input.assetType === "video" && bytes.byteLength > STANDARD_UPLOAD_LIMIT;

  if (useTus) {
    await resumableUpload(storagePath, bytes, contentType, input.accessToken);
  } else {
    await standardUpload(storagePath, bytes, contentType, input.accessToken);
  }

  return {
    storagePath,
    publicUrl: await mediaSignedUrl(storagePath, input.accessToken),
    contentType,
    sizeBytes: bytes.byteLength,
    uploadMode: useTus ? "tus" : "standard",
  };
}
