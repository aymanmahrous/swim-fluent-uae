import { createFileRoute } from "@tanstack/react-router";
import { getProviderStatuses } from "../platform/provider-registry.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
} from "../platform/staff-session.server";

export const Route = createFileRoute("/api/os-integrations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        return new Response(JSON.stringify(getProviderStatuses()), {
          status: 200,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
