import { createFileRoute } from "@tanstack/react-router";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

function allowedRole(role: string): boolean {
  return ["super_admin", "admin", "content_manager"].includes(role);
}

export const Route = createFileRoute("/api/os-media-video-jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!allowedRole(session.profile.role)) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const response = await staffRpc(session.accessToken, "get_staff_video_generation_jobs");
        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
