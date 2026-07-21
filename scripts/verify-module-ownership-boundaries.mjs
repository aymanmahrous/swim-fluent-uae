import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFile(join(root, path), "utf8");

const [ownership, publicRoot, staffRoute, osRoute, cronRoute, mediaWorkerRoute, publishWorkerRoute] =
  await Promise.all([
    read("docs/architecture/MODULE_OWNERSHIP_BOUNDARIES.md"),
    read("src/routes/__root.tsx"),
    read("src/routes/staff.tsx"),
    read("src/routes/os.tsx"),
    read("src/routes/api.cron.content-automation.ts"),
    read("src/routes/api.internal.content-media-worker.ts"),
    read("src/routes/api.internal.publish-worker.ts"),
  ]);

for (const heading of [
  "Layer A — Public website",
  "Layer B — Staff Portal",
  "Layer C — AI OS / Command Center",
  "Layer D — Shared server platform",
  "Layer E — Internal workers",
  "Layer F — Cron and automation scheduler",
  "Layer G — Database and migrations",
  "Dependency direction",
]) {
  assert.ok(ownership.includes(heading), `Missing ownership layer: ${heading}`);
}

for (const rule of [
  "Public UI -> public APIs/read models",
  "Staff UI -> Staff APIs -> Staff session/RBAC -> staff-scoped RPCs",
  "AI OS UI -> AI OS APIs -> Staff session/RBAC -> staff-scoped RPCs/providers",
  "Cron route -> cron auth -> automation orchestrator -> worker processors -> worker RPCs/providers",
  "Internal route -> internal auth -> worker processor -> worker RPCs/providers",
]) {
  assert.ok(ownership.includes(rule), `Missing dependency direction: ${rule}`);
}

for (const needle of [
  "staff-session.server",
  "staff-rbac",
  "supabase-secret.server",
  "content-automation.server",
  "publish-worker.server",
  "content-media-worker.server",
]) {
  assert.ok(!publicRoot.includes(needle), `Public root crosses ownership boundary: ${needle}`);
}

assert.ok(staffRoute.includes('to="/os"'), "Staff Portal must own authenticated AI OS entry");
assert.ok(osRoute.includes("fetchStaffSession"), "AI OS must verify Staff session");
assert.ok(osRoute.includes("enabled: aiOsEnabled"), "AI OS must remain feature gated");

for (const forbidden of [
  "cron-auth.server",
  "content-automation.server",
  "publish-worker.server",
  "content-media-worker.server",
]) {
  assert.ok(!staffRoute.includes(forbidden), `Staff route crosses background ownership boundary: ${forbidden}`);
  assert.ok(!osRoute.includes(forbidden), `AI OS route crosses background ownership boundary: ${forbidden}`);
}

assert.ok(
  cronRoute.includes("authenticateContentAutomationRequest"),
  "Cron route must use cron authentication",
);
assert.ok(!cronRoute.includes("resolveStaffSession"), "Cron route must not use Staff session authentication");

for (const [name, source] of [
  ["content media worker", mediaWorkerRoute],
  ["publish worker", publishWorkerRoute],
]) {
  assert.ok(!source.includes("resolveStaffSession"), `${name} must not use Staff session authentication`);
  assert.ok(source.includes("verifyInternalWorkerRequest"), `${name} must use internal worker authentication`);
}

console.log("Module ownership boundary verification passed.");
