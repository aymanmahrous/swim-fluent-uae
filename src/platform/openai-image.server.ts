import { z } from "zod";
import type { ImageGenerationProvider } from "./provider-registry.server";

const DEFAULT_IMAGE_MODEL = "gpt-image-2";
const OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations";

const OpenAiImageSchema = z.object({
  data: z
    .array(
      z.object({
        b64_json: z.string().min(1),
      }),
    )
    .min(1),
});

const OpenAiErrorSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    type: z.string().optional(),
    message: z.string().optional(),
  }),
});

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate || null;
}

function imageSize(aspectRatio?: string): string {
  const sizes: Record<string, string> = {
    "1:1": "1024x1024",
    "4:5": "1024x1280",
    "5:4": "1280x1024",
    "9:16": "1024x1824",
    "16:9": "1824x1024",
    "3:4": "1024x1360",
    "4:3": "1360x1024",
  };
  return sizes[aspectRatio ?? "1:1"] ?? sizes["1:1"];
}

function config(): { apiKey: string; model: string } {
  const apiKey = value("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_IMAGE_NOT_CONFIGURED");
  return {
    apiKey,
    model: value("AI_IMAGE_MODEL") ?? DEFAULT_IMAGE_MODEL,
  };
}

export function isOpenAiImageConfigured(): boolean {
  return Boolean(value("OPENAI_API_KEY"));
}

export const openAiGptImageProvider: ImageGenerationProvider = {
  id: "openai-gpt-image",
  async generateImage(input) {
    const { apiKey, model } = config();
    const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: input.prompt,
        n: 1,
        size: imageSize(input.aspectRatio),
        quality: value("AI_IMAGE_QUALITY") ?? "medium",
        output_format: "jpeg",
        background: "opaque",
        moderation: "auto",
      }),
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const parsedError = OpenAiErrorSchema.safeParse(payload);
      const detail = parsedError.success
        ? parsedError.data.error.code ??
          parsedError.data.error.type ??
          parsedError.data.error.message ??
          `HTTP_${response.status}`
        : `HTTP_${response.status}`;
      throw new Error(`OPENAI_IMAGE_${detail}`.slice(0, 1000));
    }

    const parsed = OpenAiImageSchema.safeParse(payload);
    if (!parsed.success) throw new Error("OPENAI_IMAGE_INVALID_RESPONSE");

    return {
      assetBase64: parsed.data.data[0].b64_json,
      contentType: "image/jpeg" as const,
      providerRequestId: response.headers.get("x-request-id") ?? undefined,
    };
  },
};
