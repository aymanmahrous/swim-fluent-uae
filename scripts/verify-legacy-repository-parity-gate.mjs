import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const gate = await readFile(
  join(root, "docs/architecture/LEGACY_REPOSITORY_DEPLOYMENT_PARITY_GATE.md"),
  "utf8",
);

for (const repository of [
  "aymanmahrous/swim-fluent-uae",
  "aymanmahrous/relaxfix-2026",
  "aymanmahrous/relaxfix-pro",
  "aymanmahrous/RelaxFix-PRO-OS",
]) {
  assert.ok(gate.includes(repository), `Missing repository parity evidence for ${repository}`);
}

for (const required of [
  "RETAIN",
  "HOLD — NOT ARCHIVE-READY",
  "Mandatory deployment parity evidence",
  "Verified recovery export or repository archive before any deletion decision",
  "External deployment parity remains a separate evidence-gathering gate",
]) {
  assert.ok(gate.includes(required), `Missing parity gate contract: ${required}`);
}

for (const safetyRule of [
  "Never run `db:push` in either PRO repository",
  "Do not copy Drizzle/MySQL migrations into the retained Supabase project",
  "Do not copy environment files, credentials, secrets, or production data",
  "Do not mechanically merge legacy server/database code",
  "Do not archive, delete, rename, or transfer a legacy repository",
]) {
  assert.ok(gate.includes(safetyRule), `Missing legacy safety rule: ${safetyRule}`);
}

const holdCount = (gate.match(/HOLD — NOT ARCHIVE-READY/g) ?? []).length;
assert.ok(holdCount >= 6, "All three legacy repositories must remain explicitly held in detail and summary");

assert.ok(
  gate.includes("`db:push` executes `drizzle-kit generate && drizzle-kit migrate`"),
  "The destructive-risk migration command must remain documented",
);

console.log("Legacy repository and deployment parity hold gate verification passed.");
