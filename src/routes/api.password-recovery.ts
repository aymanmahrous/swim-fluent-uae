import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  passwordRecoveryAllowed,
  sendPasswordRecoveryEmail,
} from "../platform/password-recovery.server";

const RequestSchema = z.object({ email: z.string().email().max(320) });
const genericMessage = "إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.";
// ENUMERATION_SAFE_INVALID_INPUT: invalid recovery input intentionally receives the same
// generic 200 response as an unknown account so the endpoint does not disclose account state.

export const Route = createFileRoute("/api/password-recovery")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body: unknown = await request.json().catch(() => null);
        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: true, message: genericMessage }, { status: 200 });
        }
        if (!passwordRecoveryAllowed(request, parsed.data.email)) {
          return Response.json(
            { success: false, code: "RATE_LIMITED", message: genericMessage },
            { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "900" } },
          );
        }
        const sent = await sendPasswordRecoveryEmail(parsed.data.email);
        if (!sent) {
          return Response.json(
            { success: false, code: "RECOVERY_UNAVAILABLE", message: genericMessage },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
        return Response.json(
          { success: true, message: genericMessage },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
