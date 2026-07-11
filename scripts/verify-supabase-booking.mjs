const authorized =
  process.env.GITHUB_EVENT_NAME === "workflow_dispatch" &&
  process.env.GITHUB_REF === "refs/heads/main" &&
  process.env.PRODUCTION_BOOKING_SMOKE_CONFIRMED === "true" &&
  /^[0-9a-f]{40}$/.test(process.env.PRODUCTION_BOOKING_TARGET_SHA ?? "") &&
  process.env.PRODUCTION_BOOKING_TARGET_SHA === process.env.GITHUB_SHA;

if (!authorized) {
  throw new Error(
    "Production booking smoke is manual-only and requires confirmed workflow_dispatch on the exact main SHA.",
  );
}

const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const publishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";
const validIdempotencyKey = "ca87d16b-0f59-4fef-a548-0ea702e5a002";

const headers = {
  apikey: publishableKey,
  Accept: "application/json",
  "Content-Type": "application/json",
};

const settingsResponse = await fetch(
  `${projectUrl}/rest/v1/business_settings?select=id,booking_enabled&id=eq.primary&limit=1`,
  { method: "GET", headers },
);

if (!settingsResponse.ok) {
  throw new Error(`Business settings check failed with HTTP ${settingsResponse.status}.`);
}

const settings = await settingsResponse.json();
if (settings.length !== 1 || settings[0].id !== "primary" || settings[0].booking_enabled !== true) {
  throw new Error("Business settings contract did not match the expected primary enabled row.");
}

async function callBooking(overrides = {}) {
  const response = await fetch(`${projectUrl}/rest/v1/rpc/submit_booking_request`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_full_name: "Relax Fix Manual Production Booking Smoke",
      p_phone: "+971552468135",
      p_gender: "Male",
      p_category: "Adult",
      p_location: "Al Falah",
      p_other_location: null,
      p_swam_before: true,
      p_fear_of_water: false,
      p_training_type: "Private",
      p_requested_date: "2099-01-15",
      p_requested_time: "19:00",
      p_terms_accepted: true,
      p_idempotency_key: validIdempotencyKey,
      ...overrides,
    }),
  });

  if (!response.ok) {
    throw new Error(`Booking RPC failed with HTTP ${response.status}.`);
  }

  return response.json();
}

const invalidPhone = await callBooking({
  p_phone: "not-a-phone",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a003",
});
if (invalidPhone?.success !== false || invalidPhone?.code !== "INVALID_PHONE") {
  throw new Error("Invalid-phone guard did not return INVALID_PHONE.");
}

const invalidOption = await callBooking({
  p_gender: "Anything",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a004",
});
if (invalidOption?.success !== false || invalidOption?.code !== "INVALID_INPUT") {
  throw new Error("Option allowlist guard did not return INVALID_INPUT.");
}

const invalidSlot = await callBooking({
  p_requested_time: "23:45",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a005",
});
if (invalidSlot?.success !== false || invalidSlot?.code !== "INVALID_INPUT") {
  throw new Error("Schedule guard did not return INVALID_INPUT.");
}

const first = await callBooking();
if (first?.success !== true || typeof first.bookingRequestId !== "string") {
  throw new Error("Valid manual Production booking smoke did not succeed.");
}

const second = await callBooking();
if (
  second?.success !== true ||
  second?.bookingRequestId !== first.bookingRequestId ||
  second?.duplicate !== true
) {
  throw new Error("Manual Production booking idempotency verification failed.");
}

console.log(
  JSON.stringify({
    settings: "ok",
    invalidPhone: "ok",
    optionAllowlist: "ok",
    schedule: "ok",
    booking: "ok",
    idempotency: "ok",
  }),
);
