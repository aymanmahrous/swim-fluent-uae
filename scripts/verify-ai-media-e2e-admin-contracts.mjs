import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
let checks = 0;

async function text(path) {
  return readFile(join(root, path), "utf8");
}

function requireText(source, needle, label) {
  checks += 1;
  if (!source.includes(needle)) {
    throw new Error(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function forbidText(source, needle, label) {
  checks += 1;
  if (source.includes(needle)) {
    throw new Error(`${label}: forbidden ${JSON.stringify(needle)}`);
  }
}

const edgeAdmin = await text("supabase/functions/ai-media-e2e-admin/index.ts");
for (const needle of [
  'OIDC_ISSUER = "https://token.actions.githubusercontent.com"',
  'OIDC_AUDIENCE = "relax-fix-ai-media-e2e"',
  'EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae"',
  'EXPECTED_REF = "refs/heads/main"',
  "crypto.subtle.verify",
  'Deno.env.get("SUPABASE_SECRET_KEYS")',
  'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
  'BCRYPT_PASSWORD_MAX_BYTES = 72',
  'crypto.randomUUID().slice(0, 24)',
  'new TextEncoder().encode(password).length > BCRYPT_PASSWORD_MAX_BYTES',
  'throw new Error("E2E_PASSWORD_TOO_LONG")',
  'purpose: E2E_PURPOSE',
  'created_by=eq.${encoded}',
  'requested_by=eq.${encoded}',
  'deleteRows("staff_profiles", "id", userId)',
  "deleteAuthUser(userId)",
]) {
  requireText(edgeAdmin, needle, "Supabase AI media E2E admin");
}
forbidText(edgeAdmin, '`${crypto.randomUUID()}Aa1!${crypto.randomUUID()}`', "Supabase AI media E2E admin");
forbidText(edgeAdmin, "sb_secret_", "Supabase AI media E2E admin");
forbidText(edgeAdmin, "SUPABASE_SECRET_KEY=", "Supabase AI media E2E admin");

const adminScript = await text("scripts/ai-media-e2e-admin.mjs");
for (const needle of [
  "E2E_ADMIN_URL",
  "GITHUB_SHA",
  'payload.sha !== expectedSha',
  'result.payload.sha !== expectedSha',
  '`${baseUrl}/api/internal/ai-media-e2e`',
  "oidcCall(adminUrl",
  "::add-mask::${user.email}",
  "::add-mask::${user.password}",
]) {
  requireText(adminScript, needle, "AI media E2E admin client");
}

const workflow = await text(".github/workflows/ai-media-e2e.yml");
requireText(
  workflow,
  "E2E_BASE_URL: https://swim-fluent-uae-w532.vercel.app",
  "AI media E2E workflow",
);
requireText(
  workflow,
  "E2E_ADMIN_URL: https://nmzxrjdxvmmzzmajrskm.supabase.co/functions/v1/ai-media-e2e-admin",
  "AI media E2E workflow",
);
requireText(workflow, "id-token: write", "AI media E2E workflow");
requireText(workflow, "npm run test:e2e:ai-media", "AI media E2E workflow");
forbidText(workflow, "SUPABASE_SECRET_KEY", "AI media E2E workflow");
forbidText(workflow, "VERCEL_TOKEN", "AI media E2E workflow");

console.log(`AI media E2E admin contract verification passed (${checks} assertions).`);
