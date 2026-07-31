import { readFileSync } from "node:fs";

const analyticsSource = readFileSync("src/platform/public-analytics.ts", "utf8");
const eventSource = readFileSync("src/platform/public-cta-events.ts", "utf8");
const registrySource = readFileSync("src/platform/public-cta-registry.ts", "utf8");

const requiredEventFragments = [
  "emitPublicCtaClick",
  "emitBookingComplete",
  "emitConversationStart",
  "CLICK_DEDUPLICATION_WINDOW_MS",
  "recentClickEvents",
  "completedBookingResults",
  "startedConversations",
  "if (!input.backendConfirmed || input.duplicateResponse) return false;",
  'publicCtaChannel(input.ctaId) !== "booking"',
  'channel !== "whatsapp" && channel !== "call"',
  'channel === "whatsapp" ? "whatsapp_click" : "call_click"',
  'source: "booking-success"',
  'source: "chatbot"',
  "if (emitted) completedBookingResults.add(input.resultKey);",
  "if (emitted) recentClickEvents.set(deduplicationKey, now);",
];

for (const fragment of requiredEventFragments) {
  if (!eventSource.includes(fragment)) {
    throw new Error(`public CTA events: missing ${JSON.stringify(fragment)}`);
  }
}

const requiredAnalyticsFragments = [
  "PublicAnalyticsParameters",
  "ALLOWED_PARAMETER_KEYS",
  '"language"',
  '"source"',
  '"cta_id"',
  "FORBIDDEN_VALUE_PATTERNS",
  "sanitizeParameters",
];

for (const fragment of requiredAnalyticsFragments) {
  if (!analyticsSource.includes(fragment)) {
    throw new Error(`public CTA analytics contract: missing ${JSON.stringify(fragment)}`);
  }
}

const approvedEventNames = [
  "booking_complete",
  "whatsapp_click",
  "call_click",
  "conversation_start",
];

for (const eventName of approvedEventNames) {
  if (!analyticsSource.includes(`\"${eventName}\"`)) {
    throw new Error(`public CTA analytics contract: event not approved ${eventName}`);
  }
}

const forbiddenPayloadTerms = [
  "booking_id",
  "uuid",
  "notes",
  "rawform",
  "raw_payload",
  "full_url",
  "whatsapp_message",
  "customer_name",
  "phone_number",
];

for (const term of forbiddenPayloadTerms) {
  if (eventSource.toLowerCase().includes(term)) {
    throw new Error(`public CTA events: forbidden payload term ${JSON.stringify(term)}`);
  }
}

if (!registrySource.includes('status: "reserved"')) {
  throw new Error("public CTA events: reserved CTA protection is missing from registry");
}

if (eventSource.includes('trackPublicEvent("conversation_start"') === false) {
  throw new Error("public CTA events: conversation_start contract is missing");
}

if (eventSource.includes('trackPublicEvent("conversation_start", {\n    language: input.language,\n    source: "chatbot",\n  })') === false) {
  throw new Error("public CTA events: conversation_start must not carry a CTA or WhatsApp payload");
}

console.log("Public CTA event contracts and deduplication verification passed.");
