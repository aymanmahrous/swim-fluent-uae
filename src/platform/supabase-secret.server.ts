import { supabaseProjectUrl } from "./supabase-project.server";

function supabaseSecretKey(): string | null {
  const value = process.env.SUPABASE_SECRET_KEY?.trim();
  return value || null;
}

export function isSupabaseSecretConfigured(): boolean {
  return Boolean(supabaseSecretKey());
}

export async function supabaseSecretRpc(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<Response> {
  const key = supabaseSecretKey();
  if (!key) {
    return Response.json(
      { success: false, code: "SUPABASE_SECRET_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  return fetch(`${supabaseProjectUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  });
}
