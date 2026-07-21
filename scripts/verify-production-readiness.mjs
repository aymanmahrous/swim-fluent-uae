import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json"));

const expectedCommands = {
  dev: "vite dev",
  build: "vite build",
  start: "node .output/server/index.mjs",
  test: "node --test tests/staff-rbac.test.ts",
};
const unsafeCommandPattern = /\b(?:migrat(?:e|ion)|seed|cron|worker|publish|deploy|supabase|vercel|psql|curl|wget)\b/i;
for (const [name, expected] of Object.entries(expectedCommands)) {
  assert.equal(packageJson.scripts?.[name], expected, `package.json ${name} command must remain explicit and reviewed`);
  assert(!unsafeCommandPattern.test(expected), `package.json ${name} command contains an unsafe side effect`);
}

for (const lifecycle of ["preinstall", "install", "postinstall", "prepare", "prestart", "poststart"]) {
  assert.equal(packageJson.scripts?.[lifecycle], undefined, `package.json must not add implicit ${lifecycle} execution`);
}

const envExample = read(".env.example");
for (const defaultOff of [
  "VITE_ENABLE_AI_OS=false",
  "VITE_ENABLE_LEGACY_ADMIN=false",
  "VITE_AI_OS_DEMO_DATA=false",
  "VITE_ENABLE_CALENDAR_BOOKING=false",
  "VITE_ENABLE_BOOKING_EMAIL=false",
  "VITE_ENABLE_N8N_BOOKING=false",
]) {
  assert(envExample.includes(defaultOff), `.env.example must retain safe default ${defaultOff}`);
}
assert(envExample.includes("VITE_BOOKING_AUTOMATION_TEST_MODE=true"));
for (const serverSecret of [
  "SUPABASE_SECRET_KEY",
  "INTERNAL_WORKER_TOKEN",
  "CRON_SECRET",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "ALIBABA_MODEL_STUDIO_API_KEY",
  "META_APP_SECRET",
  "META_PAGE_ACCESS_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "TIKTOK_CLIENT_SECRET",
]) {
  assert(new RegExp(`^${serverSecret}=server-secret-only$`, "m").test(envExample), `${serverSecret} must remain a server-only placeholder`);
  assert(!envExample.includes(`VITE_${serverSecret}`), `${serverSecret} must never be injected into the browser`);
}

const routeTree = read("src/routeTree.gen.ts");
for (const route of [
  "/",
  "/admin",
  "/os",
  "/os/analytics",
  "/os/automations",
  "/os/content",
  "/os/crm",
  "/os/inbox",
  "/os/integrations",
  "/os/media",
  "/os/planner",
]) {
  assert(routeTree.includes(`'${route}'`), `route inventory is missing ${route}`);
}

const osLayout = read("src/routes/os.tsx");
for (const boundary of [
  'import.meta.env.VITE_ENABLE_AI_OS === "true"',
  'fetch("/api/staff-session"',
  "StaffSessionSchema.safeParse",
  "enabled: aiOsEnabled",
]) {
  assert(osLayout.includes(boundary), `AI OS layout must retain ${boundary}`);
}

const legacyAdmin = read("src/routes/admin.tsx");
assert(legacyAdmin.includes('import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true"'));
assert(legacyAdmin.includes("legacy browser-password admin has been retired"));
assert(!/localStorage|sessionStorage|prompt\s*\(/.test(legacyAdmin), "legacy Admin must not restore browser-side authentication");

const routeSources = new Map([
  ["src/routes/os.index.tsx", ["../platform/os-read-models", "fetchCommandCenter"]],
  ["src/routes/os.analytics.tsx", ["../platform/os-read-models", "fetchGrowthAnalytics"]],
  ["src/routes/os.automations.tsx", ["../platform/os-operations-data", "fetchContentAutomationStatus", "fetchOperationsQueue"]],
  ["src/routes/os.content.tsx", ["../platform/os-media-generation", "../platform/os-read-models", "fetchProviderStatuses"]],
  ["src/routes/os.crm.tsx", ["../platform/os-crm-data", "fetchLeads", "updateLeadWorkflow"]],
  ["src/routes/os.inbox.tsx", ['fetch("/api/os-inbox"', 'method: "PATCH"']],
  ["src/routes/os.integrations.tsx", ["../platform/provider-status", "fetchProviderStatuses"]],
  ["src/routes/os.media.tsx", ["../platform/os-media-generation", "../platform/os-operations-data"]],
  ["src/routes/os.planner.tsx", ["../platform/os-content-workflow", "../platform/os-read-models"]],
]);
for (const [path, markers] of routeSources) {
  const source = read(path);
  for (const marker of markers) assert(source.includes(marker), `${path} data-source contract lost ${marker}`);
  assert(!/from\s+["'][^"']*(?:demo|mock|fixture)[^"']*["']/i.test(source), `${path} must not import Demo/Mock/fixture data`);
}

const publicRoot = read("src/routes/__root.tsx");
for (const accessibility of [
  '<html lang={pageLang} dir={pageLang === "ar" ? "rtl" : "ltr"}>',
  '{ name: "viewport", content: "width=device-width, initial-scale=1" }',
  "aria-label=",
  "notFoundComponent",
  "errorComponent",
]) {
  assert(publicRoot.includes(accessibility), `public root must retain ${accessibility}`);
}

const safeLogger = read("src/lib/safe-error-log.server.ts");
for (const redaction of ["Bearer [REDACTED]", "[REDACTED_URL]", "[REDACTED_QUERY]", "sanitized_message", ".slice(0, 500)"]) {
  assert(safeLogger.includes(redaction), `SSR logging must retain ${redaction}`);
}
assert(!safeLogger.includes("error.stack"), "SSR logs must not serialize stack traces");
for (const path of ["src/server.ts", "src/start.ts"]) {
  const source = read(path);
  assert(source.includes("logServerError("), `${path} must use sanitized logging`);
  assert(!source.includes("console.error(error)"), `${path} must not log raw Error objects`);
}

const vercel = JSON.parse(read("vercel.json"));
assert.equal(vercel.buildCommand, undefined, "Vercel must not introduce a side-effectful custom build command");
assert.equal(\n  vercel.installCommand,\n  "npm ci --ignore-scripts --no-audit --no-fund --loglevel=error",\n  "Vercel must use the canonical npm lock without lifecycle scripts",\n);
assert.deepEqual(vercel.crons, [{ path: "/api/cron/content-automation", schedule: "15 0 * * *" }]);
assert(vercel.ignoreCommand.includes("ref.startsWith('agent/')"), "agent branches must remain excluded from Vercel builds");

console.log("Production readiness contract passed: safe commands, environment separation, page data provenance, sanitized SSR logging, accessibility, and Vercel source policy.");
