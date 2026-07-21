import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

const login = await read("src/routes/api.staff-session.ts");
assert.ok(login.includes("abuseControlAllowed"), "Staff login must enforce centralized abuse control");
assert.ok(login.includes('scope: "staff-login"'), "Staff login must keep a dedicated abuse-control scope");
assert.ok(login.includes("rateLimitedResponse"), "Staff login must return a standardized 429 response");

const booking = await read("src/routes/api.booking-request.ts");
assert.ok(booking.includes("abuseControlAllowed"), "Public booking ingress must enforce abuse control before proxying");
assert.ok(booking.includes('scope: "public-booking"'), "Public booking must keep a dedicated abuse-control scope");
assert.ok(booking.indexOf("abuseControlAllowed") < booking.indexOf("submit_booking_request"), "Booking abuse control must run before the database RPC");

const recovery = await read("src/routes/api.password-recovery.ts");
const recoveryPolicy = await read("src/platform/password-recovery.server.ts");
assert.ok(recovery.includes("passwordRecoveryAllowed"), "Password recovery must enforce its enumeration-safe limiter");
assert.ok(recovery.includes("Retry-After"), "Password recovery rate limiting must include Retry-After");
assert.match(recoveryPolicy, /MAX_ATTEMPTS\s*=\s*3/, "Password recovery must retain the audited attempt ceiling");
assert.match(recoveryPolicy, /WINDOW_MS\s*=\s*15\s*\*\s*60\s*\*\s*1000/, "Password recovery must retain the audited 15-minute window");

const aiProviderRoutes = [
  "src/routes/api.os-content-generate.ts",
  "src/routes/api.os-media-copy.ts",
  "src/routes/api.os-media-generate-image.ts",
  "src/routes/api.os-media-generate-video.ts",
];
for (const path of aiProviderRoutes) {
  const source = await read(path);
  assert.ok(source.includes("resolveStaffSession"), `${path} must remain inaccessible without Staff authentication`);
  assert.ok(source.includes("hasStaffPermission"), `${path} must retain centralized RBAC before provider use`);
  assert.ok(/safeParse\(/.test(source), `${path} must validate bounded input before provider use`);
  assert.ok(/\.max\(/.test(source), `${path} must retain explicit input-size ceilings`);
  assert.ok(source.indexOf("hasStaffPermission") < Math.max(source.indexOf("generateText"), source.indexOf("generateImage"), source.indexOf("createVideoJob")), `${path} must authorize before invoking an AI provider`);
}

const helper = await read("src/platform/abuse-control.server.ts");
assert.ok(helper.includes("createHash"), "Abuse-control keys must not store raw client identifiers");
assert.ok(helper.includes('code: "RATE_LIMITED"'), "Central abuse control must preserve the standardized code");
assert.ok(helper.includes('"Retry-After"'), "Central abuse control must preserve Retry-After");

console.log("Abuse-control boundary verification passed");
