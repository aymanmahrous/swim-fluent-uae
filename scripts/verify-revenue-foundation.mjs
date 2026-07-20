import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const [
  config,
  revenueSections,
  chatbotKnowledge,
  salesAssistant,
  bookingAutomation,
  store,
  analytics,
  envExample,
  n8nSource,
  contentSchedule,
  gbpAudit,
] = await Promise.all([
  read("src/platform/public-business-config.ts"),
  read("src/components/revenue-sections.tsx"),
  read("src/platform/chatbot-knowledge.ts"),
  read("src/components/sales-assistant.tsx"),
  read("src/platform/booking-automation.ts"),
  read("src/lib/store.ts"),
  read("src/platform/public-analytics.ts"),
  read(".env.example"),
  read("automation/n8n/relax-fix-lead-preview-internal-alert.json"),
  read("docs/content/REVENUE_30_DAY_BILINGUAL_CONTENT_SCHEDULE_2026-07-20.md"),
  read("docs/seo/GBP_AUDIT_AND_DECISION_PACK_2026-07-20.md"),
]);

for (const value of [
  "relaxfix2026@gmail.com",
  "971551378660",
  "groupMaxSize: 4",
  "groupChildPriceAED: 450",
  "siblingChildPriceAED: 400",
  "aquaticSessionPriceAED: 150",
  "landSessionPriceAED: 150",
  "Najda Street",
  "ICS Al Falah",
  "ICS Khalifa",
  "ICS Mushrif",
  "Rgu2vKH7JDigAQQx6",
  "isPublic: false",
  "bookingEnabled: false",
  "localSeoEnabled: false",
  'start: "10:00"',
  'end: "22:00"',
  'start: "16:00"',
  'end: "21:00"',
]) {
  assert.ok(config.includes(value), `Missing central revenue fact: ${value}`);
}

const registryMatch = config.match(
  /TRAINING_LOCATION_REGISTRY:[^=]+=[\s\S]*?\[([\s\S]*?)\]\s+as const;/,
);
assert.ok(registryMatch, "Training location registry could not be parsed");
const registry = Function(
  "DISPLAY_NAME_OWNER_APPROVED",
  "GOOGLE_MAPS_NAME",
  `return [${registryMatch[1]}]`,
)("Najda Street", "ICS Al Danah - International Community School");
const publicLocations = registry.filter((location) => location.isPublic);
assert.equal(publicLocations.length, 4, "Exactly four locations must be public");
assert.deepEqual(
  publicLocations.map((location) => location.displayName),
  ["Najda Street", "ICS Al Falah", "ICS Khalifa", "ICS Mushrif"],
);
assert.equal(
  new Set(publicLocations.map((location) => location.shortUrl)).size,
  publicLocations.length,
  "A public Maps short URL cannot be reused by another public location",
);
assert.equal(
  new Set(publicLocations.map((location) => location.resolvedUrl)).size,
  publicLocations.length,
  "A resolved Maps destination cannot be reused by another public location",
);
assert.ok(
  publicLocations.every((location) => !location.displayName.includes("Al Danah")),
  "Al Danah must not be a public display location",
);
const hiddenDanah = registry.find((location) => location.id === "ics-al-danah");
assert.equal(hiddenDanah?.isPublic, false);
assert.equal(hiddenDanah?.bookingEnabled, false);
assert.equal(hiddenDanah?.localSeoEnabled, false);
const najda = registry.find((location) => location.id === "najda-street");
assert.equal(najda?.displayName, "Najda Street");
assert.equal(najda?.googleMapsObservedName, "ICS Al Danah - International Community School");
assert.equal(najda?.placeId, null, "Do not invent an unverified Google Place ID");

for (const value of [
  'id="pricing"',
  'id="locations"',
  'id="contact"',
  "Sending a request does not mean the appointment is confirmed",
  "إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا",
  "General information is not medical diagnosis or treatment",
]) {
  assert.ok(revenueSections.includes(value), `Missing public conversion safety copy: ${value}`);
}

