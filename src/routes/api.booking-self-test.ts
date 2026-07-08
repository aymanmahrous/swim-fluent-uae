import { createFileRoute } from "@tanstack/react-router";

const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const projectPublishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";
const idempotencyKey = "8a5a5077-5f0f-42bc-8cf8-9ed2ab810001";

export const Route = createFileRoute("/api/booking-self-test")({
  server: {
    handlers: {
      GET: async () => {
        const response = await fetch(`${projectUrl}/rest/v1/rpc/submit_booking_request`, {
          method: "POST",
          headers: {
            apikey: projectPublishableKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            p_full_name: "Ayman Server Proxy Verified",
            p_phone: "+971552468135",
            p_gender: "Male",
            p_category: "Adult",
            p_location: "Al Falah",
            p_other_location: null,
            p_swam_before: true,
            p_fear_of_water: false,
            p_training_type: "Private",
            p_requested_date: "2026-07-09",
            p_requested_time: "17:30",
            p_terms_accepted: true,
            p_idempotency_key: idempotencyKey,
          }),
        });

        const body = await response.text();
        return new Response(body, {
          status: response.status,
          headers: {
            "Content-Type": response.headers.get("content-type") ?? "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
