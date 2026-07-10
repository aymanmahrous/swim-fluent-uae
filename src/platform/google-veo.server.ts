import { z } from "zod";
import type { VideoGenerationProvider } from "./provider-registry.server";

const GOOGLE_AI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_VIDEO_MODEL = "veo-3.1-fast-generate-preview";

const OperationCreateSchema = z.object({
  name: z.string().min(1),
});

const OperationStateSchema = z.object({
  name: z.string().optional(),
  done: z.boolean().optional(),
  error: z
    .object({
      code: z.number().optional(),
      message: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
  response: z
    .object({
      generateVideoResponse: z.object({
        generatedSamples: z
          .array(
            z.object({
              video: z.object({
                uri: z.string().url(),
              }),
            }),
          )
          .min(1),
      }),
    })
    .optional(),
});

const GoogleErrorSchema = z.object({
  error: z.object({
    code: z.number().optional(),
    message: z.string().optional(),
    status: z.string().optional(),
  }),
});

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate || null;
}

function config(): { apiKey: string; model: string } {
  const apiKey = value("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GOOGLE_VEO_NOT_CONFIGURED");
  return {
    apiKey,
    model: value("AI_VIDEO_MODEL") ?? DEFAULT_VIDEO_MODEL,
  };
}

function operationPath(jobId: string): string {
  const normalized = jobId.replace(/^\/+/, "");
  if (
    normalized.length < 1 ||
    normalized.length > 500 ||
    normalized.includes("..") ||
    !/^[A-Za-z0-9._/-]+$/.test(normalized)
  ) {
    throw new Error("GOOGLE_VEO_OPERATION_ID_INVALID");
  }
  return normalized;
}

function aspectRatio(value?: string): "16:9" | "9:16" {
  return value === "16:9" ? "16:9" : "9:16";
}

function durationSeconds(value?: number): "4" | "6" | "8" {
  const duration = value ?? 4;
  if (duration <= 5) return "4";
  if (duration <= 7) return "6";
  return "8";
}

function googleErrorDetail(error: z.infer<typeof GoogleErrorSchema>["error"], status: number): string {
  return [error.status, error.message]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(": ") || `HTTP_${status}`;
}

async function jsonRequest(url: string, apiKey: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "x-goog-api-key": apiKey,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = GoogleErrorSchema.safeParse(payload);
    const detail = parsed.success
      ? googleErrorDetail(parsed.data.error, response.status)
      : `HTTP_${response.status}`;
    throw new Error(`GOOGLE_VEO_${detail}`.slice(0, 1000));
  }
  return payload;
}

export function isGoogleVeoConfigured(): boolean {
  return Boolean(value("GEMINI_API_KEY"));
}

export const googleVeoProvider: VideoGenerationProvider = {
  id: "google-veo",
  async createVideoJob(input) {
    if (input.sourceAssetUrl) {
      throw new Error("GOOGLE_VEO_SOURCE_URL_UNSUPPORTED_USE_TEXT_TO_VIDEO");
    }

    const { apiKey, model } = config();
    const parsed = OperationCreateSchema.safeParse(
      await jsonRequest(
        `${GOOGLE_AI_BASE_URL}/models/${encodeURIComponent(model)}:predictLongRunning`,
        apiKey,
        {
          method: "POST",
          body: JSON.stringify({
            instances: [{ prompt: input.prompt }],
            parameters: {
              numberOfVideos: 1,
              aspectRatio: aspectRatio(input.aspectRatio),
              durationSeconds: durationSeconds(input.durationSeconds),
              resolution: "720p",
              personGeneration: "allow_adult",
            },
          }),
        },
      ),
    );

    if (!parsed.success) throw new Error("GOOGLE_VEO_CREATE_INVALID_RESPONSE");
    return { jobId: parsed.data.name };
  },

  async getVideoJob(jobId) {
    const { apiKey } = config();
    const parsed = OperationStateSchema.safeParse(
      await jsonRequest(`${GOOGLE_AI_BASE_URL}/${operationPath(jobId)}`, apiKey, {
        method: "GET",
      }),
    );

    if (!parsed.success) throw new Error("GOOGLE_VEO_OPERATION_INVALID_RESPONSE");
    if (parsed.data.error) {
      return {
        status: "failed" as const,
        error:
          parsed.data.error.status ??
          parsed.data.error.message ??
          `GOOGLE_VEO_OPERATION_${parsed.data.error.code ?? "FAILED"}`,
      };
    }
    if (!parsed.data.done) return { status: "running" as const };

    const assetUrl =
      parsed.data.response?.generateVideoResponse.generatedSamples[0]?.video.uri;
    if (!assetUrl) throw new Error("GOOGLE_VEO_VIDEO_URI_MISSING");

    return {
      status: "succeeded" as const,
      assetUrl,
      downloadHeaders: { "x-goog-api-key": apiKey },
    };
  },
};
