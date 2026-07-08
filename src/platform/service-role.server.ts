import { supabaseProjectUrl } from "./supabase-project.server";

function serviceRoleKey(): string | null {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return value || null;
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(serviceRoleKey());
}

export async function serviceRoleRpc(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<Response> {
  const key = serviceRoleKey();
  if (!key) {
    return Response.json(
      { success: false, code: "SERVICE_ROLE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  return fetch(`${supabaseProjectUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  });
}
