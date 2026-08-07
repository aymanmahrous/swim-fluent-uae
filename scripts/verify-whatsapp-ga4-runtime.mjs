import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function transpile(path, replacements = []) {
  let source = readFileSync(path, "utf8");
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

function moduleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const storage = new Map();
globalThis.window = {
  location: { hostname: "localhost" },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
};
globalThis.document = {
  querySelector: () => null,
  createElement: () => ({ async: false, src: "", dataset: {} }),
  head: { appendChild: () => undefined },
};

const attributionUrl = moduleUrl(transpile("src/platform/public-attribution.ts"));
const registryUrl = moduleUrl(transpile("src/platform/public-cta-registry.ts"));
const analyticsUrl = moduleUrl(
  transpile("src/platform/public-analytics.ts", [
    ["import.meta.env.VITE_ENABLE_PREVIEW_GA4", '"false"'],
    ["import.meta.env.VITE_PREVIEW_GA4_MEASUREMENT_ID", "undefined"],
    ["import.meta.env.VITE_ENABLE_GA4", '"true"'],
    ["import.meta.env.VITE_GA4_MEASUREMENT_ID", '"G-TEST123"'],
    ["import.meta.env.VITE_DEPLOYMENT_ENV", '"production"'],
  ]),
);

const ctaSource = transpile("src/platform/public-cta-events.ts")
  .replaceAll('"./public-analytics"', JSON.stringify(analyticsUrl))
  .replaceAll('"./public-attribution"', JSON.stringify(attributionUrl))
  .replaceAll('"./public-cta-registry"', JSON.stringify(registryUrl));

const analytics = await import(analyticsUrl);
const attribution = await import(attributionUrl);
const ctaEvents = await import(moduleUrl(ctaSource));
const now = Date.now();

assert.equal(analytics.analyticsReady(), false);
assert.equal(ctaEvents.emitPublicCtaClick("booking_section_whatsapp", "en", now - 1_000), false);

attribution.capturePublicAttributionAfterConsent(
  "?utm_source=codex_qa&utm_medium=preview&utm_campaign=whatsapp_wiring",
  now,
);
assert.equal(analytics.grantAnalyticsConsent(), true);
assert.equal(analytics.analyticsReady(), true);
assert.equal(ctaEvents.emitPublicCtaClick("booking_section_whatsapp", "en", now), true);

const calls = window.dataLayer.map((entry) => Array.from(entry));
const event = calls.find((entry) => entry[0] === "event" && entry[1] === "whatsapp_click");
assert.ok(calls.some((entry) => entry[0] === "consent" && entry[1] === "update"));
assert.ok(calls.some((entry) => entry[0] === "config" && entry[1] === "G-TEST123"));
assert.ok(event);
assert.equal(event[2].lead_source, "codex_qa");
assert.equal(event[2].lead_medium, "preview");
assert.equal(event[2].lead_campaign, "whatsapp_wiring");
assert.equal(event[2].has_campaign_attribution, true);

console.log(
  JSON.stringify({
    before_consent_emitted: false,
    analytics_ready_after_consent: analytics.analyticsReady(),
    event_name: event[1],
    event_parameters: event[2],
  }),
);
