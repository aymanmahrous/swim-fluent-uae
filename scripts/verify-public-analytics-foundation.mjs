import { readFileSync } from "node:fs";

const source = readFileSync("src/platform/public-analytics.ts", "utf8");

const requiredFragments = [
  '"booking_complete"',
  '"conversation_start"',
  '"whatsapp_click"',
  '"call_click"',
  'VITE_ENABLE_GA4 === "true"',
  "VITE_GA4_MEASUREMENT_ID",
  'analytics_storage: "denied"',
  'ad_storage: "denied"',
  'ad_user_data: "denied"',
  'ad_personalization: "denied"',
  'analytics_storage: "granted"',
  "allow_google_signals: false",
  "allow_ad_personalization_signals: false",
  "send_page_view: false",
  "if (!consentGranted || !analyticsEnabled || !validMeasurementId(measurementId)) return false;",
  "if (!analyticsReady() || !window.gtag) return false;",
  "typeof value === \"string\" && value.length <= 80",
];

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`public analytics foundation: missing ${JSON.stringify(fragment)}`);
  }
}

const forbiddenFragments = [
  "GTM-",
  "gclid",
  "fbclid",
  "email",
  "phone_number",
  "full_name",
  "first_name",
  "last_name",
];

for (const fragment of forbiddenFragments) {
  if (source.toLowerCase().includes(fragment.toLowerCase())) {
    throw new Error(`public analytics foundation: forbidden fragment ${JSON.stringify(fragment)}`);
  }
}

console.log("Public analytics foundation verification passed.");
