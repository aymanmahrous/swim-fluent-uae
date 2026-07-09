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

const keyHelper = await text("src/platform/supabase-server-key.server.ts");
for (const needle of [
  'role: z.literal("service_role")',
  "parseLegacyServiceRoleJwt",
  'Buffer.from(parts[1], "base64url")',
  "parsed.data.exp <= Math.floor(Date.now() / 1000)",
  '/^sb_secret_[A-Za-z0-9_-]{16,}$/.test(value)',
  'kind: "modern_secret"',
  'kind: "legacy_service_role"',
  'throw new Error("SUPABASE_SECRET_KEY_FORMAT_INVALID")',
  'key.kind === "legacy_service_role"',
  'Authorization: `Bearer ${key.value}`',
  "apikey: key.value",
]) {
  requireText(keyHelper, needle, "Supabase server-key compatibility helper");
}
for (const needle of [
  'role: z.string()',
  'role: z.enum(["anon", "authenticated", "service_role"])',
  'key.kind === "modern_secret"\n      ? { Authorization',
]) {
  forbidText(keyHelper, needle, "server-key privilege boundary");
}

const secretClient = await text("src/platform/supabase-secret.server.ts");
for (const needle of [
  'process.env.SUPABASE_SECRET_KEY?.trim()',
  "supabaseServerKeyHeaders()",
  "apikey: key",
  '"SUPABASE_SECRET_NOT_CONFIGURED"',
  '"SUPABASE_SECRET_KEY_FORMAT_INVALID"',
]) {
  requireText(secretClient, needle, "privileged RPC client");
}
forbidText(secretClient, "Authorization", "privileged RPC client delegates conditional auth");

const signer = await text("src/platform/publishing-media-sign.server.ts");
for (const needle of [
  "supabaseServerKeyHeaders()",
  "apikey: key",
  "/storage/v1/object/sign/",
]) {
  requireText(signer, needle, "publishing media signer");
}
forbidText(signer, "Authorization", "publishing signer delegates conditional auth");

const workerStorage = await text("src/platform/content-media-worker-storage.server.ts");
for (const needle of [
  "supabaseServerKeyHeaders()",
  "headers: { apikey: secretKey(), ...supabaseServerKeyHeaders() }",
  "apikey: secretKey()",
  '"x-upsert": "false"',
]) {
  requireText(workerStorage, needle, "autonomous media storage");
}
forbidText(workerStorage, "Authorization", "media storage delegates conditional auth");

console.log(`Supabase server-key compatibility verification passed (${checks} assertions).`);
