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

const migration = await text(
  "supabase/migrations/20260711_000031_international_booking_phones.sql",
);
const apiRoute = await text("src/routes/api.booking-request.ts");
const client = await text("src/platform/booking-request.ts");
const staff = await text("src/routes/staff.tsx");

for (const needle of [
  "create or replace function public.normalize_international_phone",
  "'^[1-9][0-9]{7,14}$'",
  "create or replace function public.normalize_uae_phone",
  "create or replace function public.submit_booking_request(",
  "create or replace function public.submit_booking_request_ingress(",
  "security definer",
  "set search_path = public, pg_temp",
  "where idempotency_key = p_idempotency_key",
  "where normalized_phone = v_phone",
  "pg_advisory_xact_lock(42002, hashtext(v_phone))",
  "v_phone_24h >= 5",
  "v_phone_7d >= 12",
  "p_form_elapsed_ms < 2500",
  "booking_requests_normalized_phone_e164_check",
  "booking_ingress_attempts_normalized_phone_check",
  "grant execute on function public.submit_booking_request_ingress",
  "to service_role",
  "revoke all on public.booking_requests from anon, authenticated",
  "revoke all on public.booking_ingress_attempts from anon, authenticated",
]) {
  requireText(migration, needle, "international booking database contract");
}

for (const needle of [
  "update public.booking_requests set normalized_phone",
  "delete from public.booking_requests",
  "disable row level security",
  "grant select on public.booking_requests to anon",
  "grant insert on public.booking_requests to anon",
]) {
  forbidText(migration, needle, "non-destructive booking migration");
}

for (const needle of [
  'validateInternationalPhone(payload.p_phone_country, payload.p_phone)',
  'supabaseSecretRpc("submit_booking_request_ingress"',
  "requestFingerprint(request)",
  "p_client_fingerprint",
  "p_honeypot",
  "p_form_elapsed_ms",
  '"Cache-Control": "no-store"',
]) {
  requireText(apiRoute, needle, "booking API ingress contract");
}

for (const needle of [
  "supabasePublicHeaders",
  "/rest/v1/rpc/submit_booking_request\"",
  "console.error(\"booking_request_proxy_failed\", error)",
]) {
  forbidText(apiRoute, needle, "booking API security boundary");
}

for (const needle of [
  "p_phone_country: input.phoneCountry",
  "p_language: input.language",
  "p_honeypot: input.honeypot",
  "p_form_elapsed_ms: input.formElapsedMs",
]) {
  requireText(client, needle, "booking client ingress metadata");
}

requireText(staff, "normalized_phone: z.string()", "staff canonical phone contract");
requireText(staff, "canonicalPhoneDisplay", "staff canonical phone contract");
requireText(staff, "https://wa.me/${phoneDigits}", "staff WhatsApp phone contract");
requireText(staff, "tel:+${phoneDigits}", "staff call phone contract");

console.log(`Supabase booking verification passed (${checks} assertions, no live writes).`);
