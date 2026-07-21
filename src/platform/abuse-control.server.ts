import { createHash } from "node:crypto";

export type AbuseControlPolicy = {
  scope: string;
  windowMs: number;
  maxAttempts: number;
  subject?: string;
};

const attempts = new Map<string, number[]>();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function keyFor(request: Request, policy: AbuseControlPolicy): string {
  return createHash("sha256")
    .update(`${policy.scope}:${clientIp(request)}:${policy.subject?.trim().toLowerCase() ?? ""}`)
    .digest("hex");
}

export function abuseControlAllowed(request: Request, policy: AbuseControlPolicy): boolean {
  const now = Date.now();
  const key = keyFor(request, policy);
  const recent = (attempts.get(key) ?? []).filter((value) => now - value < policy.windowMs);
  if (recent.length >= policy.maxAttempts) return false;
  recent.push(now);
  attempts.set(key, recent);

  if (attempts.size > 5_000) {
    for (const [entryKey, values] of attempts) {
      if (!values.some((value) => now - value < 60 * 60 * 1000)) attempts.delete(entryKey);
    }
  }
  return true;
}

export function rateLimitedResponse(retryAfterSeconds: number): Response {
  return Response.json(
    { success: false, code: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
