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

const textAdapters = new Map<string, TextGenerationProvider>();
const imageAdapters = new Map<string, ImageGenerationProvider>();
const videoAdapters = new Map<string, VideoGenerationProvider>();

export function registerTextProvider(provider: TextGenerationProvider): void {
  textAdapters.set(provider.id, provider);
}

export function registerImageProvider(provider: ImageGenerationProvider): void {
  imageAdapters.set(provider.id, provider);
}

export function registerVideoProvider(provider: VideoGenerationProvider): void {
  videoAdapters.set(provider.id, provider);
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

  return [
    {
      id: "supabase",
      label: "Supabase",
      category: "database",
      configured: all("SUPABASE_URL", "SUPABASE_ANON_KEY") || all("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"),
      executable: true,
      provider: "supabase",
      detail: "Public project configuration is present; privileged staff data remains protected by Supabase Auth and RPC role checks.",
    },
    {
      id: "meta",
      label: "Meta / Instagram",
      category: "messaging",
      configured: all("META_APP_ID", "META_APP_SECRET", "META_VERIFY_TOKEN"),
      executable: false,
      provider: "meta",
      detail: "Credential readiness only. Live ingestion still requires a registered webhook/channel adapter and approved permissions.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      category: "messaging",
      configured: all("WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"),
      executable: false,
      provider: "meta-whatsapp-cloud",
      detail: "Credential readiness only. Sending and webhook ingestion remain disabled until the channel adapter is registered.",
    },
    {
      id: "tiktok",
      label: "TikTok Publishing",
      category: "publishing",
      configured: all("TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"),
      executable: false,
      provider: "tiktok",
      detail: "Credential readiness only. Publishing remains disabled until authorization and a publishing adapter are implemented.",
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
