import { z } from "zod";

const JobStatusSchema = z.enum(["queued", "processing", "completed", "failed", "retrying", "dead"]);

const FollowUpSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  leadName: z.string(),
  conversationId: z.string().uuid().nullable(),
  attemptNumber: z.number().int().nonnegative(),
  scheduledFor: z.string(),
  status: JobStatusSchema,
  stoppedReason: z.string().nullable(),
  createdAt: z.string(),
});

const BackgroundJobSchema = z.object({
  id: z.string().uuid(),
  jobType: z.string(),
  status: JobStatusSchema,
  attemptCount: z.number().int().nonnegative(),
  nextRetryAt: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OperationsQueueSchema = z.object({
  followUps: z.array(FollowUpSchema),
  backgroundJobs: z.array(BackgroundJobSchema),
  generatedAt: z.string(),
});

const AutomationRunSchema = z.object({
  id: z.string().uuid(),
  source: z.enum(["vercel_cron", "internal_manual"]),
  status: z.enum(["running", "completed", "partial", "failed"]),
  mediaAttempts: z.number().int().nonnegative(),
  mediaProcessed: z.number().int().nonnegative(),
  publishAttempts: z.number().int().nonnegative(),
  publishProcessed: z.number().int().nonnegative(),
  summary: z.record(z.unknown()),
  error: z.string().nullable(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});

export const ContentAutomationStatusSchema = z.object({
  queue: z.object({
    mediaQueued: z.number().int().nonnegative(),
    mediaProcessing: z.number().int().nonnegative(),
    mediaRetrying: z.number().int().nonnegative(),
    mediaDead: z.number().int().nonnegative(),
    publishQueued: z.number().int().nonnegative(),
    publishProcessing: z.number().int().nonnegative(),
    publishRetrying: z.number().int().nonnegative(),
    publishDead: z.number().int().nonnegative(),
    ambiguousPublications: z.number().int().nonnegative(),
  }),
  latestRuns: z.array(AutomationRunSchema),
});

export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  createdBy: z.string().uuid(),
  contentItemId: z.string().uuid().nullable(),
  assetType: z.enum(["image", "video", "logo", "other"]),
  source: z.enum(["upload", "ai_generated", "external"]),
  storagePath: z.string().nullable(),
  publicUrl: z.string().url().nullable(),
  provider: z.string().nullable(),
  providerJobId: z.string().nullable(),
  prompt: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

async function checkedJson(response: Response, unavailable: string): Promise<unknown> {
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error(unavailable);
  return response.json();
}

export async function fetchOperationsQueue() {
  const body = await checkedJson(
    await fetch("/api/os-operations", { headers: { Accept: "application/json" } }),
    "OPERATIONS_UNAVAILABLE",
  );
  const parsed = OperationsQueueSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_OPERATIONS_RESPONSE");
  return parsed.data;
}

export async function fetchContentAutomationStatus() {
  const body = await checkedJson(
    await fetch("/api/os-automation-status", { headers: { Accept: "application/json" } }),
    "CONTENT_AUTOMATION_STATUS_UNAVAILABLE",
  );
  const parsed = ContentAutomationStatusSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_CONTENT_AUTOMATION_STATUS_RESPONSE");
  return parsed.data;
}

export async function fetchMediaAssets() {
  const body = await checkedJson(
    await fetch("/api/os-media", { headers: { Accept: "application/json" } }),
    "MEDIA_UNAVAILABLE",
  );
  const parsed = z.array(MediaAssetSchema).safeParse(body);
  if (!parsed.success) throw new Error("INVALID_MEDIA_RESPONSE");
  return parsed.data;
}
