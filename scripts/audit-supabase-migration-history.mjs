import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const filenames = (await readdir(migrationsDirectory))
  .filter((filename) => filename.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right, "en"));

const phaseAFilename = "20260711003100_international_booking_phone_foundation.sql";
const bookingIngressFilename = "20260729144612_harden_booking_ingress_rpc.sql";
const osRbacFilename = "20260729221600_restrict_os_rbac_sanitize_errors.sql";
const sec01bRoleFilename = "20260730213000_sec_01b_align_conversation_mode_role_contract.sql";
const sec01bIdempotencyFilename = "20260730214500_sec_01b_idempotent_booking_lead_conversation_writes.sql";

const historicalControlledContracts = [
  [phaseAFilename, "20260711003100", "create or replace function public.submit_booking_request"],
  [bookingIngressFilename, "20260729144612", "revoke all on function public.submit_booking_request"],
  [osRbacFilename, "20260729221600", "create or replace function public.get_staff_command_center"],
];

const sec01bContracts = [
  [sec01bRoleFilename, "20260730213000", "create or replace function public.set_staff_conversation_mode"],
  [sec01bIdempotencyFilename, "20260730214500", "create or replace function public.update_booking_request_status"],
];

const controlledFilenames = new Set([
  ...historicalControlledContracts.map(([filename]) => filename),
  ...sec01bContracts.map(([filename]) => filename),
]);
const historicalFilenames = filenames.filter((filename) => !controlledFilenames.has(filename));
const controlledPresence = Object.fromEntries(
  [...controlledFilenames].map((filename) => [filename, filenames.includes(filename)]),
);

assert.equal(
  historicalFilenames.length,
  32,
  `Expected 32 immutable historical migrations, found ${historicalFilenames.length}`,
);
assert.equal(
  filenames.length,
  32 + Object.values(controlledPresence).filter(Boolean).length,
  `Unexpected migration inventory: found ${filenames.length}`,
);

const entries = filenames.map((filename, executionIndex) => {
  const separator = filename.indexOf("_");
  assert.ok(separator > 0, `Migration filename has no version separator: ${filename}`);
  const version = filename.slice(0, separator);
  assert.match(version, /^\d+$/, `Migration version is not numeric: ${filename}`);
  return { executionIndex: executionIndex + 1, filename, parsedVersion: version };
});

const grouped = Map.groupBy(entries, (entry) => entry.parsedVersion);
const duplicateVersions = [...grouped.entries()]
  .filter(([, group]) => group.length > 1)
  .map(([version, group]) => ({
    version,
    count: group.length,
    filenames: group.map((entry) => entry.filename),
  }));

assert.deepEqual(
  duplicateVersions.map(({ version, count }) => ({ version, count })),
  [
    { version: "20260708", count: 25 },
    { version: "20260710", count: 6 },
  ],
  "Historical migration collision inventory changed; review Production history before changing strategy",
);

for (const [filename, expectedVersion, requiredToken] of historicalControlledContracts) {
  if (!controlledPresence[filename]) continue;
  const entry = entries.find((candidate) => candidate.filename === filename);
  assert.equal(entry?.parsedVersion, expectedVersion, `${filename} must keep its exact migration version`);
  const content = (await readFile(join(migrationsDirectory, filename), "utf8")).toLowerCase();
  assert.ok(content.includes(requiredToken), `${filename} lost its required historical contract token`);
}

for (const [filename, expectedVersion, requiredToken] of sec01bContracts) {
  if (!controlledPresence[filename]) continue;
  const entry = entries.find((candidate) => candidate.filename === filename);
  assert.equal(entry?.parsedVersion, expectedVersion, `${filename} must keep its exact migration version`);
  const content = (await readFile(join(migrationsDirectory, filename), "utf8")).toLowerCase();
  assert.ok(content.includes(requiredToken), `${filename} lost its required SEC-01B contract token`);
  assert.ok(content.trimStart().startsWith("begin;"), `${filename} must remain transactional`);
  assert.ok(content.trimEnd().endsWith("commit;"), `${filename} must remain append-only and committed`);
}

if (controlledPresence[sec01bIdempotencyFilename]) {
  assert.ok(controlledPresence[sec01bRoleFilename], "SEC-01B idempotency migration requires the preceding role migration");
  const roleIndex = filenames.indexOf(sec01bRoleFilename);
  const idempotencyIndex = filenames.indexOf(sec01bIdempotencyFilename);
  assert.ok(roleIndex >= 0 && idempotencyIndex === roleIndex + 1, "SEC-01B migrations must remain adjacent and ordered");
}

const uniqueExecutionKeys = new Set(entries.map((entry) => entry.filename));
assert.equal(uniqueExecutionKeys.size, entries.length, "Full migration filenames must remain unique");

console.log(JSON.stringify({
  strategy: "repository_full_filename_lexical_order_for_disposable_validation_only",
  productionDeploymentStrategy: "BLOCKED",
  historicalMigrationCount: historicalFilenames.length,
  historicalControlledContracts: historicalControlledContracts.map(([filename, expectedVersion]) => ({ filename, expectedVersion })),
  sec01bContracts: sec01bContracts.map(([filename, expectedVersion]) => ({ filename, expectedVersion, transactional: true })),
  controlledPresence,
  migrationCount: entries.length,
  duplicateVersions,
  executionOrder: entries,
}, null, 2));
