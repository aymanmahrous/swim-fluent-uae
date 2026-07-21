import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const UpdateContentSchema = z.object({
  contentItemId: z.string().uuid(),
  topic: z.string().trim().max(300),
  hook: z.string().trim().max(500),
  caption: z.string().trim().min(2).max(5000),
  cta: z.string().trim().max(500),
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30),
  visualPrompt: z.string().trim().max(2000),
});

export const Route = createFileRoute("/api/os-content-update")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        if (!hasStaffPermission(session.profile.role, "content.item.update")) {
          return Response.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        const body: unknown = await request.json().catch(() => null);
        const parsed = UpdateContentSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const response = await staffRpc(session.accessToken, "update_staff_content_item", {
          p_content_item_id: parsed.data.contentItemId,
          p_topic: parsed.data.topic,
          p_hook: parsed.data.hook,
          p_caption: parsed.data.caption,
          p_cta: parsed.data.cta,
          p_hashtags: parsed.data.hashtags,
          p_visual_prompt: parsed.data.visualPrompt,
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
