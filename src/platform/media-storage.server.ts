import * as tus from "tus-js-client";
import { supabaseProjectUrl, supabasePublishableKey } from "./supabase-project.server";

export const MEDIA_BUCKET = "relax-fix-media";
const STANDARD_UPLOAD_LIMIT = 6 * 1024 * 1024;
const MAX_PROVIDER_ASSET_BYTES = 100 * 1024 * 1024;

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

async function standardUpload(
  path: string,
  bytes: Uint8Array,
  contentType: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `${supabaseProjectUrl}/storage/v1/object/${MEDIA_BUCKET}/${encodedObjectPath(path)}`,
    {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: bytes,
    },
  );

  if (response.ok) return;
  const detail = await response.text();
  if (response.status === 400 && /already exists|duplicate/i.test(detail)) return;
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
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: MEDIA_BUCKET,
        objectName: path,
        contentType,
        cacheControl: "31536000",
      },
      chunkSize: STANDARD_UPLOAD_LIMIT,
      onError(error) {
        reject(new Error(`SUPABASE_TUS_UPLOAD_FAILED:${error.message}`.slice(0, 1000)));
      },
      onSuccess() {
        resolve();
      },
    });

    upload.start();
  });
}

export function mediaPublicUrl(storagePath: string): string {
  return encodeURI(
    `${supabaseProjectUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${encodedObjectPath(storagePath)}`,
  );
}

export async function persistRemoteProviderAsset(input: {
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
  const response = await fetch(input.providerUrl, {
    method: "GET",
    headers: { Accept: input.assetType === "video" ? "video/mp4" : "image/*" },
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
    publicUrl: mediaPublicUrl(storagePath),
    contentType,
    sizeBytes: bytes.byteLength,
    uploadMode: useTus ? "tus" : "standard",
  };
}
