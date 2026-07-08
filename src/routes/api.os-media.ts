import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { mediaPublicUrl } from "../platform/media-storage.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  contentItemId: z.string().uuid().nullable(),
  assetType: z.enum(["image", "video", "logo", "other"]),
  source: z.enum(["upload", "ai_generated", "external"]),
  storagePath: z.string().nullable(),
  provider: z.string().nullable(),
  providerJobId: z.string().nullable(),
  prompt: z.string().nullable(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

export const Route = createFileRoute("/api/os-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        const response = await staffRpc(session.accessToken, "get_staff_media_assets");
        const body: unknown = await response.json().catch(() => null);
        const parsed = z.array(MediaAssetSchema).safeParse(body);
        if (!response.ok || !parsed.success) {
          return Response.json(
            { error: "MEDIA_READ_FAILED" },
            { status: response.ok ? 502 : response.status, headers: sessionCookieHeaders(session) },
          );
        }

        return Response.json(
          parsed.data.map((asset) => ({
            ...asset,
            publicUrl: asset.storagePath ? mediaPublicUrl(asset.storagePath) : null,
          })),
          { headers: sessionCookieHeaders(session) },
        );
      },
    },
  },
});
