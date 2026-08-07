import { createFileRoute, redirect } from "@tanstack/react-router";

const destination = "/#pricing";

export const Route = createFileRoute("/pricing")({
  server: { handlers: { GET: async () => new Response(null, { status: 308, headers: { Location: destination, "Cache-Control": "public, max-age=300" } }) } },
  beforeLoad: () => { throw redirect({ href: destination, replace: true }); },
});
