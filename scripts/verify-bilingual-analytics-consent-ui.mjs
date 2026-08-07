import { readFileSync } from "node:fs";

const bannerSource = readFileSync("src/components/consent-banner.tsx", "utf8");
const bridgeSource = readFileSync("src/components/analytics-consent-bridge.tsx", "utf8");
const rootSource = readFileSync("src/routes/__root.tsx", "utf8");
const analyticsSource = readFileSync("src/platform/public-analytics.ts", "utf8");

const requiredBannerFragments = [
  'ar: {',
  'en: {',
  '"السماح بالقياس"',
  '"رفض القياس"',
  '"Accept measurement"',
  '"Reject measurement"',
  'choose("accepted")',
  'choose("rejected")',
  'setOpen(true)',
  'decision &&',
  'lang === "ar" ? "/privacy" : "/en/privacy"',
];

for (const fragment of requiredBannerFragments) {
  if (!bannerSource.includes(fragment)) {
    throw new Error(`bilingual consent UI: missing ${JSON.stringify(fragment)}`);
  }
}

const requiredBridgeFragments = [
  "denyAnalyticsConsent();",
  'decision === "accepted"',
  "grantAnalyticsConsent();",
  "window.addEventListener(ANALYTICS_CONSENT_EVENT",
  "window.removeEventListener(ANALYTICS_CONSENT_EVENT",
];

for (const fragment of requiredBridgeFragments) {
  if (!bridgeSource.includes(fragment)) {
    throw new Error(`analytics consent bridge: missing ${JSON.stringify(fragment)}`);
  }
}

const forbiddenFragments = [
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "cookieStore",
  "indexedDB",
  "VITE_GA4_MEASUREMENT_ID=",
  "GTM-",
];

for (const fragment of forbiddenFragments) {
  if (
    bannerSource.includes(fragment) ||
    bridgeSource.includes(fragment) ||
    rootSource.includes(fragment)
  ) {
    throw new Error(`bilingual consent UI: forbidden persistence or activation ${JSON.stringify(fragment)}`);
  }
}

if (!rootSource.includes("<AnalyticsConsentBridge />") || !rootSource.includes("<ConsentBanner />")) {
  throw new Error("bilingual consent UI: root mounting contract is missing");
}

for (const fragment of [
  'const previewAnalyticsEnabled = import.meta.env.VITE_ENABLE_PREVIEW_GA4 === "true";',
  'const productionAnalyticsEnabled = import.meta.env.VITE_ENABLE_GA4 === "true";',
]) {
  if (!analyticsSource.includes(fragment)) {
    throw new Error(`bilingual consent UI: disabled-by-default gate is missing ${JSON.stringify(fragment)}`);
  }
}

for (const fragment of [
  "if (!consentGranted) return false;",
  "const configuration = activeAnalyticsConfiguration();",
  "if (!configuration) return false;",
]) {
  if (!analyticsSource.includes(fragment)) {
    throw new Error(`bilingual consent UI: consent-before-initialization gate is missing ${JSON.stringify(fragment)}`);
  }
}

console.log("Bilingual analytics consent UI verification passed.");
