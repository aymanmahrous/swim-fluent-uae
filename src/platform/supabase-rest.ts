const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublicKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export class PlatformConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlatformConfigurationError";
  }
}

export class PlatformNetworkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PlatformNetworkError";
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublicKey);
}

function requireConfig(): { url: string; publicKey: string } {
  if (!supabaseUrl || !supabasePublicKey) {
    throw new PlatformConfigurationError(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  const url = supabaseUrl.trim().replace(/\/$/, "");
  const publicKey = supabasePublicKey.trim();

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("Supabase URL must use HTTPS.");
    }
  } catch {
    throw new PlatformConfigurationError("VITE_SUPABASE_URL is not a valid HTTPS URL.");
  }

  if (!publicKey) {
    throw new PlatformConfigurationError("VITE_SUPABASE_ANON_KEY is empty.");
  }

  return { url, publicKey };
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, publicKey } = requireConfig();
  const endpoint = `${url}${path}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...init,
      headers: {
        apikey: publicKey,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch (error) {
    let host = "configured Supabase host";
    try {
      host = new URL(url).host;
    } catch {
      // requireConfig already validates this; keep a safe fallback message.
    }

    throw new PlatformNetworkError(
      `Unable to reach Supabase (${host}). Check the public API key, project URL, browser network, and Supabase service status.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
