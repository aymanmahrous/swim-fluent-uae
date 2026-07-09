import { z } from "zod";
import type {
  PublishingPlatform,
  PublishingProvider,
} from "./provider-registry.server";
import {
  createPublishingMediaSignedUrl,
  supabaseSecretRpc,
} from "./supabase-secret.server";

const META_GRAPH_BASE_URL = "https://graph.facebook.com";
const META_PROVIDER_ID = "meta-graph-publishing";
const CONTAINER_POLL_ATTEMPTS = 4;
const CONTAINER_POLL_DELAY_MS = 1500;

const GraphIdSchema = z.object({
  id: z.string().trim().min(1),
});

const GraphErrorSchema = z.object({
  error: z.object({
    message: z.string().optional(),
    type: z.string().optional(),
    code: z.number().optional(),
    error_subcode: z.number().optional(),
    fbtrace_id: z.string().optional(),
  }),
});

const ContainerStatusSchema = z.object({
  status_code: z.string().optional(),
  status: z.string().optional(),
});

const PublicationReceiptSchema = z.object({
  id: z.string().uuid(),
  contentItemId: z.string().uuid(),
  platform: z.enum(["instagram", "facebook", "tiktok"]),
  provider: z.string(),
  status: z.enum(["reserved", "container_created", "published", "ambiguous", "failed"]),
  externalContainerId: z.string().nullable(),
  externalPostId: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Receipt = z.infer<typeof PublicationReceiptSchema>;

type MetaConfig = {
  graphVersion: string;
  pageAccessToken: string;
  pageId: string | null;
  instagramBusinessAccountId: string | null;
};

class MetaGraphHttpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaGraphHttpError";
  }
}

function value(name: string): string | null {
  const candidate = process.env[name]?.trim();
  return candidate || null;
}

function safeGraphIdentifier(candidate: string | null, code: string): string | null {
  if (!candidate) return null;
  if (candidate.length > 200 || !/^[A-Za-z0-9_-]+$/.test(candidate)) {
    throw new Error(code);
  }
  return candidate;
}

function metaConfig(): MetaConfig {
  const graphVersion = value("META_GRAPH_VERSION");
  const pageAccessToken = value("META_PAGE_ACCESS_TOKEN");
  if (!graphVersion || !/^v\d+\.\d+$/.test(graphVersion)) {
    throw new Error("META_GRAPH_VERSION_NOT_CONFIGURED");
  }
  if (!pageAccessToken) throw new Error("META_PAGE_ACCESS_TOKEN_NOT_CONFIGURED");

  return {
    graphVersion,
    pageAccessToken,
    pageId: safeGraphIdentifier(value("META_PAGE_ID"), "META_PAGE_ID_INVALID"),
    instagramBusinessAccountId: safeGraphIdentifier(
      value("INSTAGRAM_BUSINESS_ACCOUNT_ID"),
      "INSTAGRAM_BUSINESS_ACCOUNT_ID_INVALID",
    ),
  };
}

export function configuredMetaPublishingPlatforms(): PublishingPlatform[] {
  try {
    const config = metaConfig();
    const platforms: PublishingPlatform[] = [];
    if (config.instagramBusinessAccountId) platforms.push("instagram");
    if (config.pageId) platforms.push("facebook");
    return platforms;
  } catch {
    return [];
  }
}

