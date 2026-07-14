import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const i18n = await readFile("src/lib/i18n.tsx", "utf8");
const businessSettings = await readFile("src/platform/business-settings.ts", "utf8");
const publicHome = await readFile("src/components/public-home.tsx", "utf8");
const publicSeo = await readFile("src/platform/public-seo.ts", "utf8");

const publicSources = [
  ["translations", i18n],
  ["public home", publicHome],
  ["public SEO and schema", publicSeo],
];

const forbiddenPublicClaimPatterns = [
  /\bfree\b/iu,
  /\bcomplimentary\b/iu,
  /مجاني|مجانًا|مجاناً/iu,
  /15\+\s*(?:yrs?|years?)/iu,
  /years?\s+of\s+practical\s+coaching/iu,
  /adaptive\s+(?:aquatic\s+coaching|swimming)/iu,
  /supportive\s+aquatic\s+movement/iu,
  /aquatic\s+rehabilitation|rehabilitation|therapy/iu,
  /تدريب\s+مائي\s+مخصص/iu,
  /تدريب\s+مائي\s+داعم\s+للحركة/iu,
  /تأهيل\s+مائي|إعادة\s+تأهيل|علاج\s+مائي/iu,
  /أصحاب\s+الهمم/iu,
  /programAdaptive|rehabTitle|rehabBody|podTitle|podBody/iu,
];

for (const [sourceName, source] of publicSources) {
  for (const pattern of forbiddenPublicClaimPatterns) {
    assert.ok(!pattern.test(source), `Unapproved public claim remains in ${sourceName}: ${pattern}`);
  }
}

for (const approved of [
  'offer: { ar: "طلب تقييم أولي", en: "Request an initial assessment" }',
  'assessmentValue: { ar: "مناقشة أولية لمعرفة نقطة البداية", en: "Initial conversation to understand your starting point" }',
  'feat1: { ar: "تدريب شخصي", en: "Personal Coaching" }',
]) {
  assert.ok(i18n.includes(approved), `Approved public replacement is missing: ${approved}`);
}

for (const contract of [
  "sanitizePublicOpeningOffer",
  'openingOfferTextAr: sanitizePublicOpeningOffer(row.opening_offer_text_ar, "ar")',
  'openingOfferTextEn: sanitizePublicOpeningOffer(row.opening_offer_text_en, "en")',
  'ar: "طلب تقييم أولي"',
  'en: "Request an initial assessment"',
  "\\bfree\\b(?:",
  "\\bcomplimentary\\b(?:",
  "\\bno(?:-|\\s+)cost\\b",
]) {
  assert.ok(businessSettings.includes(contract), `Business-settings public-claim guard is missing: ${contract}`);
}

function extractRequired(source, pattern, label) {
  const match = source.match(pattern);
  assert.ok(match, `Unable to extract ${label} for direct sanitizer tests`);
  return match[0];
}

const approvedOpeningOfferSource = extractRequired(
  businessSettings,
  /const approvedOpeningOffer = \{[\s\S]*?\} as const;/u,
  "approved opening offer",
);
const unapprovedPatternSource = extractRequired(
  businessSettings,
  /const unapprovedFreeClaimPattern =\s*\/[^\n]+\/iu;/u,
  "unapproved claim pattern",
);
const sanitizerFunctionSource = extractRequired(
  businessSettings,
  /export function sanitizePublicOpeningOffer\([\s\S]*?^\}/mu,
  "sanitizePublicOpeningOffer",
).replace("export function", "function");

const compiledSanitizerSource = ts.transpileModule(
  [approvedOpeningOfferSource, unapprovedPatternSource, sanitizerFunctionSource].join("\n\n"),
  {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;

const sanitizePublicOpeningOffer = new Function(
  `${compiledSanitizerSource}\nreturn sanitizePublicOpeningOffer;`,
)();

for (const [value, language, expected] of [
  ["Free", "en", "Request an initial assessment"],
  ["Complimentary", "en", "Request an initial assessment"],
  ["Free assessment", "en", "Request an initial assessment"],
  ["Complimentary session", "en", "Request an initial assessment"],
  ["تقييم مجاني", "ar", "طلب تقييم أولي"],
  ["بدون مقابل", "ar", "طلب تقييم أولي"],
  ["no-cost", "en", "Request an initial assessment"],
  ["no cost", "en", "Request an initial assessment"],
]) {
  assert.equal(
    sanitizePublicOpeningOffer(value, language),
    expected,
    `Unapproved offer was not replaced: ${value}`,
  );
}

for (const value of [
  "Freestyle coaching",
  "Freestyle technique assessment",
  "Freedom of movement",
]) {
  assert.equal(
    sanitizePublicOpeningOffer(value, "en"),
    value,
    `Legitimate swimming wording was incorrectly replaced: ${value}`,
  );
}

for (const safeMetadata of [
  "تدريب سباحة وثقة مائية في أبوظبي مع كوتش أيمن، يبدأ بتقييم واضح وتدرج يناسب نقطة بداية كل متدرب.",
  "Swimming and water-confidence coaching in Abu Dhabi with Coach Ayman, with a clear assessment and step-by-step training based on each learner’s starting point.",
]) {
  assert.ok(publicSeo.includes(safeMetadata), `Approved safe metadata is missing: ${safeMetadata}`);
}

assert.ok(publicHome.includes("settings.openingOfferTextAr"), "Arabic public offer binding changed unexpectedly");
assert.ok(publicHome.includes("settings.openingOfferTextEn"), "English public offer binding changed unexpectedly");
assert.ok(publicHome.includes('id="book"'), "Public booking section changed unexpectedly");
assert.ok(publicHome.includes("submitBookingRequest"), "Booking flow changed unexpectedly");
assert.ok(!publicHome.includes('["People of Determination"'), "Unapproved public category remains in the booking form");
assert.ok(!publicSeo.includes("founder:"), "Unverified founder claim remains in public schema");
assert.ok(!publicSeo.includes('"Adaptive aquatic coaching"'), "Adaptive claim remains in Person knowsAbout");

console.log("Public claims safety and sanitizer boundary contracts passed.");
