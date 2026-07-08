import { createHash } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { supabaseProjectUrl } from "../platform/supabase-project.server";

const MAX_BOOKING_BODY_BYTES = 16_384;

function unavailable(): Response {
  return Response.json(
    {
      success: false,
      code: "INGRESS_UNAVAILABLE",
      message: "Booking is temporarily unavailable. Please contact us on WhatsApp.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function clientFingerprint(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for")?.trim();
  if (!forwardedFor) return null;
  const clientIp = forwardedFor.split(",")[0]?.trim();
  if (!clientIp) return null;

  const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? "unknown";
  const acceptLanguage = request.headers.get("accept-language")?.slice(0, 256) ?? "unknown";
  return createHash("sha256")
    .update(`${clientIp}\n${userAgent}\n${acceptLanguage}`, "utf8")
    .digest("hex");
}

export const Route = createFileRoute("/api/booking-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
        const fingerprint = clientFingerprint(request);
        if (!oidcToken || !fingerprint) return unavailable();

        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(contentLength) && contentLength > MAX_BOOKING_BODY_BYTES) {
          return Response.json(
            { success: false, code: "INVALID_INPUT", message: "Invalid booking request." },
            { status: 413, headers: { "Cache-Control": "no-store" } },
          );
        }

        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BOOKING_BODY_BYTES) {
          return Response.json(
            { success: false, code: "INVALID_INPUT", message: "Invalid booking request." },
            { status: 413, headers: { "Cache-Control": "no-store" } },
          );
        }

        let body: Record<string, unknown>;
        try {
          const parsed: unknown = JSON.parse(rawBody);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return Response.json(
              { success: false, code: "INVALID_INPUT", message: "Invalid booking request." },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }
          body = parsed as Record<string, unknown>;
        } catch {
          return Response.json(
            { success: false, code: "INVALID_INPUT", message: "Invalid booking request." },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        const response = await fetch(`${supabaseProjectUrl}/functions/v1/booking-ingress`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oidcToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
          body: JSON.stringify({ ...body, _client_fingerprint: fingerprint }),
        }).catch(() => null);

        if (!response) return unavailable();
        const responseBody = await response.text();
        return new Response(responseBody, {
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
