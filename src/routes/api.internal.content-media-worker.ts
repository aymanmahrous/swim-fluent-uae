import { createFileRoute } from "@tanstack/react-router";
import { processOneContentMediaJob } from "../platform/content-media-worker.server";
import { verifyInternalWorkerRequest } from "../platform/internal-auth.server";

export const Route = createFileRoute("/api/internal/content-media-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifyInternalWorkerRequest(request)) {
          return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        }

        const result = await processOneContentMediaJob();
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});
