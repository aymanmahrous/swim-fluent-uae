export const PUBLIC_CTA_REGISTRY = {
  header_book: { channel: "booking", status: "present" },
  hero_book: { channel: "booking", status: "present" },
  programs_book: { channel: "booking", status: "reserved" },
  booking_section_submit: { channel: "booking", status: "present" },
  header_whatsapp: { channel: "whatsapp", status: "reserved" },
  floating_whatsapp: { channel: "whatsapp", status: "reserved" },
  booking_section_whatsapp: { channel: "whatsapp", status: "conditional" },
  footer_whatsapp: { channel: "whatsapp", status: "conditional" },
  header_call: { channel: "call", status: "reserved" },
  booking_section_call: { channel: "call", status: "reserved" },
  footer_call: { channel: "call", status: "reserved" },
} as const;

export type PublicCtaId = keyof typeof PUBLIC_CTA_REGISTRY;
export type PublicCtaChannel = (typeof PUBLIC_CTA_REGISTRY)[PublicCtaId]["channel"];

export function isPublicCtaId(value: string): value is PublicCtaId {
  return Object.prototype.hasOwnProperty.call(PUBLIC_CTA_REGISTRY, value);
}

export function canEmitPublicCta(value: PublicCtaId): boolean {
  return PUBLIC_CTA_REGISTRY[value].status !== "reserved";
}

export function publicCtaChannel(value: PublicCtaId): PublicCtaChannel {
  return PUBLIC_CTA_REGISTRY[value].channel;
}
