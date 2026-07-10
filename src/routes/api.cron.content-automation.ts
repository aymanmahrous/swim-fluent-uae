import { createFileRoute } from "@tanstack/react-router";
import { runContentAutomationCycle } from "../platform/content-automation.server";
import { authenticateContentAutomationRequest } from "../platform/cron-auth.server";

export const Route = createFileRoute("/api/cron/content-automation")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await authenticateContentAutomationRequest(request);
        if (!auth.authenticated) {
          return Response.json(
            { success: false, code: auth.code },
            {
              status: auth.status,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }

        const result = await runContentAutomationCycle(auth.source);
        return Response.json(result.body, {
          status: result.status,
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
