import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const command = config.ignoreCommand;
const canonicalProjectId = "prj_4wRrALwNzlU0msHb9pGOsExmNID0";
const allowedTopLevelKeys = new Set([
  "$schema",
  "ignoreCommand",
  "installCommand",
  "crons",
  "headers",
  "redirects",
]);

for (const key of Object.keys(config)) {
  if (!allowedTopLevelKeys.has(key)) {
    throw new Error(`VERCEL_CONFIG_KEY_NOT_ALLOWLISTED:${key}`);
  }
}

if (config.installCommand !== "npm ci --ignore-scripts --no-audit --no-fund --loglevel=error") {
  throw new Error("VERCEL_INSTALL_COMMAND_MUST_USE_CANONICAL_NPM_LOCK");
}

if (typeof command !== "string" || command.length < 1) {
  throw new Error("VERCEL_IGNORE_COMMAND_MISSING");
}

if (
  !Array.isArray(config.crons) ||
  config.crons.length !== 1 ||
  config.crons[0]?.path !== "/api/cron/content-automation" ||
  config.crons[0]?.schedule !== "15 0 * * *"
) {
  throw new Error("VERCEL_RECOVERY_CRON_POLICY_INVALID");
}

const cronText = JSON.stringify(config.crons);
if (cronText.includes("*/5 * * * *") || cronText.includes("* * * * *")) {
  throw new Error("VERCEL_HOBBY_HIGH_FREQUENCY_CRON_FORBIDDEN");
}

for (const redirect of config.redirects ?? []) {
  if (
    redirect?.permanent !== true ||
    typeof redirect?.source !== "string" ||
    typeof redirect?.destination !== "string"
  ) {
    throw new Error("VERCEL_SEO_REDIRECT_POLICY_INVALID");
  }
}

if ("rewrites" in config) {
  throw new Error("VERCEL_GONE_REWRITES_MUST_NOT_MASK_ROUTE_STATUS");
}

const goneRoutePaths = [
  "src/routes/tools/index.ts",
  "src/routes/tools/$.ts",
  "src/routes/en/tools/index.ts",
  "src/routes/en/tools/$.ts",
];

for (const routePath of goneRoutePaths) {
  const routeSource = await readFile(routePath, "utf8");
  if (
    !routeSource.includes("createGoneResponse") ||
    !routeSource.includes("server:") ||
    !routeSource.includes("handlers:")
  ) {
    throw new Error(`ROUTE_BACKED_GONE_RESPONSE_MISSING:${routePath}`);
  }
}

function exitStatus(ref, projectId = canonicalProjectId) {
  const result = spawnSync(command, {
    shell: true,
    env: {
      ...process.env,
      VERCEL_GIT_COMMIT_REF: ref,
      VERCEL_PROJECT_ID: projectId,
    },
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  return result.status;
}

if (exitStatus("agent/reduce-vercel-build-pressure") !== 0) {
  throw new Error("AGENT_PREVIEW_BUILD_MUST_BE_IGNORED");
}
if (exitStatus("main") !== 1) {
  throw new Error("CANONICAL_MAIN_BUILD_MUST_CONTINUE");
}
if (exitStatus("feature/customer-flow") !== 1) {
  throw new Error("CANONICAL_NON_AGENT_PREVIEW_BUILD_MUST_CONTINUE");
}
if (exitStatus("main", "prj_duplicate_project") !== 0) {
  throw new Error("DUPLICATE_PROJECT_MAIN_BUILD_MUST_BE_IGNORED");
}
if (exitStatus("feature/customer-flow", "prj_duplicate_project") !== 0) {
  throw new Error("DUPLICATE_PROJECT_PREVIEW_BUILD_MUST_BE_IGNORED");
}
if (exitStatus("main", "") !== 1) {
  throw new Error("MISSING_PROJECT_ID_MUST_FAIL_OPEN_TO_BUILD");
}

console.log(
  "Vercel build policy verification passed (6 project/branch cases + strict recovery cron + route-backed SEO cleanup policy).",
);
