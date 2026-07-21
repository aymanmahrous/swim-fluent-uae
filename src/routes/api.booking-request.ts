import { createFileRoute } from "@tanstack/react-router";
import { abuseControlAllowed, rateLimitedResponse } from "../platform/abuse-control.server";
import {
  supabaseProjectUrl,
  supabasePublicHeaders,
} from "../platform/supabase-project.server";

export const Route = createFileRoute("/api/booking-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!abuseControlAllowed(request, {
          scope: "public-booking",
          windowMs: 15 * 60 * 1000,
          maxAttempts: 8,
        })) {
          return rateLimitedResponse(900);
        }

        try {
          const payload = await request.text();
          const response = await fetch(
            `${supabaseProjectUrl}/rest/v1/rpc/submit_booking_request`,
            {
              method: "POST",
              headers: {
                ...supabasePublicHeaders(),
                "Content-Type": "application/json",
              },
              body: payload,
            },
          );

          const body = await response.text();
          return new Response(body, {
            status: response.status,
            headers: {
              "Content-Type": response.headers.get("content-type") ?? "application/json",
              "Cache-Control": "no-store",
            },
          });
        } catch (error) {
          console.error("booking_request_proxy_failed", error);
          return Response.json(
            {
              success: false,
              code: "SERVER_ERROR",
              message: "Booking service is temporarily unavailable.",
            },
            { status: 503 },
          );
        }
      },
    },
  },
});
