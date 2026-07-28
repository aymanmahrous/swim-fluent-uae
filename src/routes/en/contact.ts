import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/en/contact")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.redirect(new URL("/en#contact", request.url), 308),
    },
  },
});
