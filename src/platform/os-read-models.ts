import { z } from "zod";
import { ProviderStatusSchema } from "./provider-status";

const ContentStatusSchema = z.enum([
  "idea",
  "draft",
  "generated",
  "needs_review",
  "approved",
  "scheduled",
  "published",
  "failed",
]);

export const OsContentItemSchema = z.object({
  id: z.string().uuid(),
  plannedFor: z.string().nullable(),
  scheduledFor: z.string().nullable(),
  platform: z.enum(["instagram", "facebook", "tiktok"]),
  contentType: z.string(),
  topic: z.string(),
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()),
  visualPrompt: z.string(),
  status: ContentStatusSchema,
  language: z.enum(["ar", "en"]),
  contentPillar: z.string().nullable(),
  contentSlot: z.string().nullable(),
  contentFingerprint: z.string().nullable(),
  providerExternalId: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GrowthAnalyticsSchema = z.object({
  views: z.number().int().nonnegative(),
  dms: z.number().int().nonnegative(),
  qualifiedLeads: z.number().int().nonnegative(),
  bookingRequests: z.number().int().nonnegative(),
  publishedItems: z.number().int().nonnegative(),
  contentItems: z.number().int().nonnegative(),
  attributionReady: z.boolean(),
  note: z.string(),
});

const PriorityLeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  intent: z.string(),
  channel: z.enum(["instagram", "facebook", "whatsapp", "website"]),
  score: z.number().int(),
  humanRequired: z.boolean(),
  nextFollowUpAt: z.string().nullable(),
});

const CommandCenterDashboardSchema = z.object({
  metrics: z.object({
    newLeads: z.number().int().nonnegative(),
    hotLeads: z.number().int().nonnegative(),
    humanReplies: z.number().int().nonnegative(),
    followUpsDue: z.number().int().nonnegative(),
    postsScheduled: z.number().int().nonnegative(),
  }),
  priorityQueue: z.array(PriorityLeadSchema),
  generatedAt: z.string(),
});

export const CommandCenterResponseSchema = z.object({
  dashboard: CommandCenterDashboardSchema,
  providers: z.array(ProviderStatusSchema),
});

async function readJson(response: Response, unavailableCode: string): Promise<unknown> {
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error(unavailableCode);
  return response.json();
}

export async function fetchOsContentItems() {
  const body = await readJson(
    await fetch("/api/os-content-items", { headers: { Accept: "application/json" } }),
    "CONTENT_ITEMS_UNAVAILABLE",
  );
  const parsed = z.array(OsContentItemSchema).safeParse(body);
  if (!parsed.success) throw new Error("INVALID_CONTENT_ITEMS_RESPONSE");
  return parsed.data;
}

export async function fetchGrowthAnalytics() {
  const body = await readJson(
    await fetch("/api/os-analytics", { headers: { Accept: "application/json" } }),
    "ANALYTICS_UNAVAILABLE",
  );
  const parsed = GrowthAnalyticsSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_ANALYTICS_RESPONSE");
  return parsed.data;
}

export async function fetchCommandCenter() {
  const body = await readJson(
    await fetch("/api/os-command-center", { headers: { Accept: "application/json" } }),
    "COMMAND_CENTER_UNAVAILABLE",
  );
  const parsed = CommandCenterResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_COMMAND_CENTER_RESPONSE");
  return parsed.data;
}
