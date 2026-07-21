import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function text(path) {
  return readFile(path, "utf8");
}

function requireText(source, needle, label) {
  assert.ok(source.includes(needle), `${label} must retain ${needle}`);
}

function forbidText(source, needle, label) {
  assert.ok(!source.includes(needle), `${label} must not contain ${needle}`);
}

const osRoute = await text("src/routes/os.tsx");
requireText(osRoute, 'import.meta.env.VITE_ENABLE_AI_OS === "true"', "AI OS route gate");
requireText(osRoute, "enabled: aiOsEnabled", "AI OS session query gate");
requireText(osRoute, 'fetch("/api/staff-session"', "AI OS staff-session boundary");
requireText(osRoute, "StaffSessionSchema.safeParse", "AI OS runtime session validation");
forbidText(osRoute, "VITE_AI_OS_DEMO_DATA", "AI OS route authorization boundary");

const adminRoute = await text("src/routes/admin.tsx");
requireText(adminRoute, 'import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true"', "legacy Admin feature gate");
requireText(adminRoute, 'redirect({ to: "/", replace: true })', "legacy Admin disabled redirect");
requireText(adminRoute, 'content: "noindex"', "legacy Admin indexing boundary");
forbidText(adminRoute, "localStorage", "legacy Admin route");

const platformData = await text("src/platform/data.ts");
requireText(platformData, 'import.meta.env.VITE_AI_OS_DEMO_DATA === "true"', "AI OS demo-data gate");
requireText(platformData, "if (!demoDataEnabled) return productionSnapshot();", "production/demo separation");
requireText(platformData, 'if (!demoDataEnabled || typeof window === "undefined") return;', "demo-only browser persistence");
requireText(platformData, "localStorage.setItem", "demo-only local persistence");
const gateIndex = platformData.indexOf('if (!demoDataEnabled || typeof window === "undefined") return;');
const writeIndex = platformData.indexOf("localStorage.setItem");
assert.ok(gateIndex >= 0 && writeIndex > gateIndex, "localStorage writes must remain after the demo-data gate");

const staffRbac = await text("src/platform/staff-rbac.ts");
requireText(staffRbac, "hasStaffPermission", "centralized Staff RBAC");

for (const path of [
  "src/routes/api.os-content-generate.ts",
  "src/routes/api.os-media-generate-image.ts",
  "src/routes/api.os-media-generate-video.ts",
]) {
  const source = await text(path);
  requireText(source, "resolveStaffSession(request)", `${path} Staff isolation`);
  requireText(source, "hasStaffPermission", `${path} centralized authorization`);
  forbidText(source, "VITE_AI_OS_DEMO_DATA", `${path} provider isolation`);
  forbidText(source, "localStorage", `${path} provider isolation`);
}

const moduleBoundaries = await text("scripts/verify-module-ownership-boundaries.mjs");
requireText(moduleBoundaries, "src/routes/index.tsx", "public module ownership contract");
requireText(moduleBoundaries, "src/routes/os.tsx", "AI OS module ownership contract");
requireText(moduleBoundaries, "src/routes/staff.tsx", "Staff module ownership contract");

const envExample = await text(".env.example");
for (const flag of ["VITE_ENABLE_AI_OS", "VITE_ENABLE_LEGACY_ADMIN", "VITE_AI_OS_DEMO_DATA"]) {
  requireText(envExample, flag, "documented architecture flags");
}

console.log("Architecture and AI boundary verification passed");
