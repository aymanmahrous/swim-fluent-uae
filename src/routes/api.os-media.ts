import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { mediaSignedUrl } from "../platform/media-storage.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  createdBy: z.string().uuid(),
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

        try {
          const assets = await Promise.all(
            parsed.data.map(async (asset) => ({
              ...asset,
              publicUrl: asset.storagePath
                ? await mediaSignedUrl(asset.storagePath, session.accessToken)
                : null,
            })),
          );
          return Response.json(assets, { headers: sessionCookieHeaders(session) });
        } catch {
          return Response.json(
            { error: "MEDIA_SIGN_FAILED" },
            { status: 502, headers: sessionCookieHeaders(session) },
          );
        }
      },
    },
  },
});
