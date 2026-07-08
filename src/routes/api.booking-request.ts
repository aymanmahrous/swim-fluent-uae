import { createFileRoute } from "@tanstack/react-router";

const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const projectPublishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

export const Route = createFileRoute("/api/booking-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await request.text();
          const response = await fetch(`${projectUrl}/rest/v1/rpc/submit_booking_request`, {
            method: "POST",
            headers: {
              apikey: projectPublishableKey,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: payload,
          });

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
