import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const workflowPath = join(root, ".github", "workflows", "production-smoke-readonly.yml");
const smokePath = join(root, "scripts", "verify-production-smoke.mjs");
const packagePath = join(root, "package.json");

const [workflow, smoke, packageSource] = await Promise.all([
  readFile(workflowPath, "utf8"),
  readFile(smokePath, "utf8"),
  readFile(packagePath, "utf8"),
]);

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label}: forbidden ${JSON.stringify(needle)}`);
  }
}

for (const required of [
  "workflow_dispatch:",
  "schedule:",
  'cron: "17 */6 * * *"',
  "contents: read",
  "timeout-minutes: 5",
  "PRODUCTION_BASE_URL: https://www.relaxfixuae.com",
  "npm run verify:production-smoke",
]) {
  requireText(workflow, required, "Production smoke workflow");
}

for (const forbidden of [
  "contents: write",
  "pull-requests: write",
  "issues: write",
  "id-token: write",
  "secrets.",
  "npm publish",
  "vercel deploy",
  "supabase db",
]) {
  forbidText(workflow, forbidden, "Production smoke workflow");
}

for (const required of [
  "https://www.relaxfixuae.com",
  'method: "GET"',
  "robots.txt",
  "sitemap.xml",
  "canonical",
  "og:",
  "twitter:",
  "content-security-policy",
]) {
  requireText(smoke, required, "Production smoke script");
}

for (const forbidden of [
  'method: "POST"',
  'method: "PUT"',
  'method: "PATCH"',
  'method: "DELETE"',
  "/rpc/",
  "SUPABASE_SERVICE_ROLE",
  "process.env.VERCEL_TOKEN",
]) {
  forbidText(smoke, forbidden, "Production smoke script");
}

const packageJson = JSON.parse(packageSource);
if (packageJson.scripts?.["verify:production-smoke"] !== "node scripts/verify-production-smoke.mjs") {
  throw new Error("package.json: verify:production-smoke command is missing or changed");
}

console.log("Production Quality Gate contract passed: scheduled, read-only, no secrets, no write methods.");
