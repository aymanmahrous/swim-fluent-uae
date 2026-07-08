import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  clearSessionCookieHeaders,
  resolveStaffSession,
  revokeStaffSession,
  sessionCookieHeaders,
  signInStaff,
} from "../platform/staff-session.server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const Route = createFileRoute("/api/staff-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) {
          return Response.json({ authenticated: false }, { status: 401 });
        }
        return new Response(
          JSON.stringify({ authenticated: true, profile: session.profile }),
          { status: 200, headers: sessionCookieHeaders(session) },
        );
      },
      POST: async ({ request }) => {
        const body: unknown = await request.json().catch(() => null);
        const parsed = LoginSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const session = await signInStaff(parsed.data.email, parsed.data.password);
        if (!session) {
          return Response.json(
            { success: false, code: "INVALID_CREDENTIALS_OR_NOT_STAFF" },
            { status: 401 },
          );
        }

        return new Response(
          JSON.stringify({ success: true, profile: session.profile }),
          { status: 200, headers: sessionCookieHeaders(session) },
        );
      },
      DELETE: async ({ request }) => {
        await revokeStaffSession(request);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: clearSessionCookieHeaders(),
        });
      },
    },
  },
});
