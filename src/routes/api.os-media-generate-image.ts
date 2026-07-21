import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { assertMediaSignature } from "../platform/media-security.server";
import {
  persistProviderAssetBytes,
  persistRemoteProviderAsset,
} from "../platform/media-storage.server";
import { getImageProvider } from "../platform/provider-registry.server";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const RequestSchema = z.object({
  prompt: z.string().trim().min(2).max(2000),
  aspectRatio: z.enum(["1:1", "4:5", "5:4", "9:16", "16:9", "3:4", "4:3"]),
  contentItemId: z.string().uuid().nullable().optional(),
});

const AssetRecordSchema = z.object({
  success: z.literal(true),
  mediaAssetId: z.string().uuid(),
  assetType: z.literal("image"),
  storagePath: z.string().min(1),
  createdAt: z.string(),
});

const PUBLIC_ERROR_CODES = new Set([
  "IMAGE_GENERATION_FAILED",
  "IMAGE_PROVIDER_ASSET_MISSING",
  "IMAGE_SIGNATURE_INVALID",
  "PROVIDER_ASSET_EMPTY",
  "PROVIDER_ASSET_TOO_LARGE",
  "PROVIDER_ASSET_URL_INVALID",
  "PROVIDER_ASSET_URL_REJECTED",
  "PROVIDER_ASSET_HOST_REJECTED",
  "PROVIDER_ASSET_HOST_NOT_ALLOWLISTED",
  "PROVIDER_ASSET_REDIRECT_REJECTED",
  "PROVIDER_ASSET_DOWNLOAD_HEADER_REJECTED",
  "UNSUPPORTED_PROVIDER_ASSET_TYPE",
]);

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "IMAGE_GENERATION_FAILED";
  const candidate = message.split(":")[0].replace(/[^A-Z0-9_]/gi, "_").slice(0, 100);
  return PUBLIC_ERROR_CODES.has(candidate) ? candidate : "IMAGE_GENERATION_FAILED";
}

export const Route = createFileRoute("/api/os-media-generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!hasStaffPermission(session.profile.role, "media.generate")) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const provider = getImageProvider();
        if (!provider) {
          return Response.json(
            { success: false, code: "PROVIDER_NOT_READY" },
            { status: 503, headers: sessionCookieHeaders(session) },
          );
        }

        try {
          const generation = await provider.generateImage({
            prompt: parsed.data.prompt,
            aspectRatio: parsed.data.aspectRatio,
          });
          const assetBase64 = generation.assetBase64;
          const persisted = assetBase64
            ? await (async () => {
                const contentType = generation.contentType ?? "image/png";
                const bytes = new Uint8Array(Buffer.from(assetBase64, "base64"));
                assertMediaSignature(bytes, contentType, "image");
                return persistProviderAssetBytes({
                  bytes,
                  contentType,
                  accessToken: session.accessToken,
                  staffId: session.profile.id,
                  contentItemId: parsed.data.contentItemId ?? null,
                });
              })()
            : generation.assetUrl
              ? await persistRemoteProviderAsset({
                  providerId: provider.id,
                  providerUrl: generation.assetUrl,
                  accessToken: session.accessToken,
                  staffId: session.profile.id,
                  assetType: "image",
                  contentItemId: parsed.data.contentItemId ?? null,
                })
              : (() => {
                  throw new Error("IMAGE_PROVIDER_ASSET_MISSING");
                })();

          const recordResponse = await staffRpc(
            session.accessToken,
            "create_staff_media_asset_record",
            {
              p_content_item_id: parsed.data.contentItemId ?? null,
              p_asset_type: "image",
              p_storage_path: persisted.storagePath,
              p_provider: provider.id,
              p_provider_job_id: generation.providerRequestId ?? null,
              p_prompt: parsed.data.prompt,
              p_metadata: {
                aspectRatio: parsed.data.aspectRatio,
                contentType: persisted.contentType,
                sizeBytes: persisted.sizeBytes,
                uploadMode: persisted.uploadMode,
              },
            },
          );
          const recordBody: unknown = await recordResponse.json().catch(() => null);
          const record = AssetRecordSchema.safeParse(recordBody);
          if (!recordResponse.ok || !record.success) {
            return Response.json(
              { success: false, code: "MEDIA_RECORD_FAILED" },
              { status: 502, headers: sessionCookieHeaders(session) },
            );
          }

          return Response.json(
            {
              success: true,
              mediaAssetId: record.data.mediaAssetId,
              storagePath: persisted.storagePath,
              publicUrl: persisted.publicUrl,
              provider: provider.id,
              uploadMode: persisted.uploadMode,
            },
            { status: 201, headers: sessionCookieHeaders(session) },
          );
        } catch (error) {
          return Response.json(
            { success: false, code: safeCode(error) },
            { status: 502, headers: sessionCookieHeaders(session) },
          );
        }
      },
    },
  },
});