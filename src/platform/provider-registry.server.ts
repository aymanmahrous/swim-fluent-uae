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

  return [
    {
      id: "supabase",
      label: "Supabase",
      category: "database",
      configured: all("SUPABASE_URL", "SUPABASE_ANON_KEY") || all("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"),
      provider: "supabase",
      detail: "Public project configuration is present; privileged staff data remains protected by Supabase Auth and RPC role checks.",
    },
    {
      id: "meta",
      label: "Meta / Instagram",
      category: "messaging",
      configured: all("META_APP_ID", "META_APP_SECRET", "META_VERIFY_TOKEN"),
      provider: "meta",
      detail: "Requires app credentials, webhook verification and approved permissions before live message ingestion.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      category: "messaging",
      configured: all("WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"),
      provider: "meta-whatsapp-cloud",
      detail: "Requires a WhatsApp Business phone number ID and server-side access token.",
    },
    {
      id: "tiktok",
      label: "TikTok Publishing",
      category: "publishing",
      configured: all("TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"),
      provider: "tiktok",
      detail: "Requires an approved TikTok developer application and publishing authorization.",
    },
    {
      id: "text-ai",
      label: "AI Text Provider",
      category: "ai_text",
      configured: Boolean(textProvider && value("AI_TEXT_API_KEY")),
      provider: textProvider,
      detail: textProvider
        ? "Provider name detected; generation is enabled only when its server-side API key is also present and an adapter is implemented."
        : "Set AI_TEXT_PROVIDER and AI_TEXT_API_KEY on the server, then register a provider adapter.",
    },
    {
      id: "image-ai",
      label: "AI Image Provider",
      category: "ai_image",
      configured: Boolean(imageProvider && value("AI_IMAGE_API_KEY")),
      provider: imageProvider,
      detail: imageProvider
        ? "Provider name detected; image generation still requires a registered adapter."
        : "Set AI_IMAGE_PROVIDER and AI_IMAGE_API_KEY on the server, then register an image adapter.",
    },
    {
      id: "video-ai",
      label: "AI Video Provider",
      category: "ai_video",
      configured: Boolean(videoProvider && value("AI_VIDEO_API_KEY")),
      provider: videoProvider,
      detail: videoProvider
        ? "Provider name detected; async video generation still requires a registered adapter."
        : "Set AI_VIDEO_PROVIDER and AI_VIDEO_API_KEY on the server, then register an async video adapter.",
    },
  ];
}
