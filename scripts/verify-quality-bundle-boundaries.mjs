import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFile(join(root, path), "utf8");

async function filesUnder(dir) {
  const entries = await readdir(join(root, dir), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await filesUnder(relative)));
    else files.push(relative);
  }
  return files;
}

function importSpecifiers(source) {
  const specs = [];
  const patterns = [
    /\bimport\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+[^"']*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specs.push(match[1]);
  }
  return specs;
}

const routeFiles = (await filesUnder("src/routes")).filter((path) => path.endsWith(".tsx"));
assert.ok(routeFiles.length >= 10, "Browser-route inventory unexpectedly shrank");

const browserForbidden = [
  ".server",
  "node:",
  "../server",
  "/server",
  "cron-auth",
  "content-automation.server",
  "content-media-worker.server",
  "publish-worker.server",
  "supabase-secret.server",
  "provider-registry.server",
];

for (const path of routeFiles) {
  const source = await read(path);
  for (const specifier of importSpecifiers(source)) {
    for (const forbidden of browserForbidden) {
      assert.ok(!specifier.includes(forbidden), `${path} must not import browser-forbidden dependency ${specifier}`);
    }
  }
}

const publicRoutes = [
  "src/routes/__root.tsx",
  "src/routes/index.tsx",
  "src/routes/en.tsx",
  "src/routes/privacy.tsx",
  "src/routes/en.privacy.tsx",
];

for (const path of publicRoutes) {
  const source = await read(path);
  for (const specifier of importSpecifiers(source)) {
    for (const forbidden of ["/staff", "/os", "/admin", "staff-", "staff.", "api.os", "api.staff", "internal.", "cron."]) {
      assert.ok(!specifier.includes(forbidden), `${path} crosses public/internal boundary through ${specifier}`);
    }
  }
}

const rootRoute = await read("src/routes/__root.tsx");
for (const forbidden of [
  'from "./staff"',
  'from "./os"',
  'from "./admin"',
  'import("./staff")',
  'import("./os")',
  'import("./admin")',
]) {
  assert.ok(!rootRoute.includes(forbidden), `Public root must not eagerly import internal route: ${forbidden}`);
}

const staffAndOsRoutes = routeFiles.filter((path) => /src\/routes\/(staff|os)(\.|\.tsx)/.test(path));
assert.ok(staffAndOsRoutes.length >= 5, "Staff/AI OS browser-route inventory unexpectedly shrank");
for (const path of staffAndOsRoutes) {
  const source = await read(path);
  for (const specifier of importSpecifiers(source)) {
    for (const forbidden of ["cron", "worker", "provider-registry", "openai-", "google-veo", "alibaba-model-studio", "supabase-secret"]) {
      assert.ok(!specifier.includes(forbidden), `${path} must not pull server/background dependency ${specifier} into the browser bundle`);
    }
  }
}

const viteConfig = await read("vite.config.ts");
assert.ok(viteConfig.includes("@lovable.dev/vite-tanstack-config"), "Vite must retain the TanStack Start integration");
assert.ok(viteConfig.includes('server: { entry: "server" }'), "SSR must retain the dedicated server entry");

const serverEntry = await read("src/server.ts");
assert.ok(serverEntry.includes("createStartHandler"), "Server entry must remain explicit");
assert.ok(!rootRoute.includes("createStartHandler"), "Browser root must not import server bootstrap code");

console.log(`Quality and bundle boundary verification passed for ${routeFiles.length} browser routes`);
