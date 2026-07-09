import { z } from "zod";
import {
  persistContentMediaImageBytes,
  persistContentMediaRemoteAsset,
} from "./content-media-worker-storage.server";
import {
  getImageProvider,
  getVideoProvider,
  getVideoProviderById,
} from "./provider-registry.server";
import {
  isSupabaseSecretConfigured,
  supabaseSecretRpc,
} from "./supabase-secret.server";

const ClaimSchema = z.discriminatedUnion("claimed", [
  z.object({
    claimed: z.literal(false),
    code: z.string(),
    jobId: z.string().uuid().optional(),
  }),
  z.object({
    claimed: z.literal(true),
    jobId: z.string().uuid(),
    contentItemId: z.string().uuid(),
    requestedBy: z.string().uuid(),
    assetType: z.enum(["image", "video"]),
    platform: z.enum(["instagram", "facebook", "tiktok"]),
    contentType: z.enum(["image_post", "reel"]),
    prompt: z.string().trim().min(2),
    provider: z.string().trim().min(1).nullable(),
    providerJobId: z.string().trim().min(1).nullable(),
    attemptCount: z.number().int().positive(),
    aspectRatio: z.enum(["4:5", "9:16"]),
    durationSeconds: z.number().int().min(2).max(15).nullable(),
  }),
]);

export type WorkerProcessResult = {
  status: number;
  body: Record<string, unknown>;
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

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return "CONTENT_MEDIA_WORKER_FAILED";
}

async function deferJob(jobId: string, reason: string, delaySeconds: number) {
  return rpcJson("defer_content_media_job", {
    p_job_id: jobId,
    p_reason: reason,
    p_delay_seconds: delaySeconds,
  });
}

async function failJob(jobId: string, error: unknown) {
  return rpcJson("fail_content_media_job", {
    p_job_id: jobId,
    p_error: safeError(error),
  });
}

async function failVideoProviderJob(jobId: string, error: unknown) {
  return rpcJson("fail_content_media_video_provider_job", {
    p_job_id: jobId,
    p_error: safeError(error),
  });
}

async function completeJob(input: {
  jobId: string;
  storagePath: string;
  provider: string;
  providerJobId?: string | null;
  metadata: Record<string, unknown>;
}) {
  return rpcJson("complete_content_media_job", {
    p_job_id: input.jobId,
    p_storage_path: input.storagePath,
    p_provider: input.provider,
    p_provider_job_id: input.providerJobId ?? null,
    p_metadata: input.metadata,
  });
}

