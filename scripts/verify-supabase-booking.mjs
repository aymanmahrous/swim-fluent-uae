const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const publishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";
const idempotencyKey = "ca87d16b-0f59-4fef-a548-0ea702e5a001";

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

const bookingResponse = await fetch(`${projectUrl}/rest/v1/rpc/submit_booking_request`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    p_full_name: "Relax Fix CI Booking Smoke",
    p_phone: "+971552468135",
    p_gender: "Male",
    p_category: "Adult",
    p_location: "Al Falah",
    p_other_location: null,
    p_swam_before: true,
    p_fear_of_water: false,
    p_training_type: "Private",
    p_requested_date: "2099-01-15",
    p_requested_time: "23:45",
    p_terms_accepted: true,
    p_idempotency_key: idempotencyKey,
  }),
});

if (!bookingResponse.ok) {
  throw new Error(
    `booking RPC smoke test failed (${bookingResponse.status}): ${await bookingResponse.text()}`,
  );
}

const result = await bookingResponse.json();
if (result?.success !== true || typeof result.bookingRequestId !== "string") {
  throw new Error(`Unexpected booking RPC response: ${JSON.stringify(result)}`);
}

console.log(
  JSON.stringify({
    settings: "ok",
    booking: "ok",
    bookingRequestId: result.bookingRequestId,
    duplicate: result.duplicate,
  }),
);
