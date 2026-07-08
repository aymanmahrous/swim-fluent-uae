const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const publishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";
const validIdempotencyKey = "ca87d16b-0f59-4fef-a548-0ea702e5a002";

const headers = {
  apikey: publishableKey,
  Accept: "application/json",
  "Content-Type": "application/json",
};

const settingsResponse = await fetch(
  `${projectUrl}/rest/v1/business_settings?select=id,booking_enabled,whatsapp_number&id=eq.primary&limit=1`,
  { headers },
);

if (!settingsResponse.ok) {
  throw new Error(
    `business_settings smoke test failed (${settingsResponse.status}): ${await settingsResponse.text()}`,
  );
}

const settings = await settingsResponse.json();
if (settings.length !== 1 || settings[0].id !== "primary" || settings[0].booking_enabled !== true) {
  throw new Error(`Unexpected business_settings response: ${JSON.stringify(settings)}`);
}

async function callBooking(overrides = {}) {
  const response = await fetch(`${projectUrl}/rest/v1/rpc/submit_booking_request`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_full_name: "Relax Fix CI Booking Smoke Hardened",
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
    throw new Error(`booking RPC HTTP failure (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

const invalidPhone = await callBooking({
  p_phone: "not-a-phone",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a003",
});
if (invalidPhone?.success !== false || invalidPhone?.code !== "INVALID_PHONE") {
  throw new Error(`Invalid-phone guard failed: ${JSON.stringify(invalidPhone)}`);
}

const invalidOption = await callBooking({
  p_gender: "Anything",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a004",
});
if (invalidOption?.success !== false || invalidOption?.code !== "INVALID_INPUT") {
  throw new Error(`Option allowlist guard failed: ${JSON.stringify(invalidOption)}`);
}

const invalidSlot = await callBooking({
  p_requested_time: "23:45",
  p_idempotency_key: "ca87d16b-0f59-4fef-a548-0ea702e5a005",
});
if (invalidSlot?.success !== false || invalidSlot?.code !== "INVALID_INPUT") {
  throw new Error(`Schedule guard failed: ${JSON.stringify(invalidSlot)}`);
}

const first = await callBooking();
if (first?.success !== true || typeof first.bookingRequestId !== "string") {
  throw new Error(`Valid booking failed: ${JSON.stringify(first)}`);
}

const second = await callBooking();
if (
  second?.success !== true ||
  second?.bookingRequestId !== first.bookingRequestId ||
  second?.duplicate !== true
) {
  throw new Error(`Idempotency guard failed: ${JSON.stringify({ first, second })}`);
}

console.log(
  JSON.stringify({
    settings: "ok",
    invalidPhone: "ok",
    optionAllowlist: "ok",
    schedule: "ok",
    booking: "ok",
    idempotency: "ok",
    bookingRequestId: first.bookingRequestId,
  }),
);
