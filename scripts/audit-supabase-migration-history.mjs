import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const filenames = (await readdir(migrationsDirectory))
  .filter((filename) => filename.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right, "en"));

const phaseAFilename = "20260711003100_international_booking_phone_foundation.sql";
const historicalFilenames = filenames.filter((filename) => filename !== phaseAFilename);
const phaseAPresent = filenames.includes(phaseAFilename);

assert.equal(
  historicalFilenames.length,
  32,
  `Expected 32 historical migrations, found ${historicalFilenames.length}`,
);
assert.equal(
  filenames.length,
  phaseAPresent ? 33 : 32,
  `Unexpected migration inventory: found ${filenames.length}`,
);

const entries = filenames.map((filename, executionIndex) => {
  const separator = filename.indexOf("_");
  assert.ok(separator > 0, `Migration filename has no version separator: ${filename}`);

  const version = filename.slice(0, separator);
  assert.match(version, /^\d+$/, `Migration version is not numeric: ${filename}`);

  return {
    executionIndex: executionIndex + 1,
    filename,
    parsedVersion: version,
  };
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

if (phaseAPresent) {
  const phaseAEntry = entries.find((entry) => entry.filename === phaseAFilename);
  assert.equal(
    phaseAEntry?.parsedVersion,
    "20260711003100",
    "Phase A must keep its unique 14-digit Supabase migration version",
  );
}

const uniqueExecutionKeys = new Set(entries.map((entry) => entry.filename));
assert.equal(
  uniqueExecutionKeys.size,
  entries.length,
  "Full migration filenames must remain unique for the repository-only disposable runner",
);

console.log(
  JSON.stringify(
    {
      strategy: "repository_full_filename_lexical_order_for_disposable_validation_only",
      productionDeploymentStrategy: "BLOCKED",
      historicalMigrationCount: historicalFilenames.length,
      phaseAPresent,
      migrationCount: entries.length,
      duplicateVersions,
      executionOrder: entries,
    },
    null,
    2,
  ),
);
