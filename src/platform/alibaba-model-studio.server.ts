import { z } from "zod";
import type {
  ImageGenerationProvider,
  TextGenerationProvider,
  VideoGenerationProvider,
} from "./provider-registry.server";

const DEFAULT_TEXT_MODEL = "qwen3.7-max";
const DEFAULT_IMAGE_MODEL = "wan2.7-image-pro";
const DEFAULT_T2V_MODEL = "wan2.7-t2v-2026-06-12";
const DEFAULT_I2V_MODEL = "wan2.7-i2v-2026-04-25";

const ChatCompletionSchema = z.object({
  id: z.string().optional(),
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().min(1) }),
      }),
    )
    .min(1),
});

const WanImageSchema = z.object({
  request_id: z.string().optional(),
  output: z.object({
    choices: z.array(
      z.object({
        message: z.object({
          content: z.array(
            z.object({
              image: z.string().url().optional(),
              type: z.string().optional(),
            }),
          ),
        }),
      }),
    ),
  }),
});

const WanVideoCreateSchema = z.object({
  request_id: z.string().optional(),
  output: z.object({
    task_id: z.string().min(1),
    task_status: z.string().optional(),
  }),
});

const WanVideoTaskSchema = z.object({
  request_id: z.string().optional(),
  output: z.object({
    task_id: z.string().optional(),
    task_status: z.string(),
    video_url: z.string().url().optional(),
    message: z.string().optional(),
    code: z.string().optional(),
  }),
});

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate || null;
}

function normalizeEndpoint(candidate: string): string {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("ALIBABA_MODEL_STUDIO_ENDPOINT_INVALID");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search) {
    throw new Error("ALIBABA_MODEL_STUDIO_ENDPOINT_INVALID");
  }

  let pathname = url.pathname.replace(/\/+$/, "");
  for (const suffix of ["/compatible-mode/v1", "/api/v1"] as const) {
    if (pathname.endsWith(suffix)) {
      pathname = pathname.slice(0, -suffix.length);
      break;
    }
  }

  url.pathname = pathname || "/";
  return url.toString().replace(/\/$/, "");
}

function config(): { endpoint: string; apiKey: string } {
  const rawEndpoint = value("MAAS_ENDPOINT");
  const apiKey = value("ALIBABA_MODEL_STUDIO_API_KEY");
  if (!rawEndpoint || !apiKey) throw new Error("ALIBABA_MODEL_STUDIO_NOT_CONFIGURED");
  return { endpoint: normalizeEndpoint(rawEndpoint), apiKey };
}

async function jsonRequest(url: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(url, init);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = z
      .object({ code: z.string().optional(), message: z.string().optional() })
      .safeParse(payload);
    const detail = code.success
      ? code.data.code ?? code.data.message ?? `HTTP_${response.status}`
      : `HTTP_${response.status}`;
    throw new Error(`ALIBABA_MODEL_STUDIO_${detail}`.slice(0, 1000));
  }
  return payload;
}

function imageSize(aspectRatio?: string): string {
  const sizes: Record<string, string> = {
    "1:1": "1536*1536",
    "4:5": "1280*1600",
    "5:4": "1600*1280",
    "9:16": "960*1704",
    "16:9": "1704*960",
    "3:4": "1152*1536",
    "4:3": "1536*1152",
  };
  return sizes[aspectRatio ?? "1:1"] ?? sizes["1:1"];
}

function videoRatio(aspectRatio?: string): string {
  const supported = new Set(["16:9", "9:16", "1:1", "4:3", "3:4"]);
  return aspectRatio && supported.has(aspectRatio) ? aspectRatio : "9:16";
}

export function isAlibabaModelStudioConfigured(): boolean {
  return Boolean(value("MAAS_ENDPOINT") && value("ALIBABA_MODEL_STUDIO_API_KEY"));
}

