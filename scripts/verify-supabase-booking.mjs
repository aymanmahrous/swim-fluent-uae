const projectUrl = "https://nmzxrjdxvmmzzmajrskm.supabase.co";
const publishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

const headers = {
  apikey: publishableKey,
  Accept: "application/json",
};

const settingsResponse = await fetch(
  `${projectUrl}/rest/v1/business_settings?select=id,booking_enabled,whatsapp_number&id=eq.primary&limit=1`,
  {
    method: "GET",
    headers,
  },
);

if (!settingsResponse.ok) {
  throw new Error(
    `business_settings read-only smoke test failed (${settingsResponse.status}): ${await settingsResponse.text()}`,
  );
}

const settings = await settingsResponse.json();
if (
  settings.length !== 1 ||
  settings[0].id !== "primary" ||
  settings[0].booking_enabled !== true ||
  typeof settings[0].whatsapp_number !== "string"
) {
  throw new Error(`Unexpected business_settings response shape: ${JSON.stringify(settings)}`);
}

console.log(
  JSON.stringify({
    mode: "read-only",
    settings: "ok",
    bookingWrites: 0,
    rpcCalls: 0,
  }),
);
