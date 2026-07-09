import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { supabaseSecretRpc } from "./supabase-secret.server";

const SchedulerTokenResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
});

export type AutomationSchedulerSource = "vercel_cron" | "supabase_cron";

function cronSecret(): string | null {
  const value = process.env.CRON_SECRET?.trim();
  return value || null;
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) return null;
  const token = authorization.slice(prefix.length).trim();
  return token || null;
}

function timingSafeSecretMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

async function verifySupabaseSchedulerToken(token: string): Promise<boolean> {
  const response = await supabaseSecretRpc("verify_content_automation_scheduler_token", {
    p_token: token,
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) return false;
  const parsed = SchedulerTokenResponseSchema.safeParse(payload);
  return parsed.success && parsed.data.valid;
}

export async function authenticateContentAutomationRequest(
  request: Request,
): Promise<AutomationSchedulerSource | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const expectedCronSecret = cronSecret();
  if (expectedCronSecret && timingSafeSecretMatch(expectedCronSecret, token)) {
    return "vercel_cron";
  }

  if (await verifySupabaseSchedulerToken(token)) {
    return "supabase_cron";
  }

  return null;
}
