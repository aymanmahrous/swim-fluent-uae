import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabaseRequest } from "./supabase-rest";

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

export const fallbackBusinessSettings: BusinessSettings = {
  businessName: "Relax Fix UAE",
  coachName: "Coach Ayman",
  whatsappNumber: "971551378660",
  publicPhone: "+971 55 137 8660",
  publicEmail: "swimmingayman@gmail.com",
  bookingPrice: 150,
  currency: "AED",
  sessionDurationMinutes: 45,
  timezone: "Asia/Dubai",
  locations: [
    "Al Muroor",
    "Al Ma'amoor",
    "Al Khalidiya",
    "Al Falah",
    "Electra",
    "Al Reem Island",
    "Yas Island",
  ],
  bookingEnabled: true,
  openingOfferTextAr: "عرض الافتتاح: 150 درهم / 45 دقيقة مع تقييم أولي مجاني",
  openingOfferTextEn: "Opening offer: 150 AED / 45 minutes with a free first assessment",
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  websiteUrl: "https://www.relaxfixuae.com",
};

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  const rows = await supabaseRequest<unknown>(
    "/rest/v1/business_settings?select=*&id=eq.primary&limit=1",
  );

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
    openingOfferTextAr: row.opening_offer_text_ar,
    openingOfferTextEn: row.opening_offer_text_en,
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
  const base = `https://wa.me/${settings.whatsappNumber}`;
  return encodedMessage ? `${base}?text=${encodedMessage}` : base;
}
