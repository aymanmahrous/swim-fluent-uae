import { z } from "zod";

export const ProviderStatusSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(["database", "messaging", "publishing", "ai_text", "ai_image", "ai_video"]),
  configured: z.boolean(),
  provider: z.string().nullable(),
  detail: z.string(),
});

export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;

export async function fetchProviderStatuses(): Promise<ProviderStatus[]> {
  const response = await fetch("/api/os-integrations", { headers: { Accept: "application/json" } });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("INTEGRATIONS_UNAVAILABLE");
  const parsed = z.array(ProviderStatusSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_INTEGRATIONS_RESPONSE");
  return parsed.data;
}
