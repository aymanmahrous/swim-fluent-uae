import {
  alibabaQwenProvider,
  alibabaWanImageProvider,
  alibabaWanVideoProvider,
  isAlibabaModelStudioConfigured,
} from "./alibaba-model-studio.server";
import { googleVeoProvider, isGoogleVeoConfigured } from "./google-veo.server";
import { isOpenAiImageConfigured, openAiGptImageProvider } from "./openai-image.server";
import {
  supabaseProjectUrl,
  supabasePublishableKey,
} from "./supabase-project.server";

export type ProviderCapability =
  | "database"
  | "messaging"
  | "publishing"
  | "ai_text"
  | "ai_image"
  | "ai_video";

export type ProviderStatus = {
  id: string;
  label: string;
  category: ProviderCapability;
  configured: boolean;
  executable: boolean;
  provider: string | null;
  detail: string;
};

export type PublishingPlatform = "instagram" | "facebook" | "tiktok";

export interface TextGenerationProvider {
  readonly id: string;
  generateText(input: {
    system?: string;
    prompt: string;
    language: "ar" | "en";
  }): Promise<{ text: string; providerRequestId?: string }>;
}

export interface ImageGenerationProvider {
  readonly id: string;
  generateImage(input: {
    prompt: string;
    aspectRatio?: string;
  }): Promise<{
    assetUrl?: string;
    assetBase64?: string;
    contentType?: "image/png" | "image/jpeg" | "image/webp";
    providerRequestId?: string;
  }>;
}

export interface VideoGenerationProvider {
  readonly id: string;
  createVideoJob(input: {
    prompt: string;
    sourceAssetUrl?: string;
    aspectRatio?: string;
    durationSeconds?: number;
  }): Promise<{ jobId: string }>;
  getVideoJob(jobId: string): Promise<{
    status: "queued" | "running" | "succeeded" | "failed";
    assetUrl?: string;
    downloadHeaders?: Record<string, string>;
    error?: string;
  }>;
}

export interface PublishingProvider {
  readonly id: string;
  readonly platforms: readonly PublishingPlatform[];
  publish(input: {
    idempotencyKey: string;
    contentItemId: string;
    platform: PublishingPlatform;
    contentType: string;
    caption: string;
    hashtags: string[];
    media: Array<{
      assetType: "image" | "video" | "logo" | "other";
      storagePath: string | null;
      provider: string | null;
    }>;
  }): Promise<{ providerExternalId: string; publishedAt: string }>;
}

const textAdapters = new Map<string, TextGenerationProvider>([
  [alibabaQwenProvider.id, alibabaQwenProvider],
]);
const imageAdapters = new Map<string, ImageGenerationProvider>([
  [openAiGptImageProvider.id, openAiGptImageProvider],
  [alibabaWanImageProvider.id, alibabaWanImageProvider],
]);
const videoAdapters = new Map<string, VideoGenerationProvider>([
  [googleVeoProvider.id, googleVeoProvider],
  [alibabaWanVideoProvider.id, alibabaWanVideoProvider],
]);
const publishingAdapters = new Map<PublishingPlatform, PublishingProvider>();

export function registerTextProvider(provider: TextGenerationProvider): void {
  textAdapters.set(provider.id, provider);
}

export function registerImageProvider(provider: ImageGenerationProvider): void {
  imageAdapters.set(provider.id, provider);
}

export function registerVideoProvider(provider: VideoGenerationProvider): void {
  videoAdapters.set(provider.id, provider);
}

export function registerPublishingProvider(provider: PublishingProvider): void {
  for (const platform of provider.platforms) publishingAdapters.set(platform, provider);
}

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate ? candidate : null;
}

function all(...names: string[]): boolean {
  return names.every((name) => Boolean(value(name)));
}

function textProviderId(): string | null {
  return value("AI_TEXT_PROVIDER") ?? (isAlibabaModelStudioConfigured() ? "alibaba-qwen" : null);
}

function imageProviderId(): string | null {
  return (
    value("AI_IMAGE_PROVIDER") ??
    (isOpenAiImageConfigured()
      ? "openai-gpt-image"
      : isAlibabaModelStudioConfigured()
        ? "alibaba-wan-image"
        : null)
  );
}

function videoProviderId(): string | null {
  return (
    value("AI_VIDEO_PROVIDER") ??
    (isGoogleVeoConfigured()
      ? "google-veo"
      : isAlibabaModelStudioConfigured()
        ? "alibaba-wan-video"
        : null)
  );
}

function providerCredentialsConfigured(
  category: "text" | "image" | "video",
  providerId: string | null,
): boolean {
  if (!providerId) return false;
  if (providerId.startsWith("alibaba-")) return isAlibabaModelStudioConfigured();
  if (providerId === "openai-gpt-image") return isOpenAiImageConfigured();
  if (providerId === "google-veo") return isGoogleVeoConfigured();
  return Boolean(value(`AI_${category.toUpperCase()}_API_KEY`));
}

export function getTextProvider(): TextGenerationProvider | null {
  const id = textProviderId();
  if (!providerCredentialsConfigured("text", id)) return null;
  return id ? textAdapters.get(id) ?? null : null;
}

