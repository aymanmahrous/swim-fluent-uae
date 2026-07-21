import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const TransitionSchema = z.discriminatedUnion("action", [
  z.object({ contentItemId: z.string().uuid(), action: z.literal("approve") }),
  z.object({ contentItemId: z.string().uuid(), action: z.literal("return_to_review") }),
  z.object({
    contentItemId: z.string().uuid(),
    action: z.literal("schedule"),
    scheduledFor: z.string().datetime({ offset: true }),
  }),
  z.object({ contentItemId: z.string().uuid(), action: z.literal("unschedule") }),
]);

export const Route = createFileRoute("/api/os-content-transition")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        if (!hasStaffPermission(session.profile.role, "content.item.transition")) {
          return Response.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        const body: unknown = await request.json().catch(() => null);
        const parsed = TransitionSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const response = await staffRpc(
          session.accessToken,
          "transition_staff_content_item",
          {
            p_content_item_id: parsed.data.contentItemId,
            p_action: parsed.data.action,
            p_scheduled_for: parsed.data.action === "schedule" ? parsed.data.scheduledFor : null,
          },
        );

        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
