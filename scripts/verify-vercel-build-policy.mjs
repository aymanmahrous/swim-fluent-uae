import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const config = JSON.parse(await readFile("vercel.json", "utf8"));
const command = config.ignoreCommand;

if (typeof command !== "string" || command.length < 1) {
  throw new Error("VERCEL_IGNORE_COMMAND_MISSING");
}

function exitStatus(ref) {
  const result = spawnSync(command, {
    shell: true,
    env: { ...process.env, VERCEL_GIT_COMMIT_REF: ref },
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  return result.status;
}

if (exitStatus("agent/reduce-vercel-build-pressure") !== 0) {
  throw new Error("AGENT_PREVIEW_BUILD_MUST_BE_IGNORED");
}
if (exitStatus("main") !== 1) {
  throw new Error("MAIN_BUILD_MUST_CONTINUE");
}
if (exitStatus("feature/customer-flow") !== 1) {
  throw new Error("NON_AGENT_PREVIEW_BUILD_MUST_CONTINUE");
}

console.log("Vercel build policy verification passed (3 branch cases).");
