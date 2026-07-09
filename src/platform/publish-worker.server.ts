import { z } from "zod";
import {
  getPublishingProvider,
  type PublishingPlatform,
} from "./provider-registry.server";
import {
  isSupabaseSecretConfigured,
  supabaseSecretRpc,
} from "./supabase-secret.server";
import type { WorkerProcessResult } from "./content-media-worker.server";

const ClaimSchema = z.discriminatedUnion("claimed", [
  z.object({
    claimed: z.literal(false),
    code: z.string(),
    jobId: z.string().uuid().optional(),
  }),
  z.object({
    claimed: z.literal(true),
    jobId: z.string().uuid(),
    attemptCount: z.number().int().positive(),
    content: z.object({
      contentItemId: z.string().uuid(),
      platform: z.enum(["instagram", "facebook", "tiktok"]),
      contentType: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
      scheduledFor: z.string(),
      media: z.array(
        z.object({
          assetType: z.enum(["image", "video", "logo", "other"]),
          storagePath: z.string().nullable(),
          provider: z.string().nullable(),
        }),
      ),
    }),
  }),
]);

const ProviderResultSchema = z.object({
  providerExternalId: z.string().trim().min(1),
  publishedAt: z.string().datetime({ offset: true }),
});

async function rpcJson(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<unknown> {
  const response = await supabaseSecretRpc(functionName, body);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${functionName.toUpperCase()}_HTTP_${response.status}`);
  return payload;
}

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return "PUBLISH_PROVIDER_FAILED";
}

export async function processOnePublishJob(): Promise<WorkerProcessResult> {
  if (!isSupabaseSecretConfigured()) {
    return {
      status: 503,
      body: { success: false, code: "SUPABASE_SECRET_NOT_CONFIGURED" },
    };
  }

  const claimed = ClaimSchema.safeParse(await rpcJson("claim_next_publish_job"));
  if (!claimed.success) {
    return {
      status: 502,
      body: { success: false, code: "INVALID_CLAIM_RESPONSE" },
    };
  }

  if (!claimed.data.claimed) {
    return {
      status: 200,
      body: { success: true, processed: false, code: claimed.data.code },
    };
  }

  const job = claimed.data;
  const platform: PublishingPlatform = job.content.platform;
  const provider = getPublishingProvider(platform);
  if (!provider) {
    const deferred = await rpcJson("defer_publish_job", {
      p_job_id: job.jobId,
      p_reason: `PUBLISHING_PROVIDER_NOT_READY:${platform}`,
    });
    return {
      status: 503,
      body: {
        success: false,
        processed: false,
        code: "PUBLISHING_PROVIDER_NOT_READY",
        platform,
        jobId: job.jobId,
        deferred,
      },
    };
  }

  try {
    const providerResult = ProviderResultSchema.safeParse(
      await provider.publish({
        idempotencyKey: `publish:${job.content.contentItemId}`,
        contentItemId: job.content.contentItemId,
        platform,
        contentType: job.content.contentType,
        caption: job.content.caption,
        hashtags: job.content.hashtags,
        media: job.content.media,
      }),
    );

    if (!providerResult.success) {
      throw new Error("INVALID_PUBLISH_PROVIDER_RESULT");
    }

    const completed = await rpcJson("complete_publish_job", {
      p_job_id: job.jobId,
      p_provider_external_id: providerResult.data.providerExternalId,
      p_published_at: providerResult.data.publishedAt,
    });

    return {
      status: 200,
      body: {
        success: true,
        processed: true,
        jobId: job.jobId,
        platform,
        provider: provider.id,
        completed,
      },
    };
  } catch (error) {
    const message = safeError(error);
    const failed = await rpcJson("fail_publish_job", {
      p_job_id: job.jobId,
      p_error: message,
    }).catch(() => null);

    return {
      status: 502,
      body: {
        success: false,
        processed: true,
        code: "PUBLISH_FAILED",
        jobId: job.jobId,
        platform,
        error: message,
        failed,
      },
    };
  }
}
