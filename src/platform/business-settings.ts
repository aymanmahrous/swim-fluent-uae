import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const BusinessSettingsRowSchema = z.object({
  id: z.literal("primary"),
  business_name: z.string().min(1),
  coach_name: z.string().min(1),
  whatsapp_number: z.string().regex(/^9715\d{8}$/),
  public_phone: z.string().min(1),
  public_email: z.string().email(),
  booking_price: z.coerce.number().nonnegative(),
  currency: z.string().min(1),
  session_duration_minutes: z.number().int().positive(),
  timezone: z.string().min(1),
  locations: z.array(z.string().min(1)),
  booking_enabled: z.boolean(),
  opening_offer_text_ar: z.string().nullable(),
  opening_offer_text_en: z.string().nullable(),
  instagram_url: z.string().url().nullable(),
  facebook_url: z.string().url().nullable(),
  tiktok_url: z.string().url().nullable(),
  website_url: z.string().url().nullable(),
});

export interface BusinessSettings {
  businessName: string;
  coachName: string;
  whatsappNumber: string;
  publicPhone: string;
  publicEmail: string;
  bookingPrice: number;
  currency: string;
  sessionDurationMinutes: number;
  timezone: string;
  locations: string[];
  bookingEnabled: boolean;
  openingOfferTextAr: string | null;
  openingOfferTextEn: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
}

export const approvedPublicAssessmentCopy = {
  ar: "طلب تقييم أولي",
  en: "Request an initial assessment",
} as const;

const unapprovedFreeClaimPattern =
  /(?:مجاني|مجاناً|مجانًا|بدون\s+مقابل|\bfree\b|\bcomplimentary\b|no[-\s]?cost)/iu;

export function sanitizePublicOpeningOffer(
  value: string | null,
  language: "ar" | "en",
): string {
  const trimmed = value?.trim();
  if (!trimmed || unapprovedFreeClaimPattern.test(trimmed)) {
    return approvedPublicAssessmentCopy[language];
  }
  return trimmed;
}

export const fallbackBusinessSettings: BusinessSettings = {
  businessName: "Relax Fix UAE",
  coachName: "Coach Ayman",
  whatsappNumber: "",
  publicPhone: "",
  publicEmail: "",
  bookingPrice: 0,
  currency: "AED",
  sessionDurationMinutes: 45,
  timezone: "Asia/Dubai",
  locations: [],
  bookingEnabled: false,
  openingOfferTextAr: approvedPublicAssessmentCopy.ar,
  openingOfferTextEn: approvedPublicAssessmentCopy.en,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  websiteUrl: null,
};

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  const response = await fetch("/api/business-settings", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Business settings request failed (${response.status}).`);
  }

  const rows: unknown = await response.json();
  const parsed = z.array(BusinessSettingsRowSchema).safeParse(rows);
  if (!parsed.success || parsed.data.length !== 1) {
    throw new Error("Invalid business settings response.");
  }

  const row = parsed.data[0];
  return {
    businessName: row.business_name,
    coachName: row.coach_name,
    whatsappNumber: row.whatsapp_number,
    publicPhone: row.public_phone,
    publicEmail: row.public_email,
    bookingPrice: row.booking_price,
    currency: row.currency,
    sessionDurationMinutes: row.session_duration_minutes,
    timezone: row.timezone,
    locations: row.locations,
    bookingEnabled: row.booking_enabled,
    // Public assessment copy is owner-approved and intentionally fixed at the presentation boundary.
    // The API fields remain readable for operational review, but cannot reintroduce offer claims.
    openingOfferTextAr: approvedPublicAssessmentCopy.ar,
    openingOfferTextEn: approvedPublicAssessmentCopy.en,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    tiktokUrl: row.tiktok_url,
    websiteUrl: row.website_url,
  };
}

export function useBusinessSettings() {
  return useQuery({
    queryKey: ["business-settings", "public"],
    queryFn: fetchBusinessSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function businessWhatsAppUrl(settings: BusinessSettings, encodedMessage?: string): string {
  if (!settings.whatsappNumber) return "#";
  const base = `https://wa.me/${settings.whatsappNumber}`;
  return encodedMessage ? `${base}?text=${encodedMessage}` : base;
}
