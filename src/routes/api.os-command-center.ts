import { createFileRoute } from "@tanstack/react-router";
import { getProviderStatuses } from "../platform/provider-registry.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

export const Route = createFileRoute("/api/os-command-center")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        const response = await staffRpc(session.accessToken, "get_staff_command_center");
        if (!response.ok) {
          return new Response(await response.text(), {
            status: response.status,
            headers: sessionCookieHeaders(session),
          });
        }

        const dashboard: unknown = await response.json();
        return new Response(
          JSON.stringify({ dashboard, providers: getProviderStatuses() }),
          { status: 200, headers: sessionCookieHeaders(session) },
        );
      },
    },
  },
});