async function receiptRpc(
  functionName: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const response = await supabaseSecretRpc(functionName, body);
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${functionName.toUpperCase()}_HTTP_${response.status}`);
  }
  return payload;
}

async function claimReceipt(
  contentItemId: string,
  platform: PublishingPlatform,
): Promise<Receipt> {
  const parsed = PublicationReceiptSchema.safeParse(
    await receiptRpc("claim_publication_receipt", {
      p_content_item_id: contentItemId,
      p_platform: platform,
      p_provider: META_PROVIDER_ID,
    }),
  );
  if (!parsed.success) throw new Error("INVALID_PUBLICATION_RECEIPT_RESPONSE");
  return parsed.data;
}

async function recordContainer(
  contentItemId: string,
  platform: PublishingPlatform,
  externalContainerId: string,
): Promise<void> {
  await receiptRpc("record_publication_container", {
    p_content_item_id: contentItemId,
    p_platform: platform,
    p_provider: META_PROVIDER_ID,
    p_external_container_id: externalContainerId,
  });
}

async function markAmbiguous(
  contentItemId: string,
  platform: PublishingPlatform,
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : "META_PUBLISH_RESULT_AMBIGUOUS";
  await receiptRpc("mark_publication_receipt_ambiguous", {
    p_content_item_id: contentItemId,
    p_platform: platform,
    p_provider: META_PROVIDER_ID,
    p_error: message.slice(0, 1000),
  });
}

async function completeReceipt(
  contentItemId: string,
  platform: PublishingPlatform,
  externalPostId: string,
): Promise<void> {
  await receiptRpc("complete_publication_receipt", {
    p_content_item_id: contentItemId,
    p_platform: platform,
    p_provider: META_PROVIDER_ID,
    p_external_post_id: externalPostId,
  });
}

function graphUrl(config: MetaConfig, path: string): string {
  if (path.length < 1 || path.length > 500 || path.includes("..") || !/^[A-Za-z0-9_?=,&.-/]+$/.test(path)) {
    throw new Error("META_GRAPH_PATH_INVALID");
  }
  return `${META_GRAPH_BASE_URL}/${config.graphVersion}/${path.replace(/^\/+/, "")}`;
}

async function graphRequest(
  config: MetaConfig,
  path: string,
  method: "GET" | "POST",
  params: Record<string, string>,
): Promise<unknown> {
  const url = new URL(graphUrl(config, path));
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.pageAccessToken}`,
    Accept: "application/json",
  };
  let body: URLSearchParams | undefined;

  if (method === "GET") {
    for (const [name, parameterValue] of Object.entries(params)) {
      url.searchParams.set(name, parameterValue);
    }
  } else {
    body = new URLSearchParams(params);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = GraphErrorSchema.safeParse(payload);
    const detail = parsed.success
      ? [
          parsed.data.error.code,
          parsed.data.error.error_subcode,
          parsed.data.error.type,
          parsed.data.error.message,
        ]
          .filter((part) => part !== undefined && part !== null && String(part).length > 0)
          .join("_")
      : `HTTP_${response.status}`;
    throw new MetaGraphHttpError(`META_GRAPH_${detail}`.slice(0, 1000));
  }
  return payload;
}

async function graphPostId(
  config: MetaConfig,
  path: string,
  params: Record<string, string>,
): Promise<string> {
  const parsed = GraphIdSchema.safeParse(await graphRequest(config, path, "POST", params));
  if (!parsed.success) throw new Error("META_GRAPH_INVALID_ID_RESPONSE");
  return parsed.data.id;
}

function messageWithHashtags(caption: string, hashtags: string[]): string {
  const tags = hashtags
    .map((tag) => tag.trim().replace(/^#+/, ""))
    .filter(Boolean)
    .slice(0, 30)
    .map((tag) => `#${tag}`);
  return [caption.trim(), tags.join(" ")].filter(Boolean).join("\n\n");
}

function publicationMedia(
  media: Array<{
    assetType: "image" | "video" | "logo" | "other";
    storagePath: string | null;
    provider: string | null;
  }>,
): Array<{ assetType: "image" | "video"; storagePath: string }> {
  return media.flatMap((asset) => {
    if (
      (asset.assetType !== "image" && asset.assetType !== "video") ||
      !asset.storagePath
    ) {
      return [];
    }
    return [{ assetType: asset.assetType, storagePath: asset.storagePath }];
  });
}

async function waitForInstagramContainer(
  config: MetaConfig,
  externalContainerId: string,
): Promise<void> {
  for (let attempt = 0; attempt < CONTAINER_POLL_ATTEMPTS; attempt += 1) {
    const parsed = ContainerStatusSchema.safeParse(
      await graphRequest(config, externalContainerId, "GET", {
        fields: "status_code,status",
      }),
    );
    if (!parsed.success) throw new Error("META_INSTAGRAM_CONTAINER_STATUS_INVALID");

    const code = parsed.data.status_code?.toUpperCase();
    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`META_INSTAGRAM_CONTAINER_${code}:${parsed.data.status ?? "unknown"}`);
    }
    if (attempt + 1 < CONTAINER_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, CONTAINER_POLL_DELAY_MS));
    }
  }

  throw new Error("META_INSTAGRAM_CONTAINER_NOT_READY");
}

