import { z } from "zod";
import { isSupabaseConfigured, supabaseRequest } from "./supabase-rest";

export const BookingRequestResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    bookingRequestId: z.string().uuid(),
    duplicate: z.boolean(),
  }),
  z.object({
    success: z.literal(false),
    code: z.enum(["INVALID_INPUT", "INVALID_PHONE", "DUPLICATE_REQUEST", "SERVER_ERROR"]),
    message: z.string(),
  }),
]);

export type BookingRequestResult = z.infer<typeof BookingRequestResultSchema>;

export interface SubmitBookingRequestInput {
  name: string;
  phone: string;
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
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "Online booking storage is not configured yet.",
    };
  }

  const data = await supabaseRequest<unknown>("/rest/v1/rpc/submit_booking_request", {
    method: "POST",
    body: JSON.stringify({
      p_full_name: input.name,
      p_phone: input.phone,
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
    }),
  });

  const parsed = BookingRequestResultSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid booking RPC response.");
  }
  return parsed.data;
}
