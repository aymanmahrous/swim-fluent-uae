import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const routesDirectory = join(process.cwd(), "src/routes");
const routeFiles = (await readdir(routesDirectory))
  .filter((name) => /^api\..+\.(?:ts|tsx)$/.test(name))
  .sort();

const groups = [
  {
    name: "AI OS staff APIs",
    matches: (file) => /^api\.os(?:[.-]|$)/.test(file),
    required: ["resolveStaffSession"],
    forbidden: ["verifyInternalWorkerRequest", "authenticateContentAutomationRequest"],
  },
  {
    name: "internal worker APIs",
    matches: (file) => /^api\.internal\./.test(file),
    required: ["verifyInternalWorkerRequest"],
    forbidden: ["resolveStaffSession", "authenticateContentAutomationRequest"],
  },
  {
    name: "cron APIs",
    matches: (file) => /^api\.cron\./.test(file),
    required: ["authenticateContentAutomationRequest"],
    forbidden: ["resolveStaffSession", "verifyInternalWorkerRequest"],
  },
];

assert.ok(routeFiles.length > 0, "No API route files were discovered");

const classified = new Set();
const summary = [];

for (const group of groups) {
  const files = routeFiles.filter(group.matches);
  assert.ok(files.length > 0, `No routes discovered for protected group: ${group.name}`);

  for (const file of files) {
    classified.add(file);
    const source = await readFile(join(routesDirectory, file), "utf8");

    assert.ok(
      source.includes("server:") && source.includes("handlers:"),
      `${file} must remain a server route with explicit handlers`,
    );

    for (const needle of group.required) {
      assert.ok(source.includes(needle), `${file} is missing required authentication boundary ${needle}`);
    }

    for (const needle of group.forbidden) {
      assert.ok(!source.includes(needle), `${file} crosses authentication domains through ${needle}`);
    }
  }

  summary.push(`${group.name}: ${files.length}`);
}

const privilegedFiles = routeFiles.filter((file) =>
  groups.some((group) => group.matches(file)),
);
assert.equal(
  classified.size,
  privilegedFiles.length,
  "Every privileged API route must belong to exactly one authentication domain",
);

console.log(`Privileged API authentication boundary verification passed (${summary.join(", ")}).`);
