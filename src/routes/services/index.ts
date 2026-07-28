import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services/")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.redirect(new URL("/#programs", request.url), 308),
    },
  },
});