async function publishFinalWithAmbiguityGuard(input: {
  config: MetaConfig;
  contentItemId: string;
  platform: PublishingPlatform;
  path: string;
  params: Record<string, string>;
}): Promise<string> {
  try {
    return await graphPostId(input.config, input.path, input.params);
  } catch (error) {
    if (error instanceof MetaGraphHttpError) throw error;
    await markAmbiguous(input.contentItemId, input.platform, error).catch(() => undefined);
    throw new Error("META_PUBLISH_AMBIGUOUS_REQUIRES_RECONCILIATION");
  }
}

async function publishInstagram(input: {
  config: MetaConfig;
  receipt: Receipt;
  contentItemId: string;
  caption: string;
  media: ReturnType<typeof publicationMedia>;
}): Promise<string> {
  const accountId = input.config.instagramBusinessAccountId;
  if (!accountId) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID_NOT_CONFIGURED");
  if (input.media.length !== 1) throw new Error("META_INSTAGRAM_EXACTLY_ONE_MEDIA_REQUIRED");

  const asset = input.media[0];
  let containerId = input.receipt.externalContainerId;
  if (!containerId) {
    const mediaUrl = await createPublishingMediaSignedUrl(asset.storagePath);
    containerId = await graphPostId(input.config, `${accountId}/media`, {
      ...(asset.assetType === "video"
        ? { media_type: "REELS", video_url: mediaUrl }
        : { image_url: mediaUrl }),
      caption: input.caption,
    });
    await recordContainer(input.contentItemId, "instagram", containerId);
  }

  if (asset.assetType === "video") {
    await waitForInstagramContainer(input.config, containerId);
  }

  return publishFinalWithAmbiguityGuard({
    config: input.config,
    contentItemId: input.contentItemId,
    platform: "instagram",
    path: `${accountId}/media_publish`,
    params: { creation_id: containerId },
  });
}

async function publishFacebook(input: {
  config: MetaConfig;
  contentItemId: string;
  caption: string;
  media: ReturnType<typeof publicationMedia>;
}): Promise<string> {
  const pageId = input.config.pageId;
  if (!pageId) throw new Error("META_PAGE_ID_NOT_CONFIGURED");
  if (input.media.length > 1) throw new Error("META_FACEBOOK_MULTIPLE_MEDIA_UNSUPPORTED");

  const asset = input.media[0];
  if (!asset) {
    return publishFinalWithAmbiguityGuard({
      config: input.config,
      contentItemId: input.contentItemId,
      platform: "facebook",
      path: `${pageId}/feed`,
      params: { message: input.caption },
    });
  }

  const mediaUrl = await createPublishingMediaSignedUrl(asset.storagePath);
  return publishFinalWithAmbiguityGuard({
    config: input.config,
    contentItemId: input.contentItemId,
    platform: "facebook",
    path: `${pageId}/${asset.assetType === "video" ? "videos" : "photos"}`,
    params:
      asset.assetType === "video"
        ? { file_url: mediaUrl, description: input.caption }
        : { url: mediaUrl, caption: input.caption, published: "true" },
  });
}

export function createMetaPublishingProvider(): PublishingProvider | null {
  const platforms = configuredMetaPublishingPlatforms();
  if (platforms.length < 1) return null;

  return {
    id: META_PROVIDER_ID,
    platforms,
    async publish(input) {
      const config = metaConfig();
      const receipt = await claimReceipt(input.contentItemId, input.platform);
      if (receipt.status === "published" && receipt.externalPostId) {
        return {
          providerExternalId: receipt.externalPostId,
          publishedAt: new Date().toISOString(),
        };
      }
      if (receipt.status === "ambiguous") {
        throw new Error("META_PUBLISH_AMBIGUOUS_REQUIRES_RECONCILIATION");
      }
      if (receipt.status === "failed") {
        throw new Error("META_PUBLICATION_RECEIPT_FAILED");
      }

      const caption = messageWithHashtags(input.caption, input.hashtags);
      const media = publicationMedia(input.media);
      const externalPostId =
        input.platform === "instagram"
          ? await publishInstagram({
              config,
              receipt,
              contentItemId: input.contentItemId,
              caption,
              media,
            })
          : input.platform === "facebook"
            ? await publishFacebook({
                config,
                contentItemId: input.contentItemId,
                caption,
                media,
              })
            : (() => {
                throw new Error("META_PLATFORM_UNSUPPORTED");
              })();

      await completeReceipt(input.contentItemId, input.platform, externalPostId);
      return {
        providerExternalId: externalPostId,
        publishedAt: new Date().toISOString(),
      };
    },
  };
}
