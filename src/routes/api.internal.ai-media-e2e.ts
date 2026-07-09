import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  type GithubActionsOidcContext,
  verifyGithubActionsOidc,
} from "../platform/github-actions-oidc.server";

const RequestSchema = z.object({ action: z.literal("status") });

function productionDeploymentMatches(context: GithubActionsOidcContext): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_GIT_COMMIT_REF === "main" &&
    process.env.VERCEL_GIT_COMMIT_SHA === context.sha
  );
}

function responseHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
  };
}

export const Route = createFileRoute("/api/internal/ai-media-e2e")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const oidc = await verifyGithubActionsOidc(request);
        if (!oidc) {
          return Response.json(
            { success: false, code: "UNAUTHORIZED" },
            { status: 401, headers: responseHeaders() },
          );
        }
        if (!productionDeploymentMatches(oidc)) {
          return Response.json(
            { success: false, code: "DEPLOYMENT_NOT_READY" },
            { status: 409, headers: responseHeaders() },
          );
        }

        const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json(
            { success: false, code: "INVALID_INPUT" },
            { status: 400, headers: responseHeaders() },
          );
        }

        return Response.json(
          { success: true, ready: true, sha: oidc.sha },
          { headers: responseHeaders() },
        );
      },
    },
  },
});
