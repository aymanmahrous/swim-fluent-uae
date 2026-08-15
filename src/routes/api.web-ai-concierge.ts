import { randomUUID } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  abuseControlAllowed,
  abuseControlFingerprint,
  rateLimitedResponse,
} from "../platform/abuse-control.server";
import { runWebConciergeTurn } from "../platform/web-concierge.server";

const sessionCookieName = "rf_web_concierge_session";

const TurnRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("cookie") ?? "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    out[key] = decodeURIComponent(rest.join("=") ?? "");
  }
  return out;
}

function sessionCookieHeader(sessionId: string): string {
  return `${sessionCookieName}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24}`;
}

export const Route = createFileRoute("/api/web-ai-concierge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (
          !abuseControlAllowed(request, {
            scope: "web-ai-concierge",
            windowMs: 60 * 1000,
            maxAttempts: 12,
          })
        ) {
          return rateLimitedResponse(60);
        }

        const cookies = parseCookies(request);
        const isNewSession = !cookies[sessionCookieName];
        const sessionId = cookies[sessionCookieName] || randomUUID();

        const payload: unknown = await request.json().catch(() => null);
        const parsed = TurnRequestSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { success: false, code: "INVALID_INPUT" },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        try {
          const result = await runWebConciergeTurn(sessionId, parsed.data.message);

          const headers = new Headers({ "Cache-Control": "no-store" });
          if (isNewSession) {
            headers.append("Set-Cookie", sessionCookieHeader(sessionId));
          }

          if (!result.ok) {
            return Response.json(
              { success: false, code: result.code },
              { status: result.code === "INVALID_SESSION" ? 400 : 503, headers },
            );
          }

          return Response.json(
            {
              success: true,
              code: result.code,
              reply: result.code === "REPLY" ? result.draftReply : null,
              language: result.language,
            },
            { status: 200, headers },
          );
        } catch (error) {
          console.error("web_ai_concierge_turn_failed", error);
          return Response.json(
            { success: false, code: "SERVER_ERROR" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
