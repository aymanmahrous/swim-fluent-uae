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
  }): Promise<{ assetUrl: string; providerRequestId?: string }>;
}

export interface VideoGenerationProvider {
  readonly id: string;
  createVideoJob(input: {
    prompt: string;
    sourceAssetUrl?: string;
  }): Promise<{ jobId: string }>;
  getVideoJob(jobId: string): Promise<{
    status: "queued" | "running" | "succeeded" | "failed";
    assetUrl?: string;
    error?: string;
  }>;
}

export interface PublishingProvider {
  readonly id: string;
  readonly platforms: readonly PublishingPlatform[];
  publish(input: {
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

const textAdapters = new Map<string, TextGenerationProvider>();
const imageAdapters = new Map<string, ImageGenerationProvider>();
const videoAdapters = new Map<string, VideoGenerationProvider>();
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

export function getTextProvider(): TextGenerationProvider | null {
  const id = value("AI_TEXT_PROVIDER");
  return id ? textAdapters.get(id) ?? null : null;
}

export function getImageProvider(): ImageGenerationProvider | null {
  const id = value("AI_IMAGE_PROVIDER");
  return id ? imageAdapters.get(id) ?? null : null;
}

export function getVideoProvider(): VideoGenerationProvider | null {
  const id = value("AI_VIDEO_PROVIDER");
  return id ? videoAdapters.get(id) ?? null : null;
}

export function getPublishingProvider(platform: PublishingPlatform): PublishingProvider | null {
  return publishingAdapters.get(platform) ?? null;
}

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate ? candidate : null;
}

function all(...names: string[]): boolean {
  return names.every((name) => Boolean(value(name)));
}

export function getProviderStatuses(): ProviderStatus[] {
  const textProvider = value("AI_TEXT_PROVIDER");
  const imageProvider = value("AI_IMAGE_PROVIDER");
  const videoProvider = value("AI_VIDEO_PROVIDER");
  const textConfigured = Boolean(textProvider && value("AI_TEXT_API_KEY"));
  const imageConfigured = Boolean(imageProvider && value("AI_IMAGE_API_KEY"));
  const videoConfigured = Boolean(videoProvider && value("AI_VIDEO_API_KEY"));
  const supabaseConfigured = all("SUPABASE_URL", "SUPABASE_ANON_KEY") || all("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY");
  const metaConfigured = all("META_APP_ID", "META_APP_SECRET", "META_VERIFY_TOKEN");
  const whatsappConfigured = all("WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN");
  const tiktokConfigured = all("TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET");
  const metaPublishingExecutable = Boolean(getPublishingProvider("instagram") || getPublishingProvider("facebook"));
  const tiktokPublishingExecutable = Boolean(getPublishingProvider("tiktok"));

  return [
    {
      id: "supabase",
      label: "Supabase",
      category: "database",
      configured: supabaseConfigured,
      executable: supabaseConfigured,
      provider: "supabase",
      detail: "Public project configuration is present only when the required server/client-safe project settings are available; privileged operations remain server-side.",
    },
    {
      id: "meta",
      label: "Meta / Instagram",
      category: "publishing",
      configured: metaConfigured,
      executable: metaConfigured && metaPublishingExecutable,
      provider: "meta",
      detail: metaConfigured
        ? "Meta configuration detected. Publishing still requires a registered Instagram/Facebook adapter."
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
        ? "TikTok configuration detected. Publishing still requires a registered TikTok adapter and valid authorization."
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
        ? "Server configuration detected. Execution requires a registered adapter with the same provider id."
        : "Server-side text provider configuration is incomplete.",
    },
    {
      id: "image-ai",
      label: "AI Image Provider",
      category: "ai_image",
      configured: imageConfigured,
      executable: imageConfigured && Boolean(getImageProvider()),
      provider: imageProvider,
      detail: imageConfigured
        ? "Server configuration detected. Execution requires a registered image adapter."
        : "Server-side image provider configuration is incomplete.",
    },
    {
      id: "video-ai",
      label: "AI Video Provider",
      category: "ai_video",
      configured: videoConfigured,
      executable: videoConfigured && Boolean(getVideoProvider()),
      provider: videoProvider,
      detail: videoConfigured
        ? "Server configuration detected. Execution requires a registered async video adapter."
        : "Server-side video provider configuration is incomplete.",
    },
  ];
}
