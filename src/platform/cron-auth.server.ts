import { timingSafeEqual } from "node:crypto";

function cronSecret(): string | null {
  const value = process.env.CRON_SECRET?.trim();
  return value || null;
}

export function isCronConfigured(): boolean {
  return Boolean(cronSecret());
}

export function verifyCronRequest(request: Request): boolean {
  const expected = cronSecret();
  if (!expected) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!authorization.startsWith(prefix)) return false;

  const provided = authorization.slice(prefix.length);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
