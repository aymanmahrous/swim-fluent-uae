import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  canonicalPhoneDisplay,
  internationalPhoneCountries,
  phoneCountryCallingCode,
  validateInternationalPhone,
} from "../src/platform/international-phone.ts";

const root = process.cwd();
let checks = 0;

function verify(condition, message) {
  checks += 1;
  assert.ok(condition, message);
}

function valid(country, value) {
  const result = validateInternationalPhone(country, value);
  verify(result.success, `${country} expected valid: ${value}`);
  return result;
}

function invalid(country, value, expectedCode) {
  const result = validateInternationalPhone(country, value);
  verify(!result.success, `${country} expected invalid: ${value}`);
  if (!result.success && expectedCode) {
    verify(result.code === expectedCode, `${country} expected ${expectedCode}, got ${result.code}`);
  }
  return result;
}

const uaeLocal = valid("AE", "050 123 4567");
const uaePlus = valid("AE", "+971 50 123 4567");
const uaeDoubleZero = valid("AE", "00971 50 123 4567");
verify(uaeLocal.success && uaeLocal.e164 === "+971501234567", "UAE local E.164 mismatch");
verify(
  uaeLocal.success &&
    uaePlus.success &&
    uaeDoubleZero.success &&
    new Set([uaeLocal.normalized, uaePlus.normalized, uaeDoubleZero.normalized]).size === 1,
  "Equivalent UAE formats must share one canonical normalized_phone",
);

valid("EG", "010 0123 4567");
valid("SA", "050 123 4567");
valid("GB", "020 7946 0018");
valid("IN", "91234 56789");
valid("US", "(202) 555-0123");
valid("AE", "(050) 123-4567");

invalid("AE", "123", "INVALID_PHONE");
invalid("AE", "+97150123456789012345", "INVALID_PHONE");
invalid("AE", "+999123456789", "INVALID_PHONE");
invalid("US", "111 111 1111", "INVALID_PHONE");
invalid("AE", "+44 20 7946 0018", "COUNTRY_MISMATCH");
invalid("AE", "971501234567", "COUNTRY_CODE_DUPLICATED");

verify(internationalPhoneCountries().length > 200, "Country selector must not be a short fixed list");
for (const [country, callingCode] of [
  ["AE", "971"],
  ["EG", "20"],
  ["SA", "966"],
  ["KW", "965"],
  ["QA", "974"],
  ["BH", "973"],
  ["OM", "968"],
  ["JO", "962"],
  ["GB", "44"],
  ["US", "1"],
  ["IN", "91"],
]) {
  verify(phoneCountryCallingCode(country) === callingCode, `${country} calling code mismatch`);
}

verify(
  canonicalPhoneDisplay("971501234567", "fallback").startsWith("+971"),
  "Staff display must retain the full international calling code",
);
verify(
  canonicalPhoneDisplay("not-valid", "legacy display") === "legacy display",
  "Staff display must safely preserve incompatible legacy values",
);

const migration = await readFile(
  join(root, "supabase/migrations/20260711_000031_international_booking_phones.sql"),
  "utf8",
);
const phoneUtility = await readFile(
  join(root, "src/platform/international-phone.ts"),
  "utf8",
);
const phoneField = await readFile(
  join(root, "src/components/international-phone-field.tsx"),
  "utf8",
);
const publicHome = await readFile(join(root, "src/components/public-home.tsx"), "utf8");
const apiRoute = await readFile(join(root, "src/routes/api.booking-request.ts"), "utf8");
const client = await readFile(join(root, "src/platform/booking-request.ts"), "utf8");
const staff = await readFile(join(root, "src/routes/staff.tsx"), "utf8");
const store = await readFile(join(root, "src/lib/store.ts"), "utf8");

verify(
  phoneUtility.includes('DEFAULT_PHONE_COUNTRY: CountryCode = "AE"'),
  "UAE must remain the default booking phone country",
);

for (const needle of [
  'type="search"',
  'role="listbox"',
  'role="option"',
  'aria-selected=',
  'aria-haspopup="listbox"',
  'inputMode="tel"',
  'autoComplete="tel-national"',
  'sm:grid-cols-[minmax(11rem,0.85fr)_minmax(0,1.15fr)]',
  "رقم الهاتف غير صالح لهذه الدولة.",
  "This phone number is not valid for the selected country.",
]) {
  verify(phoneField.includes(needle), `International phone UI missing ${needle}`);
}

for (const needle of [
  "phoneCountry: DEFAULT_PHONE_COUNTRY",
  "validateInternationalPhone(form.phoneCountry, form.phone)",
  "phoneValidation.success",
  "formElapsedMs:",
  "honeypot: form.honeypot",
  "InternationalPhoneField",
  'name="website"',
  "validatedPhone.internationalDisplay",
]) {
  verify(publicHome.includes(needle), `Public booking form missing ${needle}`);
}

for (const needle of [
  'supabaseSecretRpc("submit_booking_request_ingress"',
  "validateInternationalPhone(payload.p_phone_country, payload.p_phone)",
  "requestFingerprint(request)",
  'createHash("sha256")',
  '"Cache-Control": "no-store"',
]) {
  verify(apiRoute.includes(needle), `Server booking validation missing ${needle}`);
}

for (const forbidden of [
  "supabasePublicHeaders",
  "/rest/v1/rpc/submit_booking_request\"",
  "console.error(\"booking_request_proxy_failed\", error)",
]) {
  verify(!apiRoute.includes(forbidden), `Server booking route contains forbidden ${forbidden}`);
}

for (const needle of [
  "p_phone_country: input.phoneCountry",
  "p_honeypot: input.honeypot",
  "p_form_elapsed_ms: input.formElapsedMs",
]) {
  verify(client.includes(needle), `Booking client missing ${needle}`);
}

for (const needle of [
  "normalize_international_phone",
  "booking_requests_normalized_phone_e164_check",
  "booking_ingress_attempts_normalized_phone_check",
  "where normalized_phone = v_phone",
  "pg_advisory_xact_lock(42002, hashtext(v_phone))",
  "v_phone_24h >= 5",
  "v_phone_7d >= 12",
  "where idempotency_key = p_idempotency_key",
  "grant execute on function public.submit_booking_request_ingress",
  "to service_role",
]) {
  verify(migration.includes(needle), `Database contract missing ${needle}`);
}

for (const forbidden of [
  "update public.booking_requests set normalized_phone",
  "delete from public.booking_requests",
  "disable row level security",
  "grant insert on public.booking_requests to anon",
  "grant select on public.booking_requests to anon",
]) {
  verify(!migration.includes(forbidden), `Migration contains destructive/unsafe ${forbidden}`);
}

verify(staff.includes("normalized_phone: z.string()"), "Staff schema must receive normalized_phone");
verify(staff.includes("canonicalPhoneDisplay"), "Staff must display canonical international phone");
verify(staff.includes("https://wa.me/${phoneDigits}"), "Staff WhatsApp link must use canonical digits");
verify(staff.includes("tel:+${phoneDigits}"), "Staff call link must use canonical phone");
verify(store.includes("`Phone: ${booking.phone}\\n`"), "WhatsApp booking message phone line changed unexpectedly");

console.log(`International booking phone verification passed (${checks} assertions).`);
