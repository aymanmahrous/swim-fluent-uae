import { createFileRoute } from "@tanstack/react-router";

import { createGoneResponse } from "@/lib/gone-response";

export const Route = createFileRoute("/en/tools/")({
  server: {
    handlers: {
      GET: async () => createGoneResponse(),
    },
  },
});
