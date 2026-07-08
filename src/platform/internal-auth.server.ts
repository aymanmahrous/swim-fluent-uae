import { timingSafeEqual } from "node:crypto";

function workerToken(): string | null {
  const value = process.env.INTERNAL_WORKER_TOKEN?.trim();
  return value || null;
}

export function isInternalWorkerConfigured(): boolean {
  return Boolean(workerToken());
}

export function verifyInternalWorkerRequest(request: Request): boolean {
  const expected = workerToken();
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
