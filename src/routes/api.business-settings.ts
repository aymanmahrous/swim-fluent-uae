import { createFileRoute } from "@tanstack/react-router";

const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const projectPublishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

export const Route = createFileRoute("/api/business-settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(
            `${projectUrl}/rest/v1/business_settings?select=*&id=eq.primary&limit=1`,
            {
              headers: {
                apikey: projectPublishableKey,
                Accept: "application/json",
              },
            },
          );

          const body = await response.text();
          return new Response(body, {
            status: response.status,
            headers: {
              "Content-Type": response.headers.get("content-type") ?? "application/json",
              "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
            },
          });
        } catch (error) {
          console.error("business_settings_proxy_failed", error);
          return Response.json(
            { error: "BUSINESS_SETTINGS_UPSTREAM_UNAVAILABLE" },
            { status: 503 },
          );
        }
      },
    },
  },
});
