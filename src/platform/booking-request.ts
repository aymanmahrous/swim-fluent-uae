import type { CountryCode } from "libphonenumber-js/max";
import { z } from "zod";

export const BookingRequestResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    bookingRequestId: z.string().uuid(),
    duplicate: z.boolean(),
  }),
  z.object({
    success: z.literal(false),
    code: z.enum([
      "INVALID_INPUT",
      "INVALID_PHONE",
      "DUPLICATE_REQUEST",
      "RATE_LIMITED",
      "BOT_REJECTED",
      "INGRESS_UNAVAILABLE",
      "SERVER_ERROR",
    ]),
    message: z.string(),
  }),
]);

export type BookingRequestResult = z.infer<typeof BookingRequestResultSchema>;

export interface SubmitBookingRequestInput {
  name: string;
  phone: string;
  phoneCountry: CountryCode;
  language: "ar" | "en";
  gender: string;
  category: string;
  location: string;
  otherLocation?: string;
  swamBefore: boolean;
  fearOfWater: boolean;
  trainingType: string;
  requestedDate: string;
  requestedTime: string;
  termsAccepted: boolean;
  idempotencyKey: string;
  honeypot: string;
  formElapsedMs: number;
}

export function formatDubaiCalendarDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function submitBookingRequest(
  input: SubmitBookingRequestInput,
): Promise<BookingRequestResult> {
  const response = await fetch("/api/booking-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      p_full_name: input.name,
      p_phone: input.phone,
      p_phone_country: input.phoneCountry,
      p_language: input.language,
      p_gender: input.gender,
      p_category: input.category,
      p_location: input.location,
      p_other_location: input.otherLocation ?? null,
      p_swam_before: input.swamBefore,
      p_fear_of_water: input.fearOfWater,
      p_training_type: input.trainingType,
      p_requested_date: input.requestedDate,
      p_requested_time: input.requestedTime,
      p_terms_accepted: input.termsAccepted,
      p_idempotency_key: input.idempotencyKey,
      p_honeypot: input.honeypot,
      p_form_elapsed_ms: input.formElapsedMs,
    }),
  });

  const data: unknown = await response.json();
  const parsed = BookingRequestResultSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid booking service response (${response.status}).`);
  }

  return parsed.data;
}
