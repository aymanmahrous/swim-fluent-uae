import { supabaseProjectUrl } from "./supabase-project.server";
import {
  isSupabaseServerKeyConfigured,
  supabaseServerKeyHeaders,
} from "./supabase-server-key.server";

export { createPublishingMediaSignedUrl } from "./publishing-media-sign.server";

export function isSupabaseSecretConfigured(): boolean {
  return isSupabaseServerKeyConfigured();
}

export async function supabaseSecretRpc(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<Response> {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!key || !isSupabaseServerKeyConfigured()) {
    return Response.json(
      { success: false, code: "SUPABASE_SECRET_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  let headers: Record<string, string>;
  try {
    headers = {
      ...supabaseServerKeyHeaders(),
      apikey: key,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "SUPABASE_SECRET_KEY_FORMAT_INVALID";
    return Response.json({ success: false, code }, { status: 503 });
  }

  return fetch(`${supabaseProjectUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
