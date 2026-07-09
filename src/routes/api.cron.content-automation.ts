import { createFileRoute } from "@tanstack/react-router";
import { runContentAutomationCycle } from "../platform/content-automation.server";
import { authenticateContentAutomationRequest } from "../platform/cron-auth.server";

export const Route = createFileRoute("/api/cron/content-automation")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const source = await authenticateContentAutomationRequest(request);
        if (!source) {
          return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        }

        const result = await runContentAutomationCycle(source);
        return Response.json(result.body, {
          status: result.status,
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
