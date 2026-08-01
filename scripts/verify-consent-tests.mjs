import { readFileSync } from "node:fs";

const bannerSource = readFileSync("src/components/consent-banner.tsx", "utf8");
const bridgeSource = readFileSync("src/components/analytics-consent-bridge.tsx", "utf8");
const rootSource = readFileSync("src/routes/__root.tsx", "utf8");

// 1. Verify bilingual copy exists
for (const fragment of ["ar:", "en:"]) {
  if (!bannerSource.includes(fragment)) {
    throw new Error(`consent-tests: missing language key "${fragment}" in copy object`);
  }
}

// 2. Verify Accept and Reject are present in both languages
const requiredCopy = [
  '"السماح بالقياس"',
  '"رفض القياس"',
  '"Accept measurement"',
  '"Reject measurement"',
];
for (const fragment of requiredCopy) {
  if (!bannerSource.includes(fragment)) {
    throw new Error(`consent-tests: missing required copy ${JSON.stringify(fragment)}`);
  }
}

// 3. Verify accept/reject handlers call publishAnalyticsConsentDecision
if (!bannerSource.includes('choose("accepted")')) {
  throw new Error('consent-tests: accept handler must call choose("accepted")');
}
if (!bannerSource.includes('choose("rejected")')) {
  throw new Error('consent-tests: reject handler must call choose("rejected")');
}
if (!bannerSource.includes("publishAnalyticsConsentDecision(nextDecision)")) {
  throw new Error("consent-tests: publishAnalyticsConsentDecision must be called on decision");
}

// 4. Verify reject does not block website (banner closes, page remains accessible)
if (!bannerSource.includes("setOpen(false)")) {
  throw new Error("consent-tests: rejection must dismiss the banner (setOpen(false))");
}
if (bannerSource.includes("window.location") || bannerSource.includes("router.navigate")) {
  throw new Error("consent-tests: reject must not redirect or block navigation");
}

// 5. Verify privacy link exists in both languages
if (!bannerSource.includes('lang === "ar" ? "/privacy" : "/en/privacy"')) {
  throw new Error("consent-tests: bilingual privacy link is missing");
}

// 6. Verify banner can be reopened after close (settings button)
if (!bannerSource.includes("setOpen(true)")) {
  throw new Error("consent-tests: consent settings must be reopenable (setOpen(true))");
}

// 7. Verify bridge starts with consent denied
if (!bridgeSource.includes("denyAnalyticsConsent();")) {
  throw new Error("consent-tests: bridge must deny analytics consent on mount");
}

// 8. Verify bridge grants on accepted, denies on rejected
if (!bridgeSource.includes('decision === "accepted"')) {
  throw new Error('consent-tests: bridge must check for "accepted" decision');
}
if (!bridgeSource.includes("grantAnalyticsConsent();")) {
  throw new Error("consent-tests: bridge must grant analytics consent on accepted");
}
if (!bridgeSource.includes("denyAnalyticsConsent();")) {
  throw new Error("consent-tests: bridge must deny analytics consent when not accepted");
}

// 9. Verify both components are mounted in root
if (!rootSource.includes("<AnalyticsConsentBridge />")) {
  throw new Error("consent-tests: AnalyticsConsentBridge is not mounted in root");
}
if (!rootSource.includes("<ConsentBanner />")) {
  throw new Error("consent-tests: ConsentBanner is not mounted in root");
}

// 10. Verify no forbidden persistence patterns
const forbidden = ["localStorage", "sessionStorage", "document.cookie", "cookieStore", "indexedDB"];
for (const term of forbidden) {
  if (bannerSource.includes(term) || bridgeSource.includes(term)) {
    throw new Error(`consent-tests: forbidden persistence pattern found: ${JSON.stringify(term)}`);
  }
}

console.log("Consent tests verification passed.");
