import { createFileRoute } from "@tanstack/react-router";
import { verifyInternalWorkerRequest } from "../platform/internal-auth.server";
import { processOnePublishJob } from "../platform/publish-worker.server";

export const Route = createFileRoute("/api/internal/publish-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifyInternalWorkerRequest(request)) {
          return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        }

        const result = await processOnePublishJob();
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});
