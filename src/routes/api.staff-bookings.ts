import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const UpdateSchema = z.object({
  bookingRequestId: z.string().uuid(),
  status: z.enum(["pending", "contacted", "confirmed", "declined", "cancelled"]),
});

export const Route = createFileRoute("/api/staff-bookings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        const response = await staffRpc(session.accessToken, "get_staff_bookings");
        const body = await response.text();
        return new Response(body, {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
      PATCH: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        const body: unknown = await request.json().catch(() => null);
        const parsed = UpdateSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const response = await staffRpc(session.accessToken, "update_booking_request_status", {
          p_booking_request_id: parsed.data.bookingRequestId,
          p_status: parsed.data.status,
        });
        const responseBody = await response.text();
        return new Response(responseBody, {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
