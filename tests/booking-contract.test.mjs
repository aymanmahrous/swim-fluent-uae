import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const text = async (relativePath) =>
  readFile(new URL(relativePath, root), "utf8");

const requiredText = (source, needles, label) => {
  for (const needle of needles) {
    assert.ok(
      source.includes(needle),
      `${label} is missing required contract: ${needle}`,
    );
  }
};

test("booking ingress route keeps its safety contract", async () => {
  const route = await text("src/routes/api.booking-request.ts");
  requiredText(
    route,
    [
      'createFileRoute("/api/booking-request")',
      'POST: async ({ request })',
      "BookingIngressSchema.safeParse(payload)",
      'code: "INVALID_INPUT"',
      'status: 400',
      '"Cache-Control": "no-store"',
      'supabaseSecretRpc("submit_booking_request_ingress"',
      'p_idempotency_key',
      'p_honeypot',
      'p_form_elapsed_ms',
      'status: 503',
    ],
    "booking ingress route",
  );
  assert.doesNotMatch(
    route,
    /SUPABASE_(?:SERVICE|SECRET)|service_role|process\.env\.[A-Z0-9_]*KEY/,
    "booking route must not expose privileged credentials",
  );
});

test("booking phone foundation defines the production dependency", async () => {
  const migration = await text(
    "supabase/migrations/20260711003100_international_booking_phone_foundation.sql",
  );
  requiredText(
    migration,
    [
      "create or replace function public.normalize_uae_phone(p_phone text)",
      "set search_path = public, pg_temp",
      "revoke all on function public.normalize_uae_phone(text)",
      "from public, anon, authenticated",
      "grant execute on function public.normalize_uae_phone(text) to service_role",
    ],
    "UAE phone normalizer migration",
  );

  const ingress = await text(
    "supabase/migrations/20260708_000023_harden_public_booking_ingress.sql",
  );
  requiredText(
    ingress,
    [
      "public.normalize_uae_phone(p_phone)",
      "submit_booking_request_ingress",
      "security definer",
      "set search_path = public, pg_temp",
    ],
    "public booking ingress migration",
  );
});

test("CI runs the aggregate contract suite", async () => {
  const packageJson = JSON.parse(await text("package.json"));
  assert.match(packageJson.scripts.test, /tests\/\*\.test\.(?:ts|mjs)/);

  const ci = await text(".github/workflows/ci.yml");
  requiredText(ci, ["run: npm test"], "CI workflow");
});

test("production-writing smoke workflows remain explicitly gated", async () => {
  const workflow = await text(".github/workflows/production-booking-smoke.yml");
  requiredText(
    workflow,
    [
      "workflow_dispatch",
      "confirm_production_write",
      "PRODUCTION_BOOKING_SMOKE_CONFIRMED",
      "target_sha",
    ],
    "production booking smoke workflow",
  );
});
