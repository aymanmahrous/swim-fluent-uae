import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const workflowDirectory = join(process.cwd(), ".github", "workflows");
const workflowFiles = (await readdir(workflowDirectory))
  .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
  .sort();

const manualWorkflows = {
  "ai-media-e2e.yml": {
    confirmation: "confirm_production_writes",
    job: "ai-media-e2e",
    concurrency: "production-ai-media-live-e2e",
    expectedUrls: [
      "https://swim-fluent-uae-w532.vercel.app",
      "https://nmzxrjdxvmmzzmajrskm.supabase.co/functions/v1/ai-media-e2e-admin",
    ],
  },
  "ai-media-current-production-e2e.yml": {
    confirmation: "confirm_production_writes",
    job: "ai-media-current-production-e2e",
    concurrency: "production-ai-media-live-e2e",
    expectedUrls: [
      "https://swim-fluent-uae-w532.vercel.app",
      "https://nmzxrjdxvmmzzmajrskm.supabase.co/functions/v1/ai-media-e2e-admin",
    ],
  },
  "ai-media-live-fallback.yml": {
    confirmation: "confirm_production_writes",
    job: "ai-media-live-fallback",
    concurrency: "production-ai-media-live-e2e",
    expectedUrls: [
      "https://swim-fluent-uae-w532.vercel.app",
      "https://nmzxrjdxvmmzzmajrskm.supabase.co/functions/v1/ai-media-e2e-admin",
    ],
  },
  "production-booking-smoke.yml": {
    confirmation: "confirm_production_write",
    job: "production-booking-smoke",
    concurrency: "production-booking-smoke",
    expectedUrls: [],
  },
};

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) {
    throw new Error(`${label}: forbidden ${JSON.stringify(needle)}`);
  }
}

for (const [file, contract] of Object.entries(manualWorkflows)) {
  const source = await readFile(join(workflowDirectory, file), "utf8");
  const label = `manual Production workflow ${file}`;

  requireText(source, "on:\n  workflow_dispatch:\n", label);
  for (const trigger of ["  push:", "  pull_request:", "  schedule:", "  workflow_run:"]) {
    forbidText(source, trigger, label);
  }

  requireText(source, `${contract.confirmation}:`, label);
  requireText(source, "required: true", label);
  requireText(source, "default: false", label);
  requireText(source, "type: boolean", label);
  requireText(source, "execution_reason:", label);
  requireText(source, "target_sha:", label);
  requireText(source, `  ${contract.job}:\n    if:`, label);
  requireText(source, "github.event_name == 'workflow_dispatch'", label);
  requireText(source, "github.ref == 'refs/heads/main'", label);
  requireText(source, `inputs.${contract.confirmation} == true`, label);
  requireText(source, "inputs.execution_reason != ''", label);
  requireText(source, "inputs.target_sha == github.sha", label);
  requireText(source, `group: ${contract.concurrency}`, label);
  requireText(source, "cancel-in-progress: false", label);
  requireText(source, "Validate manual Production authorization", label);
  requireText(source, "^[0-9a-f]{40}$", label);
  requireText(source, "Execution reason must not contain secrets", label);
  forbidText(source, "${{ secrets.", label);

  for (const url of contract.expectedUrls) {
    requireText(source, url, label);
  }
}

const ciSource = await readFile(join(workflowDirectory, "ci.yml"), "utf8");
requireText(ciSource, "node scripts/verify-supabase-booking-readonly.mjs", "automatic CI");
requireText(ciSource, "node scripts/verify-production-workflows-manual-only.mjs", "automatic CI");

for (const forbidden of [
  "node scripts/verify-supabase-booking.mjs",
  "ai-media-e2e-admin.mjs provision",
  "test:e2e:ai-media",
  "ai-media-live-fallback.spec.ts",
  "supabase db push",
  "supabase migration up",
  "supabase migration repair",
  "psql ",
]) {
  forbidText(ciSource, forbidden, "automatic CI");
}

const readonlyBookingSource = await readFile(
  join(process.cwd(), "scripts", "verify-supabase-booking-readonly.mjs"),
  "utf8",
);
requireText(readonlyBookingSource, 'method: "GET"', "read-only booking verification");
for (const forbidden of ['method: "POST"', "/rpc/", "INSERT", "UPDATE", "DELETE"]) {
  forbidText(readonlyBookingSource, forbidden, "read-only booking verification");
}

const liveBookingSource = await readFile(
  join(process.cwd(), "scripts", "verify-supabase-booking.mjs"),
  "utf8",
);
requireText(liveBookingSource, "PRODUCTION_BOOKING_SMOKE_CONFIRMED", "manual booking smoke script");
requireText(liveBookingSource, 'process.env.GITHUB_EVENT_NAME === "workflow_dispatch"', "manual booking smoke script");
requireText(liveBookingSource, 'process.env.GITHUB_REF === "refs/heads/main"', "manual booking smoke script");
requireText(liveBookingSource, 'method: "POST"', "manual booking smoke script");
forbidText(liveBookingSource, "bookingRequestId: first.bookingRequestId", "manual booking smoke privacy");

const automaticWriteMarkers = [
  "node scripts/verify-supabase-booking.mjs",
  "ai-media-e2e-admin.mjs provision",
  "test:e2e:ai-media",
  "ai-media-live-fallback.spec.ts",
];

for (const file of workflowFiles) {
  const source = await readFile(join(workflowDirectory, file), "utf8");
  const automatic = /^on:\n(?:[\s\S]*?\n)?\s{2}(push|pull_request|schedule|workflow_run):/m.test(source);
  if (!automatic) continue;

  for (const marker of automaticWriteMarkers) {
    if (source.includes(marker)) {
      throw new Error(`Automatic workflow ${file} still contains Production-write marker ${JSON.stringify(marker)}.`);
    }
  }
}

console.log(
  `Production workflow safety verification passed for ${Object.keys(manualWorkflows).length} manual workflows and ${workflowFiles.length} repository workflows.`,
);
