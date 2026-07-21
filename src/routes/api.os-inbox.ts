import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const ModeSchema = z.object({
  conversationId: z.string().uuid(),
  mode: z.enum(["ai_active", "human_takeover", "human_required", "paused"]),
});

export const Route = createFileRoute("/api/os-inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        const url = new URL(request.url);
        const conversationId = url.searchParams.get("conversationId");
        const response = conversationId
          ? await staffRpc(session.accessToken, "get_staff_conversation_messages", {
              p_conversation_id: conversationId,
            })
          : await staffRpc(session.accessToken, "get_staff_inbox");

        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
      PATCH: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        if (!hasStaffPermission(session.profile.role, "conversation.mode.update")) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const body: unknown = await request.json().catch(() => null);
        const parsed = ModeSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const response = await staffRpc(session.accessToken, "set_staff_conversation_mode", {
          p_conversation_id: parsed.data.conversationId,
          p_mode: parsed.data.mode,
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