for (const value of [
  "PUBLIC_PRICING",
  "TRAINING_LOCATIONS",
  "GENERAL_AVAILABILITY",
  "إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا",
  "Submitting a request does not confirm an appointment",
]) {
  assert.ok(chatbotKnowledge.includes(value), `Missing chatbot knowledge contract: ${value}`);
}

for (const value of [
  "detectChatbotIntent",
  "CHATBOT_QUICK_REPLY_INTENTS",
  "businessWhatsAppUrl(settings)",
  "relaxfix:conversation-start",
]) {
  assert.ok(salesAssistant.includes(value), `Missing chatbot UI contract: ${value}`);
}

for (const value of [
  "VITE_ENABLE_CALENDAR_BOOKING",
  "VITE_ENABLE_BOOKING_EMAIL",
  "VITE_ENABLE_N8N_BOOKING",
  "VITE_BOOKING_AUTOMATION_TEST_MODE",
  "preventDoubleBooking: true",
  "requireConflictCheckBeforeDisplay: true",
  "idempotencyRequired: true",
  "Initial Assessment — Booking",
  "calendar-failure",
  "n8n-failure",
]) {
  assert.ok(bookingAutomation.includes(value), `Missing booking automation control: ${value}`);
}

assert.ok(store.includes("generalHoursForWeekday"), "Slot generation does not use central hours");
assert.ok(
  analytics.includes("window.dataLayer?.push(arguments)"),
  "Verified gtag queue protocol fix is missing",
);
assert.ok(analytics.includes('"consent", "default"'), "Default denied Consent Mode is missing");

for (const flag of [
  "VITE_ENABLE_CALENDAR_BOOKING=false",
  "VITE_ENABLE_BOOKING_EMAIL=false",
  "VITE_ENABLE_N8N_BOOKING=false",
  "VITE_BOOKING_AUTOMATION_TEST_MODE=true",
]) {
  assert.ok(envExample.includes(flag), `Unsafe automation default: ${flag}`);
}

const workflow = JSON.parse(n8nSource);
assert.equal(workflow.active, false, "n8n workflow must remain inactive");
assert.equal(workflow.meta.relaxFixMode, "preview-only-fictional-data");
assert.equal(workflow.meta.testMode, true);
assert.equal(workflow.meta.externalWritesEnabled, false);
assert.equal(workflow.meta.technicalAccount, "swimmingayman@gmail.com");
assert.equal(workflow.meta.operationalAccount, "relaxfix2026@gmail.com");
assert.equal(workflow.meta.workflowSuite.length, 14);
assert.ok(!n8nSource.includes("ics-al-danah"));
assert.ok(n8nSource.includes("najda-street"));
assert.ok(n8nSource.includes("external_write_performed: false"));
assert.ok(n8nSource.includes("calendar_conflict_check_required"));
assert.ok(n8nSource.includes("idempotency_key"));
assert.ok(n8nSource.includes("maximum-2-after-idempotency-check"));

assert.ok(contentSchedule.includes("REVIEW_REQUIRED_BEFORE_PUBLISH = true"));
assert.ok(contentSchedule.includes("| 30 |"));
assert.ok(contentSchedule.includes("Najda Street"));
assert.ok(!contentSchedule.includes("ICS Al Danah"));
assert.ok(gbpAudit.includes("GBP_LIVE_WRITE_AUTHORIZED = false"));
assert.ok(gbpAudit.includes("Training locations"));
assert.ok(!gbpAudit.includes("Branches"));

for (const value of [
  "GOOGLE_CALENDAR_OPERATIONAL_ACCOUNT=relaxfix2026@gmail.com",
  "GOOGLE_CALENDAR_NAJDA_STREET_ID=server-config-only",
  "GOOGLE_CALENDAR_ICS_AL_FALAH_ID=server-config-only",
  "GOOGLE_CALENDAR_ICS_KHALIFA_ID=server-config-only",
  "GOOGLE_CALENDAR_ICS_MUSHRIF_ID=server-config-only",
  "N8N_TECHNICAL_ACCOUNT=swimmingayman@gmail.com",
]) {
  assert.ok(envExample.includes(value), `Missing account/resource separation: ${value}`);
}

console.log("Revenue, location, consent and automation foundation verification passed.");
