import { readFileSync } from "node:fs";

const source = readFileSync("src/platform/public-analytics.ts", "utf8");
const viteSource = readFileSync("vite.config.ts", "utf8");

const requiredFragments = [
  'const PREVIEW_HOST_SUFFIX = ".vercel.app";',
  'VITE_ENABLE_PREVIEW_GA4 === "true"',
  "VITE_PREVIEW_GA4_MEASUREMENT_ID",
  'VITE_ENABLE_GA4 === "true"',
  "VITE_GA4_MEASUREMENT_ID",
  "VITE_DEPLOYMENT_ENV",
  'deploymentEnvironment === "preview"',
  'deploymentEnvironment === "production"',
  "isApprovedPreviewHost(window.location.hostname)",
  "previewAnalyticsRuntimeReady()",
  "productionAnalyticsRuntimeReady()",
  "activeAnalyticsConfiguration()",
  'scriptMarker: "gtag-preview"',
  'scriptMarker: "gtag-production"',
  "send_page_view: false",
  "allow_google_signals: false",
  "allow_ad_personalization_signals: false",
];

for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`runtime-scoped GA4 integration: missing ${JSON.stringify(fragment)}`);
  }
}

for (const fragment of [
  'process.env.VERCEL_ENV ?? "development"',
  '"import.meta.env.VITE_DEPLOYMENT_ENV": JSON.stringify(vercelEnvironment)',
]) {
  if (!viteSource.includes(fragment)) {
    throw new Error(`runtime-scoped GA4 integration: deployment isolation missing ${JSON.stringify(fragment)}`);
  }
}

const forbiddenFragments = [
  "localhost",
  "relaxfixuae.com",
  "swimfluentuae.com",
  "localStorage",
  "sessionStorage",
  "document.cookie",
  "indexedDB",
];

for (const fragment of forbiddenFragments) {
  if (source.includes(fragment)) {
    throw new Error(`runtime-scoped GA4 integration: forbidden ${JSON.stringify(fragment)}`);
  }
}

const configuredMeasurementIds = source.match(/G-[A-Z0-9]{5,}/g) ?? [];
if (configuredMeasurementIds.length > 0) {
  throw new Error("runtime-scoped GA4 integration: repository must not contain a configured Measurement ID");
}

console.log("Runtime-scoped preview and production GA4 integration verification passed.");
