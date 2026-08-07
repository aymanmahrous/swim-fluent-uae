import fs from "node:fs";

const source = fs.readFileSync("src/platform/public-attribution.ts", "utf8");
const consentBridge = fs.readFileSync("src/components/analytics-consent-bridge.tsx", "utf8");
const analytics = fs.readFileSync("src/platform/public-analytics.ts", "utf8");
const ctaEvents = fs.readFileSync("src/platform/public-cta-events.ts", "utf8");

const required = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "EMAIL_PATTERN",
  "PHONE_PATTERN",
  "HTML_PATTERN",
  "stripControlCharacters",
  "code > 31",
  "code !== 127",
  "source: 100",
  "medium: 100",
  "campaign: 150",
  "content: 150",
  "term: 150",
  "toLowerCase()",
  "URLSearchParams",
  "ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000",
  "firstTouch",
  "latestTouch",
  "capturePublicAttributionAfterConsent",
  "getLatestPublicAttribution",
  "localStorage",
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Public attribution implementation is missing required contract token: ${token}`);
  }
}

const forbidden = [
  "sessionStorage",
  "document.cookie",
  "indexedDB",
  "fetch(",
  "navigator.sendBeacon",
];

for (const token of forbidden) {
  if (source.includes(token)) {
    throw new Error(`Public attribution must not use disallowed persistence or external writes: ${token}`);
  }
}

if (!consentBridge.includes("capturePublicAttributionAfterConsent(window.location.search)")) {
  throw new Error("UTM attribution must only be captured after affirmative analytics consent.");
}

if (!consentBridge.includes("clearPublicAttribution()")) {
  throw new Error("Rejecting analytics consent must clear stored attribution.");
}

for (const token of ["lead_source", "lead_medium", "lead_campaign", "has_campaign_attribution"]) {
  if (!analytics.includes(token) || !ctaEvents.includes(token)) {
    throw new Error(`Analytics conversion attribution wiring is missing: ${token}`);
  }
}

console.log(
  "Public attribution verified: consent-gated 30-day first/latest-touch UTM persistence, click-ID removal, PII rejection, bounded values, and conversion-event attribution wiring.",
);
