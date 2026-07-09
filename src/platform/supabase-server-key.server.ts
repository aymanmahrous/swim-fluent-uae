import { z } from "zod";

const LegacyServiceRolePayloadSchema = z.object({
  role: z.literal("service_role"),
  exp: z.number().int().positive().optional(),
});

type SupabaseServerKey = {
  value: string;
  kind: "modern_secret" | "legacy_service_role";
};

function configuredKeyValue(): string | null {
  const value = process.env.SUPABASE_SECRET_KEY?.trim();
  return value || null;
}

function parseLegacyServiceRoleJwt(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 3 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) {
    return false;
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const parsed = LegacyServiceRolePayloadSchema.safeParse(payload);
    if (!parsed.success) return false;
    if (parsed.data.exp && parsed.data.exp <= Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseServerKey(): SupabaseServerKey | null {
  const value = configuredKeyValue();
  if (!value) return null;

  if (/^sb_secret_[A-Za-z0-9_-]{16,}$/.test(value)) {
    return { value, kind: "modern_secret" };
  }

  if (parseLegacyServiceRoleJwt(value)) {
    return { value, kind: "legacy_service_role" };
  }

  throw new Error("SUPABASE_SECRET_KEY_FORMAT_INVALID");
}

export function isSupabaseServerKeyConfigured(): boolean {
  try {
    return Boolean(getSupabaseServerKey());
  } catch {
    return false;
  }
}

export function supabaseServerKeyHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  const key = getSupabaseServerKey();
  if (!key) throw new Error("SUPABASE_SECRET_NOT_CONFIGURED");

  return {
    apikey: key.value,
    ...(key.kind === "legacy_service_role"
      ? { Authorization: `Bearer ${key.value}` }
      : {}),
    ...extra,
  };
}
