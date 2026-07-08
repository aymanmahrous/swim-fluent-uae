import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  mediaPublicUrl,
  persistRemoteProviderAsset,
} from "../platform/media-storage.server";
import {
  getVideoProvider,
  getVideoProviderById,
} from "../platform/provider-registry.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const CreateRequestSchema = z.object({
  prompt: z.string().trim().min(2).max(2000),
  sourceAssetUrl: z.string().url().nullable().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3", "3:4"]),
  durationSeconds: z.number().int().min(2).max(15),
  contentItemId: z.string().uuid().nullable().optional(),
});

const CreatedJobSchema = z.object({
  success: z.literal(true),
  jobId: z.string().uuid(),
  providerJobId: z.string().min(1),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  createdAt: z.string(),
});

const StoredJobSchema = z.object({
  success: z.literal(true),
  jobId: z.string().uuid(),
  contentItemId: z.string().uuid().nullable(),
  provider: z.string().min(1),
  providerJobId: z.string().min(1),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  prompt: z.string(),
  sourceAssetUrl: z.string().url().nullable(),
  aspectRatio: z.string().nullable(),
  durationSeconds: z.number().int().nullable(),
  storagePath: z.string().nullable(),
  error: z.string().nullable(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UpdatedJobSchema = z.object({
  success: z.literal(true),
  code: z.string().optional(),
  jobId: z.string().uuid(),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  storagePath: z.string().nullable(),
  error: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
});

function allowedRole(role: string): boolean {
  return ["super_admin", "admin", "content_manager"].includes(role);
}

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "VIDEO_GENERATION_FAILED";
  return message.split(":")[0].replace(/[^A-Z0-9_]/gi, "_").slice(0, 100) || "VIDEO_GENERATION_FAILED";
}

async function rpcBody(
  accessToken: string,
  functionName: string,
  body: Record<string, unknown>,
): Promise<{ response: Response; body: unknown }> {
  const response = await staffRpc(accessToken, functionName, body);
  return { response, body: await response.json().catch(() => null) };
}

export const Route = createFileRoute("/api/os-media-generate-video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!allowedRole(session.profile.role)) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const parsed = CreateRequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const provider = getVideoProvider();
        if (!provider) {
          return Response.json(
            { success: false, code: "PROVIDER_NOT_READY" },
            { status: 503, headers: sessionCookieHeaders(session) },
          );
        }

        try {
          const providerJob = await provider.createVideoJob({
            prompt: parsed.data.prompt,
            sourceAssetUrl: parsed.data.sourceAssetUrl ?? undefined,
            aspectRatio: parsed.data.aspectRatio,
            durationSeconds: parsed.data.durationSeconds,
          });
          const created = await rpcBody(
            session.accessToken,
            "create_staff_video_generation_job",
            {
              p_content_item_id: parsed.data.contentItemId ?? null,
              p_provider: provider.id,
              p_provider_job_id: providerJob.jobId,
              p_prompt: parsed.data.prompt,
              p_source_asset_url: parsed.data.sourceAssetUrl ?? null,
              p_aspect_ratio: parsed.data.aspectRatio,
              p_duration_seconds: parsed.data.durationSeconds,
              p_metadata: {
                sourceMode: parsed.data.sourceAssetUrl ? "image_to_video" : "text_to_video",
              },
            },
          );
          const job = CreatedJobSchema.safeParse(created.body);
          if (!created.response.ok || !job.success) {
            return Response.json(
              { success: false, code: "VIDEO_JOB_RECORD_FAILED" },
              { status: 502, headers: sessionCookieHeaders(session) },
            );
          }

          return Response.json(
            {
              success: true,
              jobId: job.data.jobId,
              status: job.data.status,
              provider: provider.id,
              pollAfterSeconds: 15,
            },
            { status: 202, headers: sessionCookieHeaders(session) },
          );
        } catch (error) {
          return Response.json(
            { success: false, code: safeCode(error) },
            { status: 502, headers: sessionCookieHeaders(session) },
          );
        }
      },

      GET: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!allowedRole(session.profile.role)) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const jobId = new URL(request.url).searchParams.get("jobId");
        const id = z.string().uuid().safeParse(jobId);
        if (!id.success) return Response.json({ success: false, code: "INVALID_JOB_ID" }, { status: 400 });

        try {
          const stored = await rpcBody(session.accessToken, "get_staff_video_generation_job", {
            p_job_id: id.data,
          });
          const job = StoredJobSchema.safeParse(stored.body);
          if (!stored.response.ok || !job.success) {
            return Response.json(
              { success: false, code: "VIDEO_JOB_NOT_FOUND" },
              { status: 404, headers: sessionCookieHeaders(session) },
            );
          }

          if (job.data.status === "succeeded" && job.data.storagePath) {
            return Response.json(
              {
                success: true,
                jobId: job.data.jobId,
                status: "succeeded",
                storagePath: job.data.storagePath,
                publicUrl: mediaPublicUrl(job.data.storagePath),
              },
              { headers: sessionCookieHeaders(session) },
            );
          }
          if (job.data.status === "failed") {
            return Response.json(
              { success: true, jobId: job.data.jobId, status: "failed", error: job.data.error },
              { headers: sessionCookieHeaders(session) },
            );
          }

          const provider = getVideoProviderById(job.data.provider);
          if (!provider) {
            return Response.json(
              { success: false, code: "STORED_PROVIDER_NOT_READY" },
              { status: 503, headers: sessionCookieHeaders(session) },
            );
          }

          const providerState = await provider.getVideoJob(job.data.providerJobId);
          if (providerState.status === "queued" || providerState.status === "running") {
            await rpcBody(session.accessToken, "update_staff_video_generation_job", {
              p_job_id: job.data.jobId,
              p_status: providerState.status,
              p_storage_path: null,
              p_error: null,
              p_metadata: {},
            });
            return Response.json(
              {
                success: true,
                jobId: job.data.jobId,
                status: providerState.status,
                pollAfterSeconds: 15,
              },
              { headers: sessionCookieHeaders(session) },
            );
          }

          if (providerState.status === "failed") {
            await rpcBody(session.accessToken, "update_staff_video_generation_job", {
              p_job_id: job.data.jobId,
              p_status: "failed",
              p_storage_path: null,
              p_error: providerState.error ?? "VIDEO_GENERATION_FAILED",
              p_metadata: {},
            });
            return Response.json(
              {
                success: true,
                jobId: job.data.jobId,
                status: "failed",
                error: providerState.error ?? "VIDEO_GENERATION_FAILED",
              },
              { headers: sessionCookieHeaders(session) },
            );
          }

          if (!providerState.assetUrl) throw new Error("VIDEO_PROVIDER_ASSET_URL_MISSING");
          const persisted = await persistRemoteProviderAsset({
            providerId: provider.id,
            providerUrl: providerState.assetUrl,
            accessToken: session.accessToken,
            staffId: session.profile.id,
            assetType: "video",
            contentItemId: job.data.contentItemId,
            deterministicId: job.data.jobId,
          });
          const updated = await rpcBody(session.accessToken, "update_staff_video_generation_job", {
            p_job_id: job.data.jobId,
            p_status: "succeeded",
            p_storage_path: persisted.storagePath,
            p_error: null,
            p_metadata: {
              contentType: persisted.contentType,
              sizeBytes: persisted.sizeBytes,
              uploadMode: persisted.uploadMode,
            },
          });
          const completed = UpdatedJobSchema.safeParse(updated.body);
          if (!updated.response.ok || !completed.success) {
            throw new Error("VIDEO_JOB_FINALIZATION_FAILED");
          }
          const storagePath = completed.data.storagePath ?? persisted.storagePath;

          return Response.json(
            {
              success: true,
              jobId: job.data.jobId,
              status: "succeeded",
              storagePath,
              publicUrl: mediaPublicUrl(storagePath),
              uploadMode: persisted.uploadMode,
            },
            { headers: sessionCookieHeaders(session) },
          );
        } catch (error) {
          return Response.json(
            { success: false, code: safeCode(error) },
            { status: 502, headers: sessionCookieHeaders(session) },
          );
        }
      },
    },
  },
});
