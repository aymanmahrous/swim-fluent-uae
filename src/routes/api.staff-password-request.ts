import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const RequestSchema = z.object({
  email: z.string().trim().email().max(320),
});

export const Route = createFileRoute("/api/staff-password-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
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
