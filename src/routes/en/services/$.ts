import { createFileRoute } from "@tanstack/react-router";

import { createGoneResponse } from "@/lib/gone-response";

export const Route = createFileRoute("/en/services/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
        if (pathname === "/en/services/motion-graphics") return createGoneResponse();
        return Response.redirect(new URL("/en#programs", request.url), 308);
      },
    },
  },
});
