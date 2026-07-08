import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/staff-password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null) as { password?: string } | null;
        if (!body?.password || body.password.length < 8) {
          return Response.json({ success: false, code: "INVALID_PASSWORD" }, { status: 400 });
        }

        // Password reset is completed through the Supabase recovery session.
        // This endpoint remains closed until a valid recovery session is attached.
        return Response.json(
          { success: false, code: "RECOVERY_SESSION_REQUIRED" },
          { status: 401 },
        );
      },
    },
  },
});
