import { createFileRoute } from "@tanstack/react-router";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

export const Route = createFileRoute("/api/os-media-video-jobs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!hasStaffPermission(session.profile.role, "media.generate")) {
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
