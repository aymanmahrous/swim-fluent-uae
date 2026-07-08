import { z } from "zod";

const ImageResultSchema = z.object({
  success: z.literal(true),
  mediaAssetId: z.string().uuid(),
  storagePath: z.string(),
  publicUrl: z.string().url(),
  provider: z.string(),
  uploadMode: z.enum(["standard", "tus"]),
});

const VideoJobSchema = z.object({
  success: z.literal(true),
  jobId: z.string().uuid(),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  provider: z.string().optional(),
  pollAfterSeconds: z.number().int().positive().optional(),
  storagePath: z.string().optional(),
  publicUrl: z.string().url().optional(),
  error: z.string().nullable().optional(),
  uploadMode: z.enum(["standard", "tus"]).optional(),
});

const MatchingCopySchema = z.object({
  success: z.literal(true),
  copy: z.object({
    hook: z.string(),
    caption: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
  }),
  provider: z.string(),
  providerRequestId: z.string().nullable(),
});

async function bodyOrError(response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) {
    const parsed = z.object({ code: z.string().optional() }).safeParse(body);
    throw new Error(parsed.success && parsed.data.code ? parsed.data.code : `HTTP_${response.status}`);
  }
  return body;
}

export async function generateAiImage(input: {
  prompt: string;
  aspectRatio: "1:1" | "4:5" | "5:4" | "9:16" | "16:9" | "3:4" | "4:3";
  contentItemId?: string | null;
}) {
  const parsed = ImageResultSchema.safeParse(
    await bodyOrError(
      await fetch("/api/os-media-generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(input),
      }),
    ),
  );
  if (!parsed.success) throw new Error("INVALID_IMAGE_GENERATION_RESPONSE");
  return parsed.data;
}

export async function createAiVideo(input: {
  prompt: string;
  sourceAssetUrl?: string | null;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
  durationSeconds: number;
  contentItemId?: string | null;
}) {
  const parsed = VideoJobSchema.safeParse(
    await bodyOrError(
      await fetch("/api/os-media-generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(input),
      }),
    ),
  );
  if (!parsed.success) throw new Error("INVALID_VIDEO_CREATE_RESPONSE");
  return parsed.data;
}

export async function fetchAiVideoJob(jobId: string) {
  const parsed = VideoJobSchema.safeParse(
    await bodyOrError(
      await fetch(`/api/os-media-generate-video?jobId=${encodeURIComponent(jobId)}`, {
        headers: { Accept: "application/json" },
      }),
    ),
  );
  if (!parsed.success) throw new Error("INVALID_VIDEO_JOB_RESPONSE");
  return parsed.data;
}

export async function generateMatchingCopy(input: {
  assetType: "image" | "video";
  mediaPrompt: string;
  platform: "instagram" | "facebook" | "tiktok";
  language: "ar" | "en";
  goal: string;
}) {
  const parsed = MatchingCopySchema.safeParse(
    await bodyOrError(
      await fetch("/api/os-media-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(input),
      }),
    ),
  );
  if (!parsed.success) throw new Error("INVALID_MATCHING_COPY_RESPONSE");
  return parsed.data;
}
