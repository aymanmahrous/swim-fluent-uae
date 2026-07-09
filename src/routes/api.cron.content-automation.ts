import { createFileRoute } from "@tanstack/react-router";
import { runContentAutomationCycle } from "../platform/content-automation.server";
import { isCronConfigured, verifyCronRequest } from "../platform/cron-auth.server";

export const Route = createFileRoute("/api/cron/content-automation")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isCronConfigured()) {
          return Response.json(
            { success: false, code: "CRON_SECRET_NOT_CONFIGURED" },
            { status: 503 },
          );
        }
        if (!verifyCronRequest(request)) {
          return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        }

        const result = await runContentAutomationCycle("vercel_cron");
        return Response.json(result.body, {
          status: result.status,
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
