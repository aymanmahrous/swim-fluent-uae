import { readFileSync } from "node:fs";

const analyticsSource = readFileSync("src/platform/public-analytics.ts", "utf8");
const eventSource = readFileSync("src/platform/public-cta-events.ts", "utf8");
const registrySource = readFileSync("src/platform/public-cta-registry.ts", "utf8");

// 1. Verify the four required events are declared in the type union
const requiredEvents = ["booking_complete", "conversation_start", "whatsapp_click", "call_click"];
for (const eventName of requiredEvents) {
  if (!analyticsSource.includes(`"${eventName}"`)) {
    throw new Error(`event-tests: required event "${eventName}" is not declared in PublicAnalyticsEvent`);
  }
}

// 2. Verify emitPublicCtaClick handles whatsapp_click and call_click
if (!eventSource.includes('channel === "whatsapp" ? "whatsapp_click" : "call_click"')) {
  throw new Error('event-tests: emitPublicCtaClick must map whatsapp to "whatsapp_click" and call to "call_click"');
}
if (!eventSource.includes('"whatsapp" && channel !== "call"')) {
  throw new Error("event-tests: emitPublicCtaClick must guard against non-contact channels");
}

// 3. Verify booking_complete fires on backend confirmation only
if (!eventSource.includes("if (!input.backendConfirmed || input.duplicateResponse) return false;")) {
  throw new Error("event-tests: emitBookingComplete must require backendConfirmed and reject duplicates");
}
if (!eventSource.includes('trackPublicEvent("booking_complete"')) {
  throw new Error('event-tests: emitBookingComplete must call trackPublicEvent("booking_complete")');
}
if (!eventSource.includes('source: "booking-success"')) {
  throw new Error('event-tests: booking_complete must use source: "booking-success"');
}

// 4. Verify conversation_start fires from chatbot with correct source
if (!eventSource.includes('trackPublicEvent("conversation_start"')) {
  throw new Error('event-tests: emitConversationStart must call trackPublicEvent("conversation_start")');
}
if (!eventSource.includes('source: "chatbot"')) {
  throw new Error('event-tests: conversation_start must use source: "chatbot"');
}
// conversation_start must not carry a cta_id or WhatsApp payload
if (
  eventSource.includes('trackPublicEvent("conversation_start", {\n    language: input.language,\n    source: "chatbot",\n    cta_id') ||
  eventSource.includes('whatsapp_message')
) {
  throw new Error("event-tests: conversation_start must not carry a cta_id or WhatsApp payload");
}

// 5. Verify click deduplication is present
if (!eventSource.includes("CLICK_DEDUPLICATION_WINDOW_MS")) {
  throw new Error("event-tests: click deduplication window must be defined");
}
if (!eventSource.includes("recentClickEvents")) {
  throw new Error("event-tests: recentClickEvents map must be present for deduplication");
}
if (!eventSource.includes("if (emitted) recentClickEvents.set(deduplicationKey, now);")) {
  throw new Error("event-tests: deduplication key must be stored after successful emit");
}

// 6. Verify booking completion deduplication
if (!eventSource.includes("completedBookingResults")) {
  throw new Error("event-tests: completedBookingResults set must be present for deduplication");
}
if (!eventSource.includes("if (emitted) completedBookingResults.add(input.resultKey);")) {
  throw new Error("event-tests: resultKey must be stored after successful booking_complete emit");
}

// 7. Verify conversation deduplication
if (!eventSource.includes("startedConversations")) {
  throw new Error("event-tests: startedConversations set must be present for deduplication");
}

// 8. Verify events are gated behind consent (trackPublicEvent checks analyticsReady())
if (!analyticsSource.includes("if (!analyticsReady() || !window.gtag) return false;")) {
  throw new Error("event-tests: trackPublicEvent must gate on analyticsReady()");
}

// 9. Verify reserved CTAs cannot emit events
if (!registrySource.includes('status: "reserved"')) {
  throw new Error("event-tests: CTA registry must define reserved status to block unauthorized events");
}
if (!eventSource.includes("if (!canEmitPublicCta(ctaId)) return false;")) {
  throw new Error("event-tests: emitPublicCtaClick must check canEmitPublicCta");
}

// 10. Verify reset function exists for test isolation
if (!eventSource.includes("resetPublicEventDeduplicationForTests")) {
  throw new Error("event-tests: resetPublicEventDeduplicationForTests must be exported for test isolation");
}

console.log("Event tests verification passed.");