export async function processOneContentMediaJob(): Promise<WorkerProcessResult> {
  if (!isSupabaseSecretConfigured()) {
    return {
      status: 503,
      body: { success: false, code: "SUPABASE_SECRET_NOT_CONFIGURED" },
    };
  }

  const claimed = ClaimSchema.safeParse(await rpcJson("claim_next_content_media_job"));
  if (!claimed.success) {
    return {
      status: 502,
      body: { success: false, code: "INVALID_CONTENT_MEDIA_CLAIM_RESPONSE" },
    };
  }
  if (!claimed.data.claimed) {
    return {
      status: 200,
      body: { success: true, processed: false, code: claimed.data.code },
    };
  }

  const job = claimed.data;
  try {
    if (job.assetType === "image") {
      const provider = getImageProvider();
      if (!provider) {
        const deferred = await deferJob(job.jobId, "IMAGE_PROVIDER_NOT_READY", 60 * 60);
        return {
          status: 503,
          body: {
            success: false,
            processed: false,
            code: "IMAGE_PROVIDER_NOT_READY",
            jobId: job.jobId,
            deferred,
          },
        };
      }

      const generation = await provider.generateImage({
        prompt: job.prompt,
        aspectRatio: job.aspectRatio,
      });
      const persisted = generation.assetBase64
        ? await persistContentMediaImageBytes({
            base64: generation.assetBase64,
            contentType: generation.contentType ?? "image/png",
            requestedBy: job.requestedBy,
            contentItemId: job.contentItemId,
            jobId: job.jobId,
          })
        : generation.assetUrl
          ? await persistContentMediaRemoteAsset({
              providerId: provider.id,
              providerUrl: generation.assetUrl,
              requestedBy: job.requestedBy,
              assetType: "image",
              contentItemId: job.contentItemId,
              jobId: job.jobId,
            })
          : (() => {
              throw new Error("IMAGE_PROVIDER_ASSET_MISSING");
            })();

      const completed = await completeJob({
        jobId: job.jobId,
        storagePath: persisted.storagePath,
        provider: provider.id,
        providerJobId: generation.providerRequestId ?? null,
        metadata: {
          autonomous: true,
          contentType: persisted.contentType,
          sizeBytes: persisted.sizeBytes,
          uploadMode: persisted.uploadMode,
          aspectRatio: job.aspectRatio,
        },
      });

      return {
        status: 200,
        body: {
          success: true,
          processed: true,
          jobId: job.jobId,
          contentItemId: job.contentItemId,
          assetType: "image",
          provider: provider.id,
          completed,
        },
      };
    }

    if (!job.providerJobId) {
      const provider = getVideoProvider();
      if (!provider) {
        const deferred = await deferJob(job.jobId, "VIDEO_PROVIDER_NOT_READY", 60 * 60);
        return {
          status: 503,
          body: {
            success: false,
            processed: false,
            code: "VIDEO_PROVIDER_NOT_READY",
            jobId: job.jobId,
            deferred,
          },
        };
      }

      const providerJob = await provider.createVideoJob({
        prompt: job.prompt,
        aspectRatio: job.aspectRatio,
        durationSeconds: job.durationSeconds ?? 8,
      });
      const recorded = await rpcJson("record_content_media_video_provider_job", {
        p_job_id: job.jobId,
        p_provider: provider.id,
        p_provider_job_id: providerJob.jobId,
      });

      return {
        status: 202,
        body: {
          success: true,
          processed: false,
          code: "VIDEO_PROVIDER_JOB_STARTED",
          jobId: job.jobId,
          contentItemId: job.contentItemId,
          provider: provider.id,
          recorded,
        },
      };
    }

    if (!job.provider) throw new Error("VIDEO_PROVIDER_ID_MISSING");
    const provider = getVideoProviderById(job.provider);
    if (!provider) {
      const deferred = await deferJob(
        job.jobId,
        `STORED_VIDEO_PROVIDER_NOT_READY:${job.provider}`,
        60 * 60,
      );
      return {
        status: 503,
        body: {
          success: false,
          processed: false,
          code: "STORED_VIDEO_PROVIDER_NOT_READY",
          jobId: job.jobId,
          provider: job.provider,
          deferred,
        },
      };
    }

    const providerState = await provider.getVideoJob(job.providerJobId);
    if (providerState.status === "queued" || providerState.status === "running") {
      const deferred = await deferJob(
        job.jobId,
        `VIDEO_PROVIDER_${providerState.status.toUpperCase()}`,
        30,
      );
      return {
        status: 202,
        body: {
          success: true,
          processed: false,
          code: "VIDEO_PROVIDER_PENDING",
          jobId: job.jobId,
          provider: provider.id,
          providerStatus: providerState.status,
          deferred,
        },
      };
    }

    if (providerState.status === "failed") {
      const failed = await failVideoProviderJob(
        job.jobId,
        providerState.error ?? "VIDEO_PROVIDER_FAILED",
      );
      return {
        status: 502,
        body: {
          success: false,
          processed: true,
          code: "VIDEO_PROVIDER_FAILED",
          jobId: job.jobId,
          provider: provider.id,
          failed,
        },
      };
    }

    if (!providerState.assetUrl) throw new Error("VIDEO_PROVIDER_ASSET_URL_MISSING");
    const persisted = await persistContentMediaRemoteAsset({
      providerId: provider.id,
      providerUrl: providerState.assetUrl,
      downloadHeaders: providerState.downloadHeaders,
      requestedBy: job.requestedBy,
      assetType: "video",
      contentItemId: job.contentItemId,
      jobId: job.jobId,
    });
    const completed = await completeJob({
      jobId: job.jobId,
      storagePath: persisted.storagePath,
      provider: provider.id,
      providerJobId: job.providerJobId,
      metadata: {
        autonomous: true,
        contentType: persisted.contentType,
        sizeBytes: persisted.sizeBytes,
        uploadMode: persisted.uploadMode,
        aspectRatio: job.aspectRatio,
        durationSeconds: job.durationSeconds ?? 8,
      },
    });

    return {
      status: 200,
      body: {
        success: true,
        processed: true,
        jobId: job.jobId,
        contentItemId: job.contentItemId,
        assetType: "video",
        provider: provider.id,
        completed,
      },
    };
  } catch (error) {
    const message = safeError(error);
    const failed = await failJob(job.jobId, error).catch(() => null);
    return {
      status: 502,
      body: {
        success: false,
        processed: true,
        code: "CONTENT_MEDIA_GENERATION_FAILED",
        jobId: job.jobId,
        contentItemId: job.contentItemId,
        assetType: job.assetType,
        error: message,
        failed,
      },
    };
  }
}
