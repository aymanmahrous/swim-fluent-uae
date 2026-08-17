import { readFileSync } from "node:fs";

const bannerSource = readFileSync("src/components/consent-banner.tsx", "utf8");
const mobileBarSource = readFileSync("src/components/mobile-conversion-bar.tsx", "utf8");
const rootSource = readFileSync("src/routes/__root.tsx", "utf8");

// 1. Verify consent banner uses a mobile-safe z-index
// Consent banner must be above the mobile conversion bar
const bannerZMatch = bannerSource.match(/z-\[(\d+)\]/);
const mobileBarZMatchResult = mobileBarSource.match(/z-(\d+)/);

if (!bannerZMatch) {
  throw new Error("mobile-consent: consent banner must define an explicit z-index");
}

const bannerZ = parseInt(bannerZMatch[1], 10);
if (bannerZ < 60) {
  throw new Error(
    `mobile-consent: consent banner z-index (${bannerZ}) must be high enough to appear above the mobile bar`
  );
}

// 2. Verify consent banner is positioned above mobile conversion bar
// Mobile bar uses z-50 (50), banner must be higher
const mobileBarZ = mobileBarZMatchResult ? parseInt(mobileBarZMatchResult[1], 10) : 50;
if (bannerZ <= mobileBarZ) {
  throw new Error(
    `mobile-consent: consent banner z-index (${bannerZ}) must exceed mobile conversion bar z-index (${mobileBarZ})`
  );
}

// 3. Verify banner has a safe-area-aware bottom offset to avoid overlapping mobile bar
// The mobile bar is fixed at bottom-0, so the banner needs a bottom offset of at least
// bottom-24 (6rem) worth of clearance on mobile, accounting for the device safe area.
if (!bannerSource.includes("bottom-[calc(5.75rem+env(safe-area-inset-bottom))]") && !bannerSource.includes("bottom-24")) {
  throw new Error(
    "mobile-consent: consent banner must use a safe-area-aware bottom offset on mobile to avoid overlapping the mobile conversion bar"
  );
}

// 4. Verify consent banner uses responsive stacking for mobile (grid or flex column, row on larger screens)
if (
  !bannerSource.includes("sm:flex-row") &&
  !bannerSource.includes("flex-col") &&
  !bannerSource.includes("grid-cols-2")
) {
  throw new Error(
    "mobile-consent: consent banner must stack controls on mobile and switch to a row layout on larger screens"
  );
}

// 5. Verify the settings/reopen button is accessible on mobile
if (
  !bannerSource.includes("fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] start-3") &&
  !bannerSource.includes("fixed bottom-24 start-4")
) {
  throw new Error(
    "mobile-consent: the collapsed consent settings button must use a safe-area-aware mobile position"
  );
}

// 6. Verify consent banner is mounted in root (applies to all pages including mobile)
if (!rootSource.includes("<ConsentBanner />")) {
  throw new Error("mobile-consent: ConsentBanner must be mounted in the root layout");
}

// 7. Verify AnalyticsConsentBridge is also mounted (denies consent on load for all users)
if (!rootSource.includes("<AnalyticsConsentBridge />")) {
  throw new Error("mobile-consent: AnalyticsConsentBridge must be mounted in the root layout");
}

// 8. Verify mobile bar uses the consent-gated public CTA pipeline (not hardcoded PII)
if (!mobileBarSource.includes('emitPublicCtaClick("floating_whatsapp", lang)')) {
  throw new Error("mobile-consent: mobile conversion bar must use the public CTA event pipeline");
}
if (
  mobileBarSource.includes("phone_number") ||
  mobileBarSource.includes("customer_name") ||
  mobileBarSource.includes("email")
) {
  throw new Error("mobile-consent: mobile conversion bar must not include PII in analytics events");
}

// 9. Verify mobile bar does not bypass the public analytics boundary
if (mobileBarSource.includes("window.gtag") || mobileBarSource.includes("ga(")) {
  throw new Error(
    "mobile-consent: mobile conversion bar must not call gtag or ga() directly; use emitPublicCtaClick"
  );
}

console.log("Mobile consent verification passed.");
