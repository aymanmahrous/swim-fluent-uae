import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { persistRemoteProviderAsset } from "../platform/media-storage.server";
import { getImageProvider } from "../platform/provider-registry.server";
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

function allowedRole(role: string): boolean {
  return ["super_admin", "admin", "content_manager"].includes(role);
}

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "IMAGE_GENERATION_FAILED";
  return message.split(":")[0].replace(/[^A-Z0-9_]/gi, "_").slice(0, 100) || "IMAGE_GENERATION_FAILED";
}

export const Route = createFileRoute("/api/os-media-generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!allowedRole(session.profile.role)) {
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
          const persisted = await persistRemoteProviderAsset({
            providerId: provider.id,
            providerUrl: generation.assetUrl,
            accessToken: session.accessToken,
            staffId: session.profile.id,
            assetType: "image",
            contentItemId: parsed.data.contentItemId ?? null,
          });

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
