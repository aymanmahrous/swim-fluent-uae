import { createFileRoute } from "@tanstack/react-router";

import { createGoneResponse } from "@/lib/gone-response";

export const Route = createFileRoute("/video")({
  server: {
    handlers: {
      GET: async () => createGoneResponse(),
    },
  },
});
