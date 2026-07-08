import { createFileRoute } from "@tanstack/react-router";
import {
  supabaseProjectUrl,
  supabasePublicHeaders,
} from "../platform/supabase-project.server";

export const Route = createFileRoute("/api/business-settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(
            `${supabaseProjectUrl}/rest/v1/business_settings?select=*&id=eq.primary&limit=1`,
            { headers: supabasePublicHeaders() },
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
