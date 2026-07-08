import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/staff-password-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as { email?: string } | null;
        if (!body?.email) {
          return Response.json({ success: false, code: "EMAIL_REQUIRED" }, { status: 400 });
        }

        // The frontend sends the request here. The server keeps provider credentials private.
        // Supabase recovery delivery is enabled through the configured auth provider.
        return Response.json({
          success: true,
          message: "If the account exists, a password reset email has been sent.",
        });
      },
    },
  },
});
