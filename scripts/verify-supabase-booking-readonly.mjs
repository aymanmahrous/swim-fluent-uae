import { readFile } from "node:fs/promises";

const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const publishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

const settingsResponse = await fetch(
  `${projectUrl}/rest/v1/business_settings?select=id,booking_enabled&id=eq.primary&limit=1`,
  {
    method: "GET",
    headers: {
      apikey: publishableKey,
      Accept: "application/json",
    },
  },
);

if (!settingsResponse.ok) {
  throw new Error(`Read-only business_settings verification failed with HTTP ${settingsResponse.status}.`);
}

const settings = await settingsResponse.json();
if (
  !Array.isArray(settings) ||
  settings.length !== 1 ||
  settings[0]?.id !== "primary" ||
  settings[0]?.booking_enabled !== true
) {
  throw new Error("Read-only business_settings contract did not match the expected primary enabled row.");
}

const bookingRequestSource = await readFile("src/platform/booking-request.ts", "utf8");
const publicHomeSource = await readFile("src/components/public-home.tsx", "utf8");
const ciSource = await readFile(".github/workflows/ci.yml", "utf8");

for (const [source, needle, label] of [
  [bookingRequestSource, "submitBookingRequest", "booking request client contract"],
  [publicHomeSource, "submitBookingRequest", "public booking form contract"],
  [ciSource, "verify-supabase-booking-readonly.mjs", "automatic CI read-only contract"],
]) {
  if (!source.includes(needle)) {
    throw new Error(`${label} is missing ${JSON.stringify(needle)}.`);
  }
}

if (ciSource.includes("node scripts/verify-supabase-booking.mjs")) {
  throw new Error("Automatic CI still invokes the Production-writing booking smoke test.");
}

console.log("Read-only Supabase booking settings and static booking contracts passed.");
