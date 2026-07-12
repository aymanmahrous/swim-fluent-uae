import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const i18n = await readFile("src/lib/i18n.tsx", "utf8");
const businessSettings = await readFile("src/platform/business-settings.ts", "utf8");
const publicHome = await readFile("src/components/public-home.tsx", "utf8");
const publicSeo = await readFile("src/platform/public-seo.ts", "utf8");

const forbiddenPublicClaims = [
  "تقييم أولي مجاني",
  'assessmentValue: { ar: "مجاني"',
  "Free assessment",
  "Free consultation",
  "Free session",
  "free first assessment",
  "complimentary first assessment",
  'assessmentValue: { ar: "مجاني", en: "Complimentary"',
];

for (const claim of forbiddenPublicClaims) {
  assert.ok(!i18n.toLocaleLowerCase("en").includes(claim.toLocaleLowerCase("en")), `Unapproved public claim remains in translations: ${claim}`);
}

for (const approved of [
  'offer: { ar: "طلب تقييم أولي", en: "Request an initial assessment" }',
  'assessmentValue: { ar: "مناقشة أولية لمعرفة نقطة البداية", en: "Initial conversation to understand your starting point" }',
]) {
  assert.ok(i18n.includes(approved), `Approved public replacement is missing: ${approved}`);
}

for (const contract of [
  "sanitizePublicOpeningOffer",
  'openingOfferTextAr: sanitizePublicOpeningOffer(row.opening_offer_text_ar, "ar")',
  'openingOfferTextEn: sanitizePublicOpeningOffer(row.opening_offer_text_en, "en")',
  'ar: "طلب تقييم أولي"',
  'en: "Request an initial assessment"',
]) {
  assert.ok(businessSettings.includes(contract), `Business-settings free-claim guard is missing: ${contract}`);
}

assert.ok(publicHome.includes("settings.openingOfferTextAr"), "Arabic public offer binding changed unexpectedly");
assert.ok(publicHome.includes("settings.openingOfferTextEn"), "English public offer binding changed unexpectedly");
assert.ok(publicHome.includes('id="book"'), "Public booking section changed unexpectedly");
assert.ok(publicHome.includes("submitBookingRequest"), "Booking flow changed unexpectedly");

for (const source of [publicHome, publicSeo]) {
  for (const claim of ["free assessment", "free consultation", "free session", "تقييم مجاني", "استشارة مجانية", "جلسة مجانية"]) {
    assert.ok(!source.toLocaleLowerCase("en").includes(claim.toLocaleLowerCase("en")), `Unapproved claim remains in public page or SEO source: ${claim}`);
  }
}

console.log("Public Arabic/English free-claim removal contracts passed.");