export const alibabaQwenProvider: TextGenerationProvider = {
  id: "alibaba-qwen",
  async generateText(input) {
    const { endpoint, apiKey } = config();
    const model = value("AI_TEXT_MODEL") ?? DEFAULT_TEXT_MODEL;
    const messages = [
      ...(input.system ? [{ role: "system", content: input.system }] : []),
      { role: "user", content: input.prompt },
    ];

    const parsed = ChatCompletionSchema.safeParse(
      await jsonRequest(`${endpoint}/compatible-mode/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, stream: false }),
      }),
    );

    if (!parsed.success) throw new Error("ALIBABA_TEXT_INVALID_RESPONSE");
    return {
      text: parsed.data.choices[0].message.content,
      providerRequestId: parsed.data.id,
    };
  },
};

export const alibabaWanImageProvider: ImageGenerationProvider = {
  id: "alibaba-wan-image",
  async generateImage(input) {
    const { endpoint, apiKey } = config();
    const model = value("AI_IMAGE_MODEL") ?? DEFAULT_IMAGE_MODEL;

    const parsed = WanImageSchema.safeParse(
      await jsonRequest(`${endpoint}/api/v1/services/aigc/multimodal-generation/generation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: {
            messages: [
              {
                role: "user",
                content: [{ text: input.prompt }],
              },
            ],
          },
          parameters: {
            size: imageSize(input.aspectRatio),
            n: 1,
            watermark: false,
            thinking_mode: true,
          },
        }),
      }),
    );

    if (!parsed.success) throw new Error("ALIBABA_IMAGE_INVALID_RESPONSE");
    const assetUrl = parsed.data.output.choices
      .flatMap((choice) => choice.message.content)
      .find((item) => item.image)?.image;
    if (!assetUrl) throw new Error("ALIBABA_IMAGE_URL_MISSING");

    return {
      assetUrl,
      providerRequestId: parsed.data.request_id,
    };
  },
};

export const alibabaWanVideoProvider: VideoGenerationProvider = {
  id: "alibaba-wan-video",
  async createVideoJob(input) {
    const { endpoint, apiKey } = config();
    const usesSourceImage = Boolean(input.sourceAssetUrl);
    const model = usesSourceImage
      ? value("AI_VIDEO_IMAGE_MODEL") ?? DEFAULT_I2V_MODEL
      : value("AI_VIDEO_TEXT_MODEL") ?? DEFAULT_T2V_MODEL;
    const parameters = {
      resolution: "720P",
      ...(usesSourceImage ? {} : { ratio: videoRatio(input.aspectRatio) }),
      prompt_extend: true,
      watermark: false,
      duration: Math.min(15, Math.max(2, input.durationSeconds ?? 5)),
    };

    const parsed = WanVideoCreateSchema.safeParse(
      await jsonRequest(`${endpoint}/api/v1/services/aigc/video-generation/video-synthesis`, {
        method: "POST",
        headers: {
          "X-DashScope-Async": "enable",
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: {
            prompt: input.prompt,
            ...(input.sourceAssetUrl
              ? { media: [{ type: "first_frame", url: input.sourceAssetUrl }] }
              : {}),
          },
          parameters,
        }),
      }),
    );

    if (!parsed.success) throw new Error("ALIBABA_VIDEO_CREATE_INVALID_RESPONSE");
    return { jobId: parsed.data.output.task_id };
  },

  async getVideoJob(jobId) {
    const { endpoint, apiKey } = config();
    const parsed = WanVideoTaskSchema.safeParse(
      await jsonRequest(`${endpoint}/api/v1/tasks/${encodeURIComponent(jobId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }),
    );

    if (!parsed.success) throw new Error("ALIBABA_VIDEO_TASK_INVALID_RESPONSE");
    const status = parsed.data.output.task_status.toUpperCase();
    if (status === "SUCCEEDED") {
      if (!parsed.data.output.video_url) throw new Error("ALIBABA_VIDEO_URL_MISSING");
      return { status: "succeeded" as const, assetUrl: parsed.data.output.video_url };
    }
    if (["FAILED", "CANCELED", "UNKNOWN"].includes(status)) {
      return {
        status: "failed" as const,
        error:
          parsed.data.output.message ?? parsed.data.output.code ?? `ALIBABA_VIDEO_${status}`,
      };
    }
    if (status === "RUNNING") return { status: "running" as const };
    return { status: "queued" as const };
  },
};
