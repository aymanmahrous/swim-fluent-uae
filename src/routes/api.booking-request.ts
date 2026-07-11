import { createHash } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  isSupportedPhoneCountry,
  validateInternationalPhone,
} from "../platform/international-phone";
import { supabaseSecretRpc } from "../platform/supabase-secret.server";

const BookingPayloadSchema = z.object({
  p_full_name: z.string().min(2).max(120),
  p_phone: z.string().min(1).max(64),
  p_phone_country: z.string().length(2),
  p_language: z.enum(["ar", "en"]),
  p_gender: z.enum(["Male", "Female"]),
  p_category: z.enum(["Boy", "Girl", "Adult", "People of Determination"]),
  p_location: z.string().min(2).max(120),
  p_other_location: z.string().max(200).nullable(),
  p_swam_before: z.boolean(),
  p_fear_of_water: z.boolean(),
  p_training_type: z.enum(["Private", "Semi-Private", "Group"]),
  p_requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  p_requested_time: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/),
  p_terms_accepted: z.literal(true),
  p_idempotency_key: z.string().uuid(),
  p_honeypot: z.string().max(200),
  p_form_elapsed_ms: z.number().int().min(0).max(86_400_000),
});

function payloadLanguage(payload: unknown): "ar" | "en" {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "p_language" in payload &&
    payload.p_language === "ar"
  ) {
    return "ar";
  }
  return "en";
}

function invalidInputMessage(language: "ar" | "en"): string {
  return language === "ar"
    ? "تعذر التحقق من بيانات طلب الحجز. راجع الحقول وحاول مرة أخرى."
    : "The booking request could not be validated. Review the fields and try again.";
}

function invalidPhoneMessage(language: "ar" | "en"): string {
  return language === "ar"
    ? "رقم الهاتف غير صالح للدولة المختارة."
    : "The phone number is not valid for the selected country.";
}

function requestFingerprint(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const sourceAddress = forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) || "unknown";
  return createHash("sha256").update(`${sourceAddress}\n${userAgent}`).digest("hex");
}

export const Route = createFileRoute("/api/booking-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let language: "ar" | "en" = "en";
        try {
          const rawPayload: unknown = await request.json();
          language = payloadLanguage(rawPayload);
          const parsed = BookingPayloadSchema.safeParse(rawPayload);
          if (!parsed.success) {
            return Response.json(
              {
                success: false,
                code: "INVALID_INPUT",
                message: invalidInputMessage(language),
              },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }

          const payload = parsed.data;
          if (!isSupportedPhoneCountry(payload.p_phone_country)) {
            return Response.json(
              {
                success: false,
                code: "INVALID_PHONE",
                message: invalidPhoneMessage(language),
              },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }

          const phone = validateInternationalPhone(payload.p_phone_country, payload.p_phone);
          if (!phone.success) {
            return Response.json(
              {
                success: false,
                code: "INVALID_PHONE",
                message: invalidPhoneMessage(language),
              },
              { status: 400, headers: { "Cache-Control": "no-store" } },
            );
          }

          const response = await supabaseSecretRpc("submit_booking_request_ingress", {
            p_full_name: payload.p_full_name,
            p_phone: phone.internationalDisplay,
            p_gender: payload.p_gender,
            p_category: payload.p_category,
            p_location: payload.p_location,
            p_other_location: payload.p_other_location,
            p_swam_before: payload.p_swam_before,
            p_fear_of_water: payload.p_fear_of_water,
            p_training_type: payload.p_training_type,
            p_requested_date: payload.p_requested_date,
            p_requested_time: payload.p_requested_time,
            p_terms_accepted: payload.p_terms_accepted,
            p_idempotency_key: payload.p_idempotency_key,
            p_client_fingerprint: requestFingerprint(request),
            p_honeypot: payload.p_honeypot,
            p_form_elapsed_ms: payload.p_form_elapsed_ms,
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
          const safeDetail = error instanceof Error ? error.name : "UnknownError";
          console.error("booking_request_proxy_failed", safeDetail);
          return Response.json(
            {
              success: false,
              code: "SERVER_ERROR",
              message:
                language === "ar"
                  ? "خدمة الحجز غير متاحة مؤقتًا."
                  : "Booking service is temporarily unavailable.",
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
