import { createFileRoute } from "@tanstack/react-router";

const GONE_BODY = "This legacy URL has been permanently removed.";

export const Route = createFileRoute("/gone")({
  server: {
    handlers: {
      GET: async () =>
        new Response(GONE_BODY, {
          status: 410,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }),
    },
  },
});
