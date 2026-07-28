import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ar/contact")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.redirect(new URL("/#contact", request.url), 308),
    },
  },
});
