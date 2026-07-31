import { trackPublicEvent } from "./public-analytics";
import {
  canEmitPublicCta,
  publicCtaChannel,
  type PublicCtaId,
} from "./public-cta-registry";

const CLICK_DEDUPLICATION_WINDOW_MS = 1_500;
const recentClickEvents = new Map<string, number>();
const completedBookingResults = new Set<string>();
const startedConversations = new Set<string>();

type Language = "ar" | "en";

type BookingCompleteInput = {
  ctaId: PublicCtaId;
  language: Language;
  backendConfirmed: boolean;
  duplicateResponse: boolean;
  resultKey: string;
};

type ConversationStartInput = {
  language: Language;
  conversationKey: string;
};

function validInternalDeduplicationKey(value: string): boolean {
  return value.length > 0 && value.length <= 160;
}

export function emitPublicCtaClick(
  ctaId: PublicCtaId,
  language: Language,
  now = Date.now(),
): boolean {
  if (!canEmitPublicCta(ctaId)) return false;

  const channel = publicCtaChannel(ctaId);
  if (channel !== "whatsapp" && channel !== "call") return false;

  const eventName = channel === "whatsapp" ? "whatsapp_click" : "call_click";
  const deduplicationKey = `${eventName}:${ctaId}`;
  const previousEmission = recentClickEvents.get(deduplicationKey);

  if (
    previousEmission !== undefined &&
    now - previousEmission < CLICK_DEDUPLICATION_WINDOW_MS
  ) {
    return false;
  }

  const emitted = trackPublicEvent(eventName, {
    language,
    source: "website",
    cta_id: ctaId,
  });

  if (emitted) recentClickEvents.set(deduplicationKey, now);
  return emitted;
}

export function emitBookingComplete(input: BookingCompleteInput): boolean {
  if (!input.backendConfirmed || input.duplicateResponse) return false;
  if (!validInternalDeduplicationKey(input.resultKey)) return false;
  if (!canEmitPublicCta(input.ctaId)) return false;
  if (publicCtaChannel(input.ctaId) !== "booking") return false;
  if (completedBookingResults.has(input.resultKey)) return false;

  const emitted = trackPublicEvent("booking_complete", {
    language: input.language,
    source: "booking-success",
    cta_id: input.ctaId,
  });

  if (emitted) completedBookingResults.add(input.resultKey);
  return emitted;
}

export function emitConversationStart(input: ConversationStartInput): boolean {
  if (!validInternalDeduplicationKey(input.conversationKey)) return false;
  if (startedConversations.has(input.conversationKey)) return false;

  const emitted = trackPublicEvent("conversation_start", {
    language: input.language,
    source: "chatbot",
  });

  if (emitted) startedConversations.add(input.conversationKey);
  return emitted;
}

export function resetPublicEventDeduplicationForTests(): void {
  recentClickEvents.clear();
  completedBookingResults.clear();
  startedConversations.clear();
}
