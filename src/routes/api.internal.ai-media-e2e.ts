import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  cleanupTemporaryStaff,
  provisionTemporaryStaff,
} from "../platform/ai-media-e2e-admin.server";
import { verifyGithubActionsOidc } from "../platform/github-actions-oidc.server";

const EXPECTED_PREVIEW_BRANCH = "agent/verify-ai-media-e2e";

const RequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("provision") }),
  z.object({
    action: z.literal("cleanup"),
    userIds: z.array(z.string().uuid()).min(1).max(4),
  }),
]);

function previewScopeAllowed(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_COMMIT_REF === EXPECTED_PREVIEW_BRANCH
  );
}

function responseHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
  };
}

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "AI_MEDIA_E2E_FAILED";
  return message.split(":")[0].replace(/[^A-Z0-9_]/gi, "_").slice(0, 100);
}

export const Route = createFileRoute("/api/internal/ai-media-e2e")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!previewScopeAllowed()) {
          return Response.json({ success: false, code: "NOT_FOUND" }, { status: 404 });
        }
        if (!(await verifyGithubActionsOidc(request))) {
          return Response.json(
            { success: false, code: "UNAUTHORIZED" },
            { status: 401, headers: responseHeaders() },
          );
        }

        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json(
            { success: false, code: "INVALID_INPUT" },
            { status: 400, headers: responseHeaders() },
          );
        }

        try {
          if (parsed.data.action === "provision") {
            const primary = await provisionTemporaryStaff("primary");
            try {
              const secondary = await provisionTemporaryStaff("secondary");
              return Response.json(
                { success: true, users: [primary, secondary] },
                { headers: responseHeaders() },
              );
            } catch (error) {
              await cleanupTemporaryStaff(primary.userId).catch(() => undefined);
              throw error;
            }
          }

          const results = await Promise.allSettled(
            parsed.data.userIds.map((userId) => cleanupTemporaryStaff(userId)),
          );
          const failures = results.filter((result) => result.status === "rejected").length;
          if (failures > 0) {
            return Response.json(
              { success: false, code: "E2E_CLEANUP_FAILED", failures },
              { status: 500, headers: responseHeaders() },
            );
          }

          return Response.json(
            { success: true, cleaned: parsed.data.userIds.length },
            { headers: responseHeaders() },
          );
        } catch (error) {
          return Response.json(
            { success: false, code: safeCode(error) },
            { status: 500, headers: responseHeaders() },
          );
        }
      },
    },
  },
});
