import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const server = await read("src/server.ts");
for (const header of [
  "Content-Security-Policy",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
]) {
  assert.ok(server.includes(`\"${header}\"`), `${header} must remain centrally enforced`);
}
assert.ok(server.includes("frame-ancestors 'none'"), "CSP must deny framing");
assert.ok(server.includes("object-src 'none'"), "CSP must disable plugins and object embedding");
assert.ok(server.includes("Cache-Control\", \"no-store, max-age=0"), "Sensitive routes must remain non-cacheable");
assert.ok(server.includes("sec-fetch-site"), "Unsafe requests must inspect Fetch Metadata");
assert.ok(server.includes('request.headers.get("origin")'), "Unsafe requests must validate Origin when supplied");
assert.ok(server.includes('code: "CSRF_REJECTED"'), "Cross-site unsafe requests must use the stable rejection contract");
assert.ok(
  server.indexOf("rejectCrossSiteUnsafeRequest(request)") < server.indexOf("handler.fetch(request, env, ctx)"),
  "CSRF checks must run before application route handlers",
);

const session = await read("src/platform/staff-session.server.ts");
for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/", "Max-Age="]) {
  assert.ok(session.includes(attribute), `Staff session cookies must retain ${attribute}`);
}
assert.ok(session.includes('"Cache-Control": "no-store"'), "Session responses must remain non-cacheable");
assert.ok(session.includes('grant: "password" | "refresh_token"'), "Session refresh must continue rotating through the auth provider");

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((path) => !path.startsWith("docs/"))
  .filter((path) => !path.endsWith("package-lock.json"))
  .filter((path) => path !== "scripts/verify-security-hardening-wave-1.mjs");

const forbiddenSecretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
];

for (const path of trackedFiles) {
  let source;
  try {
    source = await read(path);
  } catch {
    continue;
  }
  for (const pattern of forbiddenSecretPatterns) {
    assert.ok(!pattern.test(source), `${path} must not contain a committed credential matching ${pattern}`);
  }
}

const publicEnvUsage = execFileSync(
  "git",
  ["grep", "-nE", "(VITE_|import\\.meta\\.env)", "--", "src"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
).trim();
for (const line of publicEnvUsage.split("\n").filter(Boolean)) {
  assert.ok(
    !/(SERVICE_ROLE|PRIVATE_KEY|CLIENT_SECRET|ACCESS_TOKEN|REFRESH_TOKEN|PASSWORD|WEBHOOK_SECRET)/i.test(line),
    `Frontend-visible environment usage must not expose secret-class values: ${line}`,
  );
}

console.log("Security hardening wave 1 verification passed");
