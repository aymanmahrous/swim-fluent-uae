import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; "),
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function isSensitivePath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/staff" ||
    pathname.startsWith("/staff/") ||
    pathname === "/os" ||
    pathname.startsWith("/os/") ||
    pathname.includes("password")
  );
}

function applyBrowserSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  if (isSensitivePath(new URL(request.url).pathname)) {
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function rejectCrossSiteUnsafeRequest(request: Request): Response | null {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method.toUpperCase())) return null;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return Response.json(
      { success: false, code: "CSRF_REJECTED" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const origin = request.headers.get("origin");
  if (!origin) return null;

  let sameOrigin = false;
  try {
    sameOrigin = new URL(origin).origin === new URL(request.url).origin;
  } catch {
    sameOrigin = false;
  }

  if (sameOrigin) return null;
  return Response.json(
    { success: false, code: "CSRF_REJECTED" },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const csrfRejection = rejectCrossSiteUnsafeRequest(request);
    if (csrfRejection) return applyBrowserSecurityHeaders(request, csrfRejection);

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applyBrowserSecurityHeaders(
        request,
        await normalizeCatastrophicSsrResponse(response),
      );
    } catch (error) {
      console.error(error);
      return applyBrowserSecurityHeaders(
        request,
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
