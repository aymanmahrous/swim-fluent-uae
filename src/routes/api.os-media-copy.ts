import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getTextProvider } from "../platform/provider-registry.server";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
} from "../platform/staff-session.server";

const RequestSchema = z.object({
  assetType: z.enum(["image", "video"]),
  mediaPrompt: z.string().trim().min(2).max(2000),
  platform: z.enum(["instagram", "facebook", "tiktok"]),
  language: z.enum(["ar", "en"]),
  goal: z.string().trim().min(2).max(200).default("Bookings"),
});

const CopySchema = z.object({
  hook: z.string().trim().min(2).max(500),
  caption: z.string().trim().min(2).max(5000),
  cta: z.string().trim().min(2).max(500),
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30),
});

function parseProviderJson(text: string): unknown {
  const normalized = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(normalized) as unknown;
}

export const Route = createFileRoute("/api/os-media-copy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ success: false, code: "UNAUTHORIZED" }, { status: 401 });
        if (!hasStaffPermission(session.profile.role, "media.generate")) {
          return Response.json({ success: false, code: "FORBIDDEN" }, { status: 403 });
        }

        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const provider = getTextProvider();
        if (!provider) {
          return Response.json(
            { success: false, code: "PROVIDER_NOT_READY" },
            { status: 503, headers: sessionCookieHeaders(session) },
          );
        }

        try {
          const generated = await provider.generateText({
            language: parsed.data.language,
            system:
              "You are the social copy engine for Relax Fix UAE and Coach Ayman in Abu Dhabi. Write copy that matches the supplied generation prompt exactly. The asset was generated from that prompt, so do not claim to inspect pixels or frames. Avoid medical claims. Return valid JSON only with hook, caption, cta, hashtags. No markdown.",
            prompt: JSON.stringify({
              assetType: parsed.data.assetType,
              mediaGenerationPrompt: parsed.data.mediaPrompt,
              platform: parsed.data.platform,
              language: parsed.data.language,
              goal: parsed.data.goal,
              brand: "Relax Fix UAE",
              coach: "Coach Ayman",
              market: "Abu Dhabi, UAE",
            }),
          });

          const copy = CopySchema.safeParse(parseProviderJson(generated.text));
          if (!copy.success) {
            return Response.json(
              { success: false, code: "INVALID_PROVIDER_OUTPUT" },
              { status: 502, headers: sessionCookieHeaders(session) },
            );
          }

          return Response.json(
            {
              success: true,
              copy: copy.data,
              provider: provider.id,
              providerRequestId: generated.providerRequestId ?? null,
            },
            { headers: sessionCookieHeaders(session) },
          );
        } catch {
          return Response.json(
            { success: false, code: "COPY_GENERATION_FAILED" },
            { status: 502, headers: sessionCookieHeaders(session) },
          );
        }
      },
    },
  },
});
