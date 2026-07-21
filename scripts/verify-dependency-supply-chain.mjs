import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (path) => readFileSync(path, "utf8");
const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const bunLock = read("bun.lock");
const lifecycleScripts = ["preinstall", "install", "postinstall", "prepare"];

assert.equal(packageLock.lockfileVersion, 3, "package-lock.json must use lockfileVersion 3");
assert(/^\{\s*"lockfileVersion": 1,/m.test(bunLock), "bun.lock must use the reviewed lockfile format");

const rootLock = packageLock.packages?.[""] ?? {};
for (const group of ["dependencies", "devDependencies"]) {
  assert.deepEqual(rootLock[group] ?? {}, packageJson[group] ?? {}, `package-lock root ${group} drifted from package.json`);
}

for (const script of lifecycleScripts) {
  assert.equal(packageJson.scripts?.[script], undefined, `package.json must not define the ${script} lifecycle hook`);
}

for (const [name, specifier] of Object.entries({
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
})) {
  assert(!/^(?:git(?:\+[^:]+)?:|https?:|file:|github:)/i.test(specifier), `${name} must use a registry version range`);
}

for (const [path, entry] of Object.entries(packageLock.packages ?? {})) {
  if (!path || entry.link || !entry.resolved) continue;
  assert(entry.resolved.startsWith("https://registry.npmjs.org/"), `${path} resolves outside the npm registry`);
  assert(/^sha512-/.test(entry.integrity ?? ""), `${path} is missing sha512 integrity metadata`);
}

const trustedActions = new Map([
  ["actions/checkout", "34e114876b0b11c390a56381ad16ebd13914f8d5"],
  ["actions/setup-node", "49933ea5288caeca8642d1e84afbd3f7d6820020"],
  ["actions/upload-artifact", "ea165f8d65b6e75b540449e92b4886f43607fa02"],
  ["actions/github-script", "f28e40c7f34bde8b3046d885e986cb6290c5673b"],
]);
const migrationWorkflowExceptions = new Map([
  ["booking-phone-foundation.yml", new Set(["actions/checkout@v4", "supabase/setup-cli@v3", "actions/upload-artifact@v4"])],
  ["fresh-supabase-migration-compatibility.yml", new Set(["actions/checkout@v4", "actions/setup-node@v4", "supabase/setup-cli@v3", "actions/upload-artifact@v4"])],
]);
const workflowDir = ".github/workflows";
const workflowNames = readdirSync(workflowDir).filter((name) => /\.ya?ml$/.test(name)).sort();
assert(workflowNames.length > 0, "no GitHub Actions workflows found");

for (const name of workflowNames) {
  const path = join(workflowDir, name);
  const source = read(path);
  assert(/^permissions:\s*$/m.test(source), `${path} must declare top-level permissions`);
  assert(!/^permissions:\s*write-all\s*$/m.test(source), `${path} must not use write-all permissions`);

  const uses = [...source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)].map((match) => match[1]);
  for (const target of uses) {
    if (target.startsWith("./")) continue;
    const exception = migrationWorkflowExceptions.get(name);
    if (exception?.has(target)) continue;
    const match = target.match(/^([^@]+)@([0-9a-f]{40})$/);
    assert(match, `${path} must pin ${target} to a full commit SHA`);
    assert.equal(trustedActions.get(match[1]), match[2], `${path} uses an unreviewed action or SHA: ${target}`);
  }

  const npmCommands = [...source.matchAll(/^\s*(?:run:\s*)?(npm\s+(?:ci|install)\b[^\n]*)$/gm)].map((match) => match[1]);
  for (const command of npmCommands) {
    assert(command.includes("--ignore-scripts"), `${path} npm installation must disable lifecycle scripts`);
    if (!migrationWorkflowExceptions.has(name)) {
      assert(/^npm ci\b/.test(command), `${path} must use deterministic npm ci`);
    }
  }

  if (migrationWorkflowExceptions.has(name)) {
    assert(source.includes("version: 2.84.2"), `${path} must retain the reviewed Supabase CLI binary version`);
  }
}

console.log(`Verified ${Object.keys(packageJson.dependencies ?? {}).length} runtime and ${Object.keys(packageJson.devDependencies ?? {}).length} development dependencies.`);
console.log(`Verified lock integrity and ${workflowNames.length} workflow supply-chain boundaries.`);
console.log("Migration workflow action tags remain narrowly allowlisted because this phase must not trigger migration jobs.");