export function getImageProvider(): ImageGenerationProvider | null {
  const id = imageProviderId();
  if (!providerCredentialsConfigured("image", id)) return null;
  return id ? imageAdapters.get(id) ?? null : null;
}

export function getVideoProviderById(providerId: string): VideoGenerationProvider | null {
  if (!providerCredentialsConfigured("video", providerId)) return null;
  return videoAdapters.get(providerId) ?? null;
}

export function getVideoProvider(): VideoGenerationProvider | null {
  const id = videoProviderId();
  return id ? getVideoProviderById(id) : null;
}

export function getPublishingProvider(platform: PublishingPlatform): PublishingProvider | null {
  return publishingAdapters.get(platform) ?? null;
}

export function getProviderStatuses(): ProviderStatus[] {
  const textProvider = textProviderId();
  const imageProvider = imageProviderId();
  const videoProvider = videoProviderId();
  const textConfigured = providerCredentialsConfigured("text", textProvider);
  const imageConfigured = providerCredentialsConfigured("image", imageProvider);
  const videoConfigured = providerCredentialsConfigured("video", videoProvider);
  const supabaseConfigured = Boolean(supabaseProjectUrl && supabasePublishableKey);
  const metaConfigured = all("META_APP_ID", "META_APP_SECRET", "META_VERIFY_TOKEN");
  const whatsappConfigured = all("WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN");
  const tiktokConfigured = all("TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET");
  const workerConfigured = all("SUPABASE_SECRET_KEY", "INTERNAL_WORKER_TOKEN");
  const metaPublishingExecutable = Boolean(
    getPublishingProvider("instagram") || getPublishingProvider("facebook"),
  );
  const tiktokPublishingExecutable = Boolean(getPublishingProvider("tiktok"));

  return [
    {
      id: "supabase",
      label: "Supabase",
      category: "database",
      configured: supabaseConfigured,
      executable: supabaseConfigured,
      provider: "supabase",
      detail:
        "The project URL and publishable key are available to the server. Privileged worker operations require a separate server-only modern Supabase secret key.",
    },
    {
      id: "publish-worker",
      label: "Publish Worker Runtime",
      category: "publishing",
      configured: workerConfigured,
      executable: workerConfigured,
      provider: "internal-worker",
      detail: workerConfigured
        ? "A modern Supabase secret key and internal worker authorization are configured. Queue execution still depends on a platform publishing adapter."
        : "SUPABASE_SECRET_KEY and INTERNAL_WORKER_TOKEN are both required before the internal publish worker can execute jobs.",
    },
    {
      id: "meta",
      label: "Meta / Instagram",
      category: "publishing",
      configured: metaConfigured,
      executable: metaConfigured && metaPublishingExecutable,
      provider: "meta",
      detail: metaConfigured
        ? "Meta configuration detected. Publishing still requires a registered Instagram/Facebook adapter that honors the worker idempotency key."
        : "Meta server configuration is incomplete; publishing and live ingestion remain disabled.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      category: "messaging",
      configured: whatsappConfigured,
      executable: false,
      provider: "meta-whatsapp-cloud",
      detail: whatsappConfigured
        ? "WhatsApp credentials are detected, but no messaging adapter is registered yet."
        : "WhatsApp server configuration is incomplete; sending and webhook ingestion remain disabled.",
    },
    {
      id: "tiktok",
      label: "TikTok Publishing",
      category: "publishing",
      configured: tiktokConfigured,
      executable: tiktokConfigured && tiktokPublishingExecutable,
      provider: "tiktok",
      detail: tiktokConfigured
        ? "TikTok configuration detected. Publishing still requires a registered adapter that honors the worker idempotency key and valid authorization."
        : "TikTok server configuration is incomplete; publishing remains disabled.",
    },
    {
      id: "text-ai",
      label: "AI Text Provider",
      category: "ai_text",
      configured: textConfigured,
      executable: textConfigured && Boolean(getTextProvider()),
      provider: textProvider,
      detail: textConfigured
        ? `${textProvider} is configured server-side and its executable adapter is registered.`
        : "Alibaba Model Studio requires MAAS_ENDPOINT and ALIBABA_MODEL_STUDIO_API_KEY, or another configured text adapter.",
    },
    {
      id: "image-ai",
      label: "AI Image Provider",
      category: "ai_image",
      configured: imageConfigured,
      executable: imageConfigured && Boolean(getImageProvider()),
      provider: imageProvider,
      detail: imageConfigured
        ? `${imageProvider} is configured server-side. Generated bytes or temporary provider output are persisted to private Supabase Storage before cataloging.`
        : "OpenAI GPT Image requires OPENAI_API_KEY, or Alibaba Model Studio requires MAAS_ENDPOINT and ALIBABA_MODEL_STUDIO_API_KEY.",
    },
    {
      id: "video-ai",
      label: "AI Video Provider",
      category: "ai_video",
      configured: videoConfigured,
      executable: videoConfigured && Boolean(getVideoProvider()),
      provider: videoProvider,
      detail: videoConfigured
        ? `${videoProvider} async video generation is configured. Jobs are polled and successful provider output is copied to private Supabase Storage.`
        : "Google Veo requires GEMINI_API_KEY, or Alibaba Model Studio requires MAAS_ENDPOINT and ALIBABA_MODEL_STUDIO_API_KEY.",
    },
  ];
}
