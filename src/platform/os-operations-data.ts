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

export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  contentItemId: z.string().uuid().nullable(),
  assetType: z.enum(["image", "video", "logo", "other"]),
  source: z.enum(["upload", "ai_generated", "external"]),
  storagePath: z.string().nullable(),
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

export async function fetchMediaAssets() {
  const body = await checkedJson(
    await fetch("/api/os-media", { headers: { Accept: "application/json" } }),
    "MEDIA_UNAVAILABLE",
  );
  const parsed = z.array(MediaAssetSchema).safeParse(body);
  if (!parsed.success) throw new Error("INVALID_MEDIA_RESPONSE");
  return parsed.data;
}
