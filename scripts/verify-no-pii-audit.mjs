import { readFileSync } from "node:fs";

const analyticsSource = readFileSync("src/platform/public-analytics.ts", "utf8");
const eventSource = readFileSync("src/platform/public-cta-events.ts", "utf8");
const bannerSource = readFileSync("src/components/consent-banner.tsx", "utf8");
const bridgeSource = readFileSync("src/components/analytics-consent-bridge.tsx", "utf8");
const conversionBridgeSource = readFileSync("src/components/conversion-event-bridge.tsx", "utf8");
const privacyPageSource = readFileSync("src/components/privacy-page.tsx", "utf8");

// 1. Verify allowed parameter keys contain no PII fields
const forbiddenParameterKeys = [
  "email",
  "phone",
  "name",
  "first_name",
  "last_name",
  "full_name",
  "customer_name",
  "phone_number",
  "health",
  "adaptive",
  "notes",
  "booking_id",
  "uuid",
  "raw_payload",
  "rawform",
  "full_url",
  "whatsapp_message",
  "user_id",
  "user_agent",
  "ip_address",
];

for (const key of forbiddenParameterKeys) {
  if (analyticsSource.toLowerCase().includes(`"${key}"`)) {
    throw new Error(`no-pii-audit: forbidden PII parameter key in analytics source: "${key}"`);
  }
  if (eventSource.toLowerCase().includes(`"${key}"`)) {
    throw new Error(`no-pii-audit: forbidden PII parameter key in event source: "${key}"`);
  }
}

// 2. Verify ALLOWED_PARAMETER_KEYS only contains safe fields
if (!analyticsSource.includes('"language"')) {
  throw new Error('no-pii-audit: "language" must be in ALLOWED_PARAMETER_KEYS');
}
if (!analyticsSource.includes('"source"')) {
  throw new Error('no-pii-audit: "source" must be in ALLOWED_PARAMETER_KEYS');
}
if (!analyticsSource.includes('"cta_id"')) {
  throw new Error('no-pii-audit: "cta_id" must be in ALLOWED_PARAMETER_KEYS');
}

// 3. Verify FORBIDDEN_VALUE_PATTERNS protects against PII injection
if (!analyticsSource.includes("FORBIDDEN_VALUE_PATTERNS")) {
  throw new Error("no-pii-audit: FORBIDDEN_VALUE_PATTERNS must exist in analytics source");
}

// Email pattern
if (!analyticsSource.includes("@[A-Z0-9.-]+")) {
  throw new Error("no-pii-audit: analytics must include an email-detection regex");
}

// Phone pattern
if (!analyticsSource.includes("\\d[\\d\\s().-]{7,}\\d")) {
  throw new Error("no-pii-audit: analytics must include a phone-detection regex");
}

// Click-ID pattern (gclid, fbclid etc.)
if (!analyticsSource.includes("gclid|gbraid|wbraid|fbclid")) {
  throw new Error("no-pii-audit: analytics must block click-ID storage in parameters");
}

// 4. Verify URL injection is blocked
if (!analyticsSource.includes("https?:\\/\\/")) {
  throw new Error("no-pii-audit: analytics must block URL injection in parameters");
}

// 5. Verify value length limit prevents large PII blobs
if (!analyticsSource.includes("value.length <= 80")) {
  throw new Error("no-pii-audit: analytics must enforce a string-length limit of 80 on parameter values");
}

// 6. Verify no PII in conversion event bridge
const forbiddenConversionTerms = [
  "customer_name",
  "phone_number",
  "email_address",
  "booking_id",
  "uuid",
  "notes",
  "rawform",
  "raw_payload",
  "full_url",
  "whatsapp_message",
];
for (const term of forbiddenConversionTerms) {
  if (conversionBridgeSource.toLowerCase().includes(term)) {
    throw new Error(`no-pii-audit: forbidden PII term in conversion-event-bridge: "${term}"`);
  }
}

// 7. Verify consent banner contains no PII
for (const term of ["localStorage", "sessionStorage", "document.cookie", "user_id"]) {
  if (bannerSource.includes(term)) {
    throw new Error(`no-pii-audit: consent banner contains forbidden term: "${term}"`);
  }
}

// 8. Verify analytics bridge contains no PII
for (const term of ["localStorage", "sessionStorage", "document.cookie", "email", "phone"]) {
  if (bridgeSource.includes(term)) {
    throw new Error(`no-pii-audit: analytics-consent-bridge contains forbidden term: "${term}"`);
  }
}

// 9. Verify production GA4 is not activated (no production Measurement ID)
const configuredIds = analyticsSource.match(/G-[A-Z0-9]{5,}/g) ?? [];
if (configuredIds.length > 0) {
  throw new Error(
    `no-pii-audit: repository must not contain a configured GA4 Measurement ID (found: ${configuredIds.join(", ")})`
  );
}

// 10. Verify GTM is not used
if (analyticsSource.includes("GTM-") || bridgeSource.includes("GTM-")) {
  throw new Error("no-pii-audit: GTM must not be used in Phase 1");
}

// 11. Verify privacy email is the approved contact
if (!privacyPageSource.includes("swimfluentprivacy@gmail.com")) {
  throw new Error('no-pii-audit: privacy contact must be "swimfluentprivacy@gmail.com"');
}

console.log("No-PII audit verification passed.");
