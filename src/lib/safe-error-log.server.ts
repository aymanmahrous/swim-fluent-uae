const REDACTED = "[REDACTED]";

function sanitizeMessage(value: string): string {
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(?:https?|wss):\/\/[^\s"'<>]+/gi, "[REDACTED_URL]")
    .replace(/([?&](?:access_token|api[_-]?key|key|secret|signature|sig|token)=)[^&\s]+/gi, "$1[REDACTED_QUERY]")
    .replace(/\b(password|passwd|credential|client_secret|refresh_token)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .slice(0, 500);
}

function errorIdentity(error: unknown): { error_name: string; sanitized_message: string } {
  if (error instanceof Error) {
    return {
      error_name: error.name || "Error",
      sanitized_message: sanitizeMessage(error.message || "SERVER_ERROR"),
    };
  }

  if (typeof error === "string") {
    return { error_name: "Error", sanitized_message: sanitizeMessage(error) };
  }

  return { error_name: "UnknownError", sanitized_message: REDACTED };
}

export function logServerError(event: string, error: unknown): void {
  const identity = errorIdentity(error);
  console.error(
    JSON.stringify({
      level: "error",
      event,
      ...identity,
    }),
  );
}
