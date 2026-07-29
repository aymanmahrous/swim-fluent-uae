import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { logServerError } from "./lib/safe-error-log.server";

function isSensitiveInternalPath(pathname: string): boolean {
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

const sensitiveResponseHeadersMiddleware = createMiddleware().server(
  async ({ next, pathname }) => {
    const result = await next();
    if (!isSensitiveInternalPath(pathname)) return result;

    const headers = new Headers(result.response.headers);
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    return {
      ...result,
      response: new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers,
      }),
    };
  },
);

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    logServerError("start_middleware_error", error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [sensitiveResponseHeadersMiddleware, errorMiddleware],
}));
