import { createHash } from "node:crypto";
import { supabaseProjectUrl, supabasePublicHeaders } from "./supabase-project.server";

const RECOVERY_REDIRECT_URL = "https://relaxfixuae.com/reset-password";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const attempts = new Map<string, number[]>();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function rateLimitKey(request: Request, email: string): string {
  return createHash("sha256")
    .update(`${clientIp(request)}:${email.trim().toLowerCase()}`)
    .digest("hex");
}

export function passwordRecoveryAllowed(request: Request, email: string): boolean {
  const now = Date.now();
  const key = rateLimitKey(request, email);
  const recent = (attempts.get(key) ?? []).filter((value) => now - value < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) return false;
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2_000) {
    for (const [entryKey, values] of attempts) {
      if (!values.some((value) => now - value < WINDOW_MS)) attempts.delete(entryKey);
    }
  }
  return true;
}

export async function sendPasswordRecoveryEmail(email: string): Promise<boolean> {
  const response = await fetch(
    `${supabaseProjectUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(RECOVERY_REDIRECT_URL)}`,
    {
      method: "POST",
      headers: { ...supabasePublicHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
  );
  return response.ok;
}

export async function updateRecoveredPassword(
  accessToken: string,
  password: string,
): Promise<"success" | "invalid_session" | "update_failed"> {
  const userResponse = await fetch(`${supabaseProjectUrl}/auth/v1/user`, {
    headers: { ...supabasePublicHeaders(), Authorization: `Bearer ${accessToken}` },
  });
  if (!userResponse.ok) return "invalid_session";

  const response = await fetch(`${supabaseProjectUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...supabasePublicHeaders(),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  return response.ok ? "success" : "update_failed";
}
