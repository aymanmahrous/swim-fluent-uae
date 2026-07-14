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
  "approvedPublicAssessmentCopy",
  "sanitizePublicOpeningOffer",
  "openingOfferTextAr: approvedPublicAssessmentCopy.ar",
  "openingOfferTextEn: approvedPublicAssessmentCopy.en",
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

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

async function verifyRenderedHtml(baseUrl) {
  const cases = [
    { path: "/", approved: "طلب تقييم أولي" },
    { path: "/en", approved: "Request an initial assessment" },
  ];
  const prohibited = [
    "مجاني",
    "مجانًا",
    "تقييم أولي مجاني",
    "free assessment",
    "complimentary",
    "complimentary first assessment",
  ];

  for (const testCase of cases) {
    const response = await fetch(new URL(testCase.path, baseUrl));
    assert.equal(response.status, 200, `${testCase.path} did not return HTTP 200`);
    const text = visibleText(await response.text());
    const normalized = text.toLocaleLowerCase("en");
    for (const claim of prohibited) {
      assert.ok(!normalized.includes(claim.toLocaleLowerCase("en")), `${testCase.path} rendered prohibited claim: ${claim}`);
    }
    assert.ok(text.includes(testCase.approved), `${testCase.path} is missing approved assessment copy`);
  }
}

if (process.env.PUBLIC_BASE_URL) {
  await verifyRenderedHtml(process.env.PUBLIC_BASE_URL);
  console.log(`Rendered HTML free-claim contract passed for ${process.env.PUBLIC_BASE_URL}.`);
}

console.log("Public Arabic/English source free-claim removal contracts passed.");
