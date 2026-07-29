import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  abuseControlAllowed,
  abuseControlFingerprint,
  rateLimitedResponse,
} from "../platform/abuse-control.server";
import { supabaseSecretRpc } from "../platform/supabase-secret.server";

const BookingIngressSchema = z.object({
  p_full_name: z.string().trim().min(2).max(120),
  p_phone: z.string().trim().min(7).max(32),
  p_gender: z.string().trim().min(1).max(32),
  p_category: z.string().trim().min(1).max(64),
  p_location: z.string().trim().min(1).max(120),
  p_other_location: z.string().trim().max(120).nullable(),
  p_swam_before: z.boolean(),
  p_fear_of_water: z.boolean(),
  p_training_type: z.string().trim().min(1).max(64),
  p_requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  p_requested_time: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/),
  p_terms_accepted: z.boolean(),
  p_idempotency_key: z.string().uuid(),
  p_honeypot: z.string().max(200),
  p_form_elapsed_ms: z.number().int().min(0).max(86_400_000),
});

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
          const parsed = BookingIngressSchema.safeParse(await request.json());
          if (!parsed.success) {
            return Response.json(
              {
                success: false,
                code: "INVALID_INPUT",
                message: "Please review the booking details and try again.",
              },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }

          const response = await supabaseSecretRpc("submit_booking_request_ingress", {
            ...parsed.data,
            p_client_fingerprint: abuseControlFingerprint(
              request,
              "public-booking-ingress",
            ),
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
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
