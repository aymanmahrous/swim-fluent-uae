import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const routesDir = "src/routes";
const routeFiles = (await readdir(routesDir))
  .filter((name) => name.startsWith("api.") && name.endsWith(".ts"))
  .sort();

assert.ok(routeFiles.length >= 20, "API inventory unexpectedly shrank; review route discovery logic");

const intentionallyPublic = new Set([
  "api.booking-request.ts",
  "api.business-settings.ts",
  "api.password-recovery.ts",
  "api.password-reset.ts",
  "api.staff-password-request.ts",
  "api.staff-password-reset.ts",
  "api.staff-session.ts",
]);

for (const file of routeFiles) {
  const source = await readFile(`${routesDir}/${file}`, "utf8");
  assert.ok(source.includes("createFileRoute("), `${file} must remain an explicit route module`);

  if (intentionallyPublic.has(file)) continue;

  if (file.startsWith("api.os-") || file.startsWith("api.staff-")) {
    assert.ok(
      source.includes("resolveStaffSession(request)"),
      `${file} must resolve a Staff session before serving protected data`,
    );
    continue;
  }

  if (file.startsWith("api.internal.") || file.startsWith("api.cron.")) {
    assert.ok(
      /(authorization|Authorization|INTERNAL_|CRON_|secret|Secret|timingSafeEqual|verify)/.test(source),
      `${file} must retain an explicit machine-authentication boundary`,
    );
    continue;
  }

  assert.fail(`${file} is not classified in the public API inventory`);
}

const mediaStorage = await readFile("src/platform/media-storage.server.ts", "utf8");
for (const contract of [
  "MAX_PROVIDER_ASSET_BYTES",
  "allowedContentType",
  "PROVIDER_ASSET_HOST_NOT_ALLOWLISTED",
  'redirect: "manual"',
  '"x-upsert": "false"',
  "encodedObjectPath",
]) {
  assert.ok(mediaStorage.includes(contract), `Media storage must retain ${contract}`);
}
assert.ok(
  mediaStorage.includes('url.protocol !== "https:"') && mediaStorage.includes("isIP(url.hostname)"),
  "Remote media downloads must remain HTTPS-only and reject literal IP hosts",
);

const mediaSecurity = await readFile("src/platform/media-security.server.ts", "utf8");
for (const signature of ["image/png", "image/jpeg", "image/webp", "video/mp4", "PROVIDER_ASSET_TOO_LARGE"]) {
  assert.ok(mediaSecurity.includes(signature), `Media signature validation must retain ${signature}`);
}
assert.ok(mediaSecurity.includes("response.body.getReader()"), "Remote response reads must support bounded streaming");
assert.ok(mediaSecurity.includes("reader.cancel("), "Oversized remote reads must be cancelled");

const imageRoute = await readFile("src/routes/api.os-media-generate-image.ts", "utf8");
assert.ok(imageRoute.includes("assertMediaSignature(bytes, contentType, \"image\")"));
assert.ok(imageRoute.includes("PUBLIC_ERROR_CODES"), "Image generation must expose allowlisted error codes only");
assert.ok(
  !imageRoute.includes("message.split(\":\")[0].replace") || imageRoute.includes("PUBLIC_ERROR_CODES.has(candidate)"),
  "Provider messages must not become arbitrary public error codes",
);

const videoRoute = await readFile("src/routes/api.os-media-generate-video.ts", "utf8");
for (const redaction of ["[REDACTED_URL]", "Bearer [REDACTED]", "[REDACTED_QUERY]"]) {
  assert.ok(videoRoute.includes(redaction), `Video provider logs must retain ${redaction}`);
}
assert.ok(videoRoute.includes("sanitized_message"), "Video failure logging must remain structured and sanitized");

const server = await readFile("src/server.ts", "utf8");
assert.ok(server.includes("renderErrorPage()"), "SSR failures must use a generic public error page");
assert.ok(!server.includes("stack:"), "Server error responses must not serialize stack traces");

console.log(`Attack surface wave 2 verification passed for ${routeFiles.length} API routes`);
