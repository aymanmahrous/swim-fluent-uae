import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { updateRecoveredPassword } from "../platform/password-recovery.server";

const PasswordSchema = z
  .string()
  .min(10)
  .max(200)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/);
const RequestSchema = z.object({ accessToken: z.string().min(20), password: PasswordSchema });

export const Route = createFileRoute("/api/password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body: unknown = await request.json().catch(() => null);
        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "WEAK_OR_INVALID_PASSWORD" }, { status: 400 });
        }
        const result = await updateRecoveredPassword(parsed.data.accessToken, parsed.data.password);
        if (result === "invalid_session") {
          return Response.json({ success: false, code: "RECOVERY_SESSION_INVALID" }, { status: 401 });
        }
        if (result === "update_failed") {
          return Response.json({ success: false, code: "PASSWORD_UPDATE_FAILED" }, { status: 502 });
        }
        return Response.json(
          { success: true },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
