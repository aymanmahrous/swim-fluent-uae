import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const [
  config,
  revenueSections,
  chatbot,
  bookingAutomation,
  store,
  analytics,
  envExample,
  n8nSource,
] = await Promise.all([
  read("src/platform/public-business-config.ts"),
  read("src/components/revenue-sections.tsx"),
  read("src/components/chatbot-preview.tsx"),
  read("src/platform/booking-automation.ts"),
  read("src/lib/store.ts"),
  read("src/platform/public-analytics.ts"),
  read(".env.example"),
  read("automation/n8n/relax-fix-lead-preview-internal-alert.json"),
]);

for (const value of [
  "relaxfix2026@gmail.com",
  "971551378660",
  "groupMaxSize: 4",
  "groupChildPriceAED: 450",
  "siblingChildPriceAED: 400",
  "aquaticSessionPriceAED: 150",
  "landSessionPriceAED: 150",
  "ICS Al Najda",
  "ICS Al Falah",
  "ICS Khalifa",
  "ICS Mushrif",
  "ICS Al Danah",
  "Rgu2vKH7JDigAQQx6",
  "2ezLYdDSGLqeVkoNA",
  'start: "10:00"',
  'end: "22:00"',
  'start: "16:00"',
  'end: "21:00"',
]) {
  assert.ok(config.includes(value), `Missing central revenue fact: ${value}`);
}

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
  "لا أقدم تشخيصًا طبيًا ولا أتعامل مع حالات الطوارئ",
  "I do not provide medical diagnosis or handle emergencies",
]) {
  assert.ok(chatbot.includes(value), `Missing chatbot contract: ${value}`);
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
assert.ok(n8nSource.includes("external_write_performed: false"));
assert.ok(n8nSource.includes("calendar_conflict_check_required"));
assert.ok(n8nSource.includes("idempotency_key"));
assert.ok(n8nSource.includes("maximum-2-after-idempotency-check"));

console.log("Revenue, location, consent and automation foundation verification passed.");
