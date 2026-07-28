import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/en/services/")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.redirect(new URL("/en#programs", request.url), 308),
    },
  },
});
