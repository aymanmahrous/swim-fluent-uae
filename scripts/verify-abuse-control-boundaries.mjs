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
assert.ok(booking.includes("abuseControlFingerprint"), "Booking ingress must derive its fingerprint on the server");
assert.ok(booking.includes("supabaseSecretRpc"), "Booking ingress must use the privileged server-only RPC client");
assert.ok(booking.includes('"submit_booking_request_ingress"'), "Booking route must call the hardened ingress RPC");
assert.ok(!/["']submit_booking_request["']/.test(booking), "Booking route must not call the direct public RPC");
assert.ok(!booking.includes("supabasePublicHeaders"), "Booking route must not use public Supabase credentials");
assert.ok(booking.indexOf("abuseControlAllowed") < booking.indexOf("submit_booking_request_ingress"), "Booking abuse control must run before the hardened database RPC");

const bookingClient = await read("src/platform/booking-request.ts");
assert.ok(bookingClient.includes("p_honeypot"), "Booking client must send the honeypot signal");
assert.ok(bookingClient.includes("p_form_elapsed_ms"), "Booking client must send elapsed form time");

const bookingMigration = await read("supabase/migrations/20260729144612_harden_booking_ingress_rpc.sql");
assert.ok(bookingMigration.includes("revoke all on function public.submit_booking_request("), "Direct booking RPC execute must be revoked");
assert.ok(bookingMigration.includes("grant execute on function public.submit_booking_request("), "Direct booking RPC must retain service-only execution");
assert.ok(bookingMigration.includes("revoke all on function public.enqueue_content_media_after_insert()"), "Media trigger execute grants must be hardened");

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
