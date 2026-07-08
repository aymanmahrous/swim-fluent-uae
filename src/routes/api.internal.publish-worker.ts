import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { verifyInternalWorkerRequest } from "../platform/internal-auth.server";
import {
  getPublishingProvider,
  type PublishingPlatform,
} from "../platform/provider-registry.server";
import {
  isServiceRoleConfigured,
  serviceRoleRpc,
} from "../platform/service-role.server";

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

async function rpcJson(functionName: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const response = await serviceRoleRpc(functionName, body);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${functionName.toUpperCase()}_HTTP_${response.status}`);
  return payload;
}

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return "PUBLISH_PROVIDER_FAILED";
}

export const Route = createFileRoute("/api/internal/publish-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!verifyInternalWorkerRequest(request)) {
          return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        }

        if (!isServiceRoleConfigured()) {
          return Response.json(
            { success: false, code: "SERVICE_ROLE_NOT_CONFIGURED" },
            { status: 503 },
          );
        }

        const claimed = ClaimSchema.safeParse(await rpcJson("claim_next_publish_job"));
        if (!claimed.success) {
          return Response.json(
            { success: false, code: "INVALID_CLAIM_RESPONSE" },
            { status: 502 },
          );
        }

        if (!claimed.data.claimed) {
          return Response.json({ success: true, processed: false, code: claimed.data.code });
        }

        const job = claimed.data;
        const platform: PublishingPlatform = job.content.platform;
        const provider = getPublishingProvider(platform);
        if (!provider) {
          const deferred = await rpcJson("defer_publish_job", {
            p_job_id: job.jobId,
            p_reason: `PUBLISHING_PROVIDER_NOT_READY:${platform}`,
          });
          return Response.json(
            {
              success: false,
              processed: false,
              code: "PUBLISHING_PROVIDER_NOT_READY",
              platform,
              jobId: job.jobId,
              deferred,
            },
            { status: 503 },
          );
        }

        try {
          const providerResult = ProviderResultSchema.safeParse(
            await provider.publish({
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

          return Response.json({
            success: true,
            processed: true,
            jobId: job.jobId,
            platform,
            provider: provider.id,
            completed,
          });
        } catch (error) {
          const message = safeError(error);
          const failed = await rpcJson("fail_publish_job", {
            p_job_id: job.jobId,
            p_error: message,
          }).catch(() => null);

          return Response.json(
            {
              success: false,
              processed: true,
              code: "PUBLISH_FAILED",
              jobId: job.jobId,
              platform,
              error: message,
              failed,
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
