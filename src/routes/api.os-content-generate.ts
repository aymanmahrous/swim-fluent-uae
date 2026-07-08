import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getTextProvider } from "../platform/provider-registry.server";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const GenerateRequestSchema = z.object({
  goal: z.string().trim().min(2).max(200),
  audience: z.string().trim().min(2).max(300),
  topic: z.string().trim().min(2).max(300),
  days: z.number().int().min(1).max(30),
  language: z.enum(["ar", "en"]),
});

const GeneratedItemSchema = z.object({
  platform: z.enum(["instagram", "facebook", "tiktok"]),
  contentType: z.string().trim().min(2).max(80),
  topic: z.string().trim().max(300).default(""),
  hook: z.string().trim().max(500).default(""),
  caption: z.string().trim().min(2).max(5000),
  cta: z.string().trim().max(500).default(""),
  hashtags: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  visualPrompt: z.string().trim().max(2000).default(""),
});

const GeneratedBatchSchema = z.object({
  items: z.array(GeneratedItemSchema).min(1).max(60),
});

function parseProviderJson(text: string): z.infer<typeof GeneratedBatchSchema> | null {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed: unknown = JSON.parse(withoutFence);
    const validated = GeneratedBatchSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/os-content-generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        if (!(["super_admin", "admin", "content_manager"] as const).includes(
          session.profile.role as "super_admin" | "admin" | "content_manager",
        )) {
          return Response.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        const body: unknown = await request.json().catch(() => null);
        const parsed = GenerateRequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const provider = getTextProvider();
        if (!provider) {
          return Response.json(
            {
              success: false,
              code: "PROVIDER_NOT_READY",
              message: "No executable text generation adapter is registered for the configured provider.",
            },
            { status: 503 },
          );
        }

        const generation = await provider.generateText({
          language: parsed.data.language,
          system:
            "You are the content strategy engine for Relax Fix UAE and Coach Ayman. Create accurate swimming and water-confidence marketing content. Never make medical claims. Return valid JSON only, with no markdown.",
          prompt: JSON.stringify({
            task: "Generate a content batch for human review before publishing.",
            requestedDays: parsed.data.days,
            goal: parsed.data.goal,
            audience: parsed.data.audience,
            topic: parsed.data.topic,
            language: parsed.data.language,
            requiredShape: {
              items: [
                {
                  platform: "instagram | facebook | tiktok",
                  contentType: "reel | image | story | educational | offer | testimonial",
                  topic: "string",
                  hook: "string",
                  caption: "string",
                  cta: "string",
                  hashtags: ["string"],
                  visualPrompt: "string",
                },
              ],
            },
            constraints: [
              "Return one item per requested day.",
              "Use only the requested language for public-facing copy.",
              "Do not promise cures, rehabilitation outcomes, or guaranteed results.",
              "Keep all generated items as drafts for human review; never claim they were published.",
            ],
          }),
        });

        const generated = parseProviderJson(generation.text);
        if (!generated || generated.items.length !== parsed.data.days) {
          return Response.json(
            {
              success: false,
              code: "INVALID_PROVIDER_OUTPUT",
              message: "The provider response failed structured-output validation.",
            },
            { status: 502 },
          );
        }

        const saveResponse = await staffRpc(
          session.accessToken,
          "create_staff_generated_content_batch",
          {
            p_items: generated.items,
            p_provider_external_id: generation.providerRequestId ?? null,
          },
        );
        const saveText = await saveResponse.text();
        if (!saveResponse.ok) {
          return new Response(saveText, {
            status: saveResponse.status,
            headers: sessionCookieHeaders(session),
          });
        }

        return new Response(saveText, {
          status: 200,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
