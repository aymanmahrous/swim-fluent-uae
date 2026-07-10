import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { supabaseSecretRpc } from "./supabase-secret.server";

const SchedulerTokenResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
});

const SupabaseServerErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: z.string(),
});

export type AutomationSchedulerSource = "vercel_cron" | "supabase_cron";

export type AutomationSchedulerAuthResult =
  | { authenticated: true; source: AutomationSchedulerSource }
  | {
      authenticated: false;
      code:
        | "UNAUTHORIZED"
        | "SUPABASE_SECRET_NOT_CONFIGURED"
        | "SUPABASE_SECRET_KEY_FORMAT_INVALID"
        | "SCHEDULER_AUTH_UPSTREAM_FAILED";
      status: 401 | 503;
    };

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

async function verifySupabaseSchedulerToken(
  token: string,
): Promise<AutomationSchedulerAuthResult> {
  const response = await supabaseSecretRpc("verify_content_automation_scheduler_token", {
    p_token: token,
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = SupabaseServerErrorSchema.safeParse(payload);
    const code = parsed.success ? parsed.data.code : null;
    if (code === "SUPABASE_SECRET_NOT_CONFIGURED") {
      return { authenticated: false, code, status: 503 };
    }
    if (code === "SUPABASE_SECRET_KEY_FORMAT_INVALID") {
      return { authenticated: false, code, status: 503 };
    }
    return {
      authenticated: false,
      code: "SCHEDULER_AUTH_UPSTREAM_FAILED",
      status: 503,
    };
  }

  const parsed = SchedulerTokenResponseSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.valid) {
    return { authenticated: false, code: "UNAUTHORIZED", status: 401 };
  }

  return { authenticated: true, source: "supabase_cron" };
}

export async function authenticateContentAutomationRequest(
  request: Request,
): Promise<AutomationSchedulerAuthResult> {
  const token = bearerToken(request);
  if (!token) {
    return { authenticated: false, code: "UNAUTHORIZED", status: 401 };
  }

  const expectedCronSecret = cronSecret();
  if (expectedCronSecret && timingSafeSecretMatch(expectedCronSecret, token)) {
    return { authenticated: true, source: "vercel_cron" };
  }

  return verifySupabaseSchedulerToken(token);
}
