import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

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

async function verifyRenderedHtml() {
  try {
    await access(".output/server/index.mjs");
  } catch {
    return;
  }

  const port = "4179";
  const server = spawn(process.execPath, [".output/server/index.mjs"], {
    env: { ...process.env, NITRO_PORT: port, PORT: port, HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  server.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    const base = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${base}/`);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // Wait for the local Nitro server.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.ok(ready, `Local built server did not become ready. ${stderr}`);

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
      const response = await fetch(`${base}${testCase.path}`);
      assert.equal(response.status, 200, `${testCase.path} did not return HTTP 200`);
      const html = await response.text();
      const text = visibleText(html);
      const normalized = text.toLocaleLowerCase("en");
      for (const claim of prohibited) {
        assert.ok(!normalized.includes(claim.toLocaleLowerCase("en")), `${testCase.path} rendered prohibited claim: ${claim}`);
      }
      assert.ok(text.includes(testCase.approved), `${testCase.path} is missing approved assessment copy`);
    }
  } finally {
    server.kill("SIGTERM");
  }
}

await verifyRenderedHtml();
console.log("Public Arabic/English source and visible rendered HTML free-claim contracts passed.");
