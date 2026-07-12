import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const customerFacingFiles = [
  "src/lib/i18n.tsx",
  "src/components/public-home.tsx",
  "src/platform/business-settings.ts",
  "src/platform/public-seo.ts",
  "src/routes/index.tsx",
  "src/routes/en.tsx",
  "src/routes/__root.tsx",
];

const forbiddenClaims = [
  /مجاني/iu,
  /تقييم\s+مجاني/iu,
  /استشارة\s+مجانية/iu,
  /جلسة\s+مجانية/iu,
  /\bfree\s+(?:first\s+)?assessment\b/iu,
  /\bfree\s+consultation\b/iu,
  /\bfree\s+session\b/iu,
  /\bcomplimentary\s+(?:first\s+)?assessment\b/iu,
];

for (const path of customerFacingFiles) {
  const source = await readFile(path, "utf8");
  for (const claim of forbiddenClaims) {
    assert.equal(claim.test(source), false, `${path} contains forbidden public claim ${claim}`);
  }
}

const translations = await readFile("src/lib/i18n.tsx", "utf8");
for (const required of [
  'ar: "مناقشة أولية لمعرفة نقطة البداية"',
  'en: "An initial discussion to understand your starting point"',
  'assessment: { ar: "طلب تقييم أولي", en: "Request an Initial Assessment" }',
  'assessmentValue: { ar: "لمعرفة نقطة البداية", en: "Understand your starting point" }',
]) {
  assert.ok(translations.includes(required), `Approved translation is missing: ${required}`);
}

const settings = await readFile("src/platform/business-settings.ts", "utf8");
for (const required of [
  'ar: "مناقشة أولية لمعرفة نقطة البداية"',
  'en: "An initial discussion to understand your starting point"',
  "openingOfferTextAr: approvedPublicOfferCopy.ar",
  "openingOfferTextEn: approvedPublicOfferCopy.en",
]) {
  assert.ok(settings.includes(required), `Public settings boundary is missing: ${required}`);
}

assert.equal(
  settings.includes("openingOfferTextAr: row.opening_offer_text_ar"),
  false,
  "Unreviewed database offer copy must not flow to the public Arabic page",
);
assert.equal(
  settings.includes("openingOfferTextEn: row.opening_offer_text_en"),
  false,
  "Unreviewed database offer copy must not flow to the public English page",
);

const seo = await readFile("src/platform/public-seo.ts", "utf8");
assert.ok(seo.includes("تقييم أولي وخطة تدريب"), "Approved Arabic SEO assessment wording changed");
assert.ok(
  seo.includes("Start with an assessment and a coaching path"),
  "Approved English SEO assessment wording changed",
);

console.log(
  `Public free-claim verification passed for ${customerFacingFiles.length} customer-facing files.`,
);
