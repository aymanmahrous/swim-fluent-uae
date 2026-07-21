import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const RequestSchema = z.object({
  password: z.string().min(8).max(128),
});

export const Route = createFileRoute("/api/staff-password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
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
