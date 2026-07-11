import { expect, test } from "@playwright/test";

function bookingPayload(overrides: Record<string, unknown> = {}) {
  return {
    p_full_name: "International Phone Test",
    p_phone: "123",
    p_phone_country: "AE",
    p_language: "en",
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
    p_idempotency_key: "00000000-0000-4000-8000-000000000031",
    p_honeypot: "",
    p_form_elapsed_ms: 3000,
    ...overrides,
  };
}

test("rejects a short number before any database booking call", async ({ request }) => {
  const response = await request.post("/api/booking-request", {
    data: bookingPayload(),
  });

  expect(response.status()).toBe(400);
  await expect(response).toHaveHeader("cache-control", "no-store");
  const body = await response.json();
  expect(body).toEqual({
    success: false,
    code: "INVALID_PHONE",
    message: "The phone number is not valid for the selected country.",
  });
});

test("returns the Arabic validation message for a country mismatch", async ({ request }) => {
  const response = await request.post("/api/booking-request", {
    data: bookingPayload({
      p_phone: "+44 20 7946 0018",
      p_phone_country: "AE",
      p_language: "ar",
      p_idempotency_key: "00000000-0000-4000-8000-000000000032",
    }),
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.success).toBe(false);
  expect(body.code).toBe("INVALID_PHONE");
  expect(body.message).toBe("رقم الهاتف غير صالح للدولة المختارة.");
});

test("rejects a duplicated calling code without reaching ingress", async ({ request }) => {
  const response = await request.post("/api/booking-request", {
    data: bookingPayload({
      p_phone: "971501234567",
      p_idempotency_key: "00000000-0000-4000-8000-000000000033",
    }),
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body).toMatchObject({ success: false, code: "INVALID_PHONE" });
});

test("rejects malformed booking metadata without exposing customer data", async ({ request }) => {
  const response = await request.post("/api/booking-request", {
    data: bookingPayload({
      p_phone_country: "INVALID",
      p_idempotency_key: "00000000-0000-4000-8000-000000000034",
    }),
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body).toMatchObject({ success: false, code: "INVALID_INPUT" });
  expect(JSON.stringify(body)).not.toContain("International Phone Test");
});
