const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredPublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;
const legacyAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Supabase publishable keys are client-safe identifiers. Keep this project-specific value in one
// platform boundary so business settings and UI never depend on deployment secrets or hardcoded
// contact values. VITE_SUPABASE_PUBLISHABLE_KEY overrides it when configured.
const projectPublishableKey = "sb_publishable_qXOPVaD5_f60qf1UbYrm2A_sH9c0lW5";

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

function resolvePublicKey(): string | undefined {
  return configuredPublishableKey?.trim() || projectPublishableKey || legacyAnonKey?.trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && resolvePublicKey());
}

function requireConfig(): { url: string; publicKey: string } {
  const publicKey = resolvePublicKey();

  if (!supabaseUrl || !publicKey) {
    throw new PlatformConfigurationError(
      "Supabase is not configured. Add VITE_SUPABASE_URL and a publishable key.",
    );
  }

  const url = supabaseUrl.trim().replace(/\/$/, "");

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("Supabase URL must use HTTPS.");
    }
  } catch {
    throw new PlatformConfigurationError("VITE_SUPABASE_URL is not a valid HTTPS URL.");
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
      `Unable to reach Supabase (${host}). Check the project URL, browser network, and Supabase service status.`,
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
