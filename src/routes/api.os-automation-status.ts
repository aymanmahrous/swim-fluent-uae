import { createFileRoute } from "@tanstack/react-router";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

export const Route = createFileRoute("/api/os-automation-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
        if (!hasStaffPermission(session.profile.role, "automation.status.read")) {
          return Response.json(
            { error: "FORBIDDEN" },
            { status: 403, headers: sessionCookieHeaders(session) },
          );
        }

        const response = await staffRpc(
          session.accessToken,
          "get_staff_content_automation_status",
        );
        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
