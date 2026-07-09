import { z } from "zod";
import { processOneContentMediaJob, type WorkerProcessResult } from "./content-media-worker.server";
import { processOnePublishJob } from "./publish-worker.server";
import { supabaseSecretRpc } from "./supabase-secret.server";

const AUTOMATION_LEASE_NAME = "content_automation";
const AUTOMATION_LEASE_SECONDS = 240;
const MAX_MEDIA_ATTEMPTS_PER_CYCLE = 2;
const MAX_PUBLISH_ATTEMPTS_PER_CYCLE = 6;

const LeaseClaimSchema = z.discriminatedUnion("claimed", [
  z.object({
    claimed: z.literal(false),
    code: z.string(),
    leaseName: z.string(),
    lockedUntil: z.string(),
  }),
  z.object({
    claimed: z.literal(true),
    leaseName: z.string(),
    leaseToken: z.string().uuid(),
    lockedUntil: z.string(),
  }),
]);

const StartRunSchema = z.object({
  success: z.literal(true),
  runId: z.string().uuid(),
  source: z.enum(["vercel_cron", "supabase_cron", "internal_manual"]),
  status: z.literal("running"),
  startedAt: z.string(),
});

export type AutomationRunSource = z.infer<typeof StartRunSchema>["source"];

export type AutomationCycleResult = {
  status: number;
  body: Record<string, unknown>;
};

type WorkerSummary = {
  status: number;
  success: boolean | null;
  processed: boolean | null;
  code: string | null;
  jobId: string | null;
  contentItemId: string | null;
  assetType: string | null;
  platform: string | null;
  provider: string | null;
};

async function rpcJson(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  const response = await supabaseSecretRpc(functionName, body);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${functionName.toUpperCase()}_HTTP_${response.status}`);
  return payload;
}

function stringValue(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  return typeof value === "string" ? value : null;
}

function booleanValue(body: Record<string, unknown>, key: string): boolean | null {
  const value = body[key];
  return typeof value === "boolean" ? value : null;
}

function summarizeWorkerResult(result: WorkerProcessResult): WorkerSummary {
  return {
    status: result.status,
    success: booleanValue(result.body, "success"),
    processed: booleanValue(result.body, "processed"),
    code: stringValue(result.body, "code"),
    jobId: stringValue(result.body, "jobId"),
    contentItemId: stringValue(result.body, "contentItemId"),
    assetType: stringValue(result.body, "assetType"),
    platform: stringValue(result.body, "platform"),
    provider: stringValue(result.body, "provider"),
  };
}

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return "CONTENT_AUTOMATION_FAILED";
}

function resultIsFailure(result: WorkerProcessResult): boolean {
  return result.body.success === false;
}

async function drainMediaQueue(): Promise<{
  attempts: number;
  processed: number;
  hadFailure: boolean;
  results: WorkerSummary[];
}> {
  let attempts = 0;
  let processed = 0;
  let hadFailure = false;
  const results: WorkerSummary[] = [];

  for (let index = 0; index < MAX_MEDIA_ATTEMPTS_PER_CYCLE; index += 1) {
    const result = await processOneContentMediaJob();
    const summary = summarizeWorkerResult(result);
    if (summary.code === "NO_DUE_CONTENT_MEDIA_JOB") break;

    attempts += 1;
    if (summary.processed) processed += 1;
    if (resultIsFailure(result)) hadFailure = true;
    results.push(summary);
  }

  return { attempts, processed, hadFailure, results };
}

async function drainPublishQueue(): Promise<{
  attempts: number;
  processed: number;
  hadFailure: boolean;
  results: WorkerSummary[];
}> {
  let attempts = 0;
  let processed = 0;
  let hadFailure = false;
  const results: WorkerSummary[] = [];

  for (let index = 0; index < MAX_PUBLISH_ATTEMPTS_PER_CYCLE; index += 1) {
    const result = await processOnePublishJob();
    const summary = summarizeWorkerResult(result);
    if (summary.code === "NO_JOB") break;

    attempts += 1;
    if (summary.processed) processed += 1;
    if (resultIsFailure(result)) hadFailure = true;
    results.push(summary);
  }

  return { attempts, processed, hadFailure, results };
}

export async function runContentAutomationCycle(
  source: AutomationRunSource,
): Promise<AutomationCycleResult> {
  const lease = LeaseClaimSchema.safeParse(
    await rpcJson("claim_content_automation_lease", {
      p_lease_name: AUTOMATION_LEASE_NAME,
      p_lease_seconds: AUTOMATION_LEASE_SECONDS,
    }),
  );
  if (!lease.success) {
    return {
      status: 502,
      body: { success: false, code: "INVALID_AUTOMATION_LEASE_RESPONSE" },
    };
  }
  if (!lease.data.claimed) {
    return {
      status: 200,
      body: {
        success: true,
        processed: false,
        code: lease.data.code,
        lockedUntil: lease.data.lockedUntil,
      },
    };
  }

  let runId: string | null = null;
  try {
    const started = StartRunSchema.safeParse(
      await rpcJson("start_content_automation_run", { p_source: source }),
    );
    if (!started.success) throw new Error("INVALID_AUTOMATION_RUN_START_RESPONSE");
    runId = started.data.runId;

    const media = await drainMediaQueue();
    const publishing = await drainPublishQueue();
    const partial = media.hadFailure || publishing.hadFailure;
    const summary = {
      media: media.results,
      publishing: publishing.results,
      humanApprovalRequired: true,
      contentBrainGenerationTriggered: false,
    };

    const completed = await rpcJson("complete_content_automation_run", {
      p_run_id: runId,
      p_status: partial ? "partial" : "completed",
      p_media_attempts: media.attempts,
      p_media_processed: media.processed,
      p_publish_attempts: publishing.attempts,
      p_publish_processed: publishing.processed,
      p_summary: summary,
    });

    return {
      status: partial ? 207 : 200,
      body: {
        success: !partial,
        processed: media.attempts > 0 || publishing.attempts > 0,
        code: partial ? "CONTENT_AUTOMATION_PARTIAL" : "CONTENT_AUTOMATION_COMPLETED",
        runId,
        mediaAttempts: media.attempts,
        mediaProcessed: media.processed,
        publishAttempts: publishing.attempts,
        publishProcessed: publishing.processed,
        summary,
        completed,
      },
    };
  } catch (error) {
    const message = safeError(error);
    if (runId) {
      await rpcJson("fail_content_automation_run", {
        p_run_id: runId,
        p_error: message,
        p_summary: {
          humanApprovalRequired: true,
          contentBrainGenerationTriggered: false,
        },
      }).catch(() => null);
    }

    return {
      status: 502,
      body: {
        success: false,
        processed: false,
        code: "CONTENT_AUTOMATION_FAILED",
        runId,
        error: message,
      },
    };
  } finally {
    await rpcJson("release_content_automation_lease", {
      p_lease_name: lease.data.leaseName,
      p_lease_token: lease.data.leaseToken,
    }).catch(() => null);
  }
}
