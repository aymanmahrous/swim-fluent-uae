import { isIP } from "node:net";
import { supabaseProjectUrl } from "./supabase-project.server";
import { supabaseServerKeyHeaders } from "./supabase-server-key.server";

const MEDIA_BUCKET = "relax-fix-media";
const MAX_PROVIDER_ASSET_BYTES = 100 * 1024 * 1024;
const MAX_PROVIDER_REDIRECTS = 3;

const providerHostSuffixes: Readonly<Record<string, readonly string[]>> = {
  "alibaba-wan-image": ["aliyuncs.com", "alicdn.com"],
  "alibaba-wan-video": ["aliyuncs.com", "alicdn.com"],
  "google-veo": ["googleapis.com", "googleusercontent.com"],
};

type PersistedWorkerAsset = {
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  uploadMode: "standard";
};

function secretKey(): string {
  const value = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!value) throw new Error("SUPABASE_SECRET_NOT_CONFIGURED");
  return value;
}

function safeUuid(value: string, code: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw new Error(code);
  }
  return normalized;
}

function extensionFor(contentType: string, assetType: "image" | "video"): string {
  if (assetType === "video") return "mp4";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  return "png";
}

function allowedContentType(contentType: string, assetType: "image" | "video"): boolean {
  if (assetType === "video") return contentType === "video/mp4";
  return ["image/png", "image/jpeg", "image/webp"].includes(contentType);
}

function storagePath(input: {
  requestedBy: string;
  assetType: "image" | "video";
  contentItemId: string;
  jobId: string;
  contentType: string;
}): string {
  const requestedBy = safeUuid(input.requestedBy, "INVALID_CONTENT_MEDIA_OWNER");
  const contentItemId = safeUuid(input.contentItemId, "INVALID_CONTENT_MEDIA_CONTENT_ID");
  const jobId = safeUuid(input.jobId, "INVALID_CONTENT_MEDIA_JOB_ID");
  const extension = extensionFor(input.contentType, input.assetType);
  return `${requestedBy}/${input.assetType}/${contentItemId}/autonomous-${jobId}.${extension}`;
}

function encodedObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function storageObjectUrl(path: string): string {
  return `${supabaseProjectUrl}/storage/v1/object/${MEDIA_BUCKET}/${encodedObjectPath(path)}`;
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

function providerDownloadHeaders(
  providerId: string,
  candidate?: Record<string, string>,
): Record<string, string> {
  if (!candidate) return {};
  const allowed = providerId === "google-veo" ? new Set(["x-goog-api-key"]) : new Set<string>();
  const result: Record<string, string> = {};
  for (const [name, rawValue] of Object.entries(candidate)) {
    const normalizedName = name.trim().toLowerCase();
    const normalizedValue = rawValue.trim();
    if (!allowed.has(normalizedName) || !normalizedValue || /[\r\n]/.test(normalizedValue)) {
      throw new Error("PROVIDER_ASSET_DOWNLOAD_HEADER_REJECTED");
    }
    result[normalizedName] = normalizedValue;
  }
  return result;
}

async function fetchProviderAsset(input: {
  providerId: string;
  providerUrl: string;
  assetType: "image" | "video";
  downloadHeaders?: Record<string, string>;
}): Promise<Response> {
  let current = allowedProviderUrl(input.providerId, input.providerUrl);
  const safeHeaders = providerDownloadHeaders(input.providerId, input.downloadHeaders);

  for (let redirects = 0; redirects <= MAX_PROVIDER_REDIRECTS; redirects += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: input.assetType === "video" ? "video/mp4" : "image/*",
        ...safeHeaders,
      },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get("location");
    if (!location || redirects === MAX_PROVIDER_REDIRECTS) {
      throw new Error("PROVIDER_ASSET_REDIRECT_REJECTED");
    }
    current = allowedProviderUrl(input.providerId, new URL(location, current).toString());
  }

  throw new Error("PROVIDER_ASSET_REDIRECT_REJECTED");
}

async function authenticatedObjectExists(path: string): Promise<boolean> {
  const response = await fetch(storageObjectUrl(path), {
    method: "HEAD",
    cache: "no-store",
    headers: { apikey: secretKey(), ...supabaseServerKeyHeaders() },
  }).catch(() => null);
  return Boolean(response?.ok);
}

async function standardUpload(
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  const uploadBytes = new Uint8Array(bytes.byteLength);
  uploadBytes.set(bytes);
  const response = await fetch(storageObjectUrl(path), {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: secretKey(),
      ...supabaseServerKeyHeaders(),
      "Content-Type": contentType,
      "Cache-Control": "max-age=3600",
      "x-upsert": "false",
    },
    body: uploadBytes.buffer,
  });

  if (response.ok) return;
  const detail = await response.text();
  if (response.status === 400 && /already exists|duplicate/i.test(detail)) return;
  if (await authenticatedObjectExists(path)) return;
  throw new Error(`SUPABASE_CONTENT_MEDIA_UPLOAD_${response.status}:${detail}`.slice(0, 1000));
}

async function persistBytes(input: {
  bytes: Uint8Array;
  contentType: string;
  requestedBy: string;
  assetType: "image" | "video";
  contentItemId: string;
  jobId: string;
}): Promise<PersistedWorkerAsset> {
  const contentType = input.contentType.split(";")[0].trim().toLowerCase();
  if (!allowedContentType(contentType, input.assetType)) {
    throw new Error(`UNSUPPORTED_PROVIDER_ASSET_TYPE:${contentType || "unknown"}`);
  }
  if (input.bytes.byteLength < 1) throw new Error("PROVIDER_ASSET_EMPTY");
  if (input.bytes.byteLength > MAX_PROVIDER_ASSET_BYTES) throw new Error("PROVIDER_ASSET_TOO_LARGE");

  const path = storagePath({
    requestedBy: input.requestedBy,
    assetType: input.assetType,
    contentItemId: input.contentItemId,
    jobId: input.jobId,
    contentType,
  });
  await standardUpload(path, input.bytes, contentType);

  return {
    storagePath: path,
    contentType,
    sizeBytes: input.bytes.byteLength,
    uploadMode: "standard",
  };
}

export async function persistContentMediaImageBytes(input: {
  base64: string;
  contentType: "image/png" | "image/jpeg" | "image/webp";
  requestedBy: string;
  contentItemId: string;
  jobId: string;
}): Promise<PersistedWorkerAsset> {
  const bytes = new Uint8Array(Buffer.from(input.base64, "base64"));
  return persistBytes({
    bytes,
    contentType: input.contentType,
    requestedBy: input.requestedBy,
    assetType: "image",
    contentItemId: input.contentItemId,
    jobId: input.jobId,
  });
}

export async function persistContentMediaRemoteAsset(input: {
  providerId: string;
  providerUrl: string;
  downloadHeaders?: Record<string, string>;
  requestedBy: string;
  assetType: "image" | "video";
  contentItemId: string;
  jobId: string;
}): Promise<PersistedWorkerAsset> {
  const response = await fetchProviderAsset({
    providerId: input.providerId,
    providerUrl: input.providerUrl,
    assetType: input.assetType,
    downloadHeaders: input.downloadHeaders,
  });
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
  return persistBytes({
    bytes,
    contentType,
    requestedBy: input.requestedBy,
    assetType: input.assetType,
    contentItemId: input.contentItemId,
    jobId: input.jobId,
  });
}
