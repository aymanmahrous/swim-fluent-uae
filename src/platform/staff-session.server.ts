import { z } from "zod";
import {
  supabaseProjectUrl,
  supabasePublicHeaders,
} from "./supabase-project.server";

const AuthTokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  user: z.object({ id: z.string().uuid(), email: z.string().email().nullable() }),
});

const StaffProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string(),
  role: z.enum(["super_admin", "admin", "reception", "coach", "content_manager"]),
  active: z.literal(true),
});

export type StaffProfile = z.infer<typeof StaffProfileSchema>;

type StaffAuth = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  profile: StaffProfile;
};

const accessCookie = "rf_staff_access";
const refreshCookie = "rf_staff_refresh";

function parseCookies(request: Request): Record<string, string> {
  return Object.fromEntries(
    (request.headers.get("cookie") ?? "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const index = entry.indexOf("=");
        return index < 0
          ? [entry, ""]
          : [entry.slice(0, index), decodeURIComponent(entry.slice(index + 1))];
      }),
  );
}

function cookie(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function sessionCookieHeaders(auth: StaffAuth): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  headers.append(
    "Set-Cookie",
    cookie(accessCookie, auth.accessToken, Math.max(60, auth.expiresIn - 30)),
  );
  if (auth.refreshToken) {
    headers.append("Set-Cookie", cookie(refreshCookie, auth.refreshToken, 60 * 60 * 24 * 30));
  }
  return headers;
}

export function clearSessionCookieHeaders(): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  headers.append("Set-Cookie", cookie(accessCookie, "", 0));
  headers.append("Set-Cookie", cookie(refreshCookie, "", 0));
  return headers;
}

async function getStaffProfile(accessToken: string, userId: string): Promise<StaffProfile | null> {
  const response = await fetch(
    `${supabaseProjectUrl}/rest/v1/staff_profiles?select=id,display_name,role,active&id=eq.${encodeURIComponent(userId)}&limit=1`,
    {
      headers: {
        ...supabasePublicHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) return null;
  const parsed = z.array(StaffProfileSchema).safeParse(await response.json());
  return parsed.success && parsed.data.length === 1 ? parsed.data[0] : null;
}

async function exchangeToken(
  payload: Record<string, string>,
  grant: "password" | "refresh_token",
): Promise<StaffAuth | null> {
  const response = await fetch(`${supabaseProjectUrl}/auth/v1/token?grant_type=${grant}`, {
    method: "POST",
    headers: {
      ...supabasePublicHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return null;
  const parsed = AuthTokenSchema.safeParse(await response.json());
  if (!parsed.success) return null;
  const profile = await getStaffProfile(parsed.data.access_token, parsed.data.user.id);
  if (!profile) return null;
  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    expiresIn: parsed.data.expires_in,
    profile,
  };
}

export async function signInStaff(email: string, password: string): Promise<StaffAuth | null> {
  return exchangeToken({ email, password }, "password");
}

export async function resolveStaffSession(request: Request): Promise<StaffAuth | null> {
  const cookies = parseCookies(request);
  const accessToken = cookies[accessCookie];
  const refreshToken = cookies[refreshCookie];

  if (accessToken) {
    const userResponse = await fetch(`${supabaseProjectUrl}/auth/v1/user`, {
      headers: {
        ...supabasePublicHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (userResponse.ok) {
      const user = z.object({ id: z.string().uuid() }).safeParse(await userResponse.json());
      if (user.success) {
        const profile = await getStaffProfile(accessToken, user.data.id);
        if (profile) {
          return {
            accessToken,
            refreshToken: refreshToken ?? "",
            expiresIn: 300,
            profile,
          };
        }
      }
    }
  }

  if (!refreshToken) return null;
  return exchangeToken({ refresh_token: refreshToken }, "refresh_token");
}

export async function revokeStaffSession(request: Request): Promise<void> {
  const cookies = parseCookies(request);
  const accessToken = cookies[accessCookie];
  if (!accessToken) return;

  await fetch(`${supabaseProjectUrl}/auth/v1/logout`, {
    method: "POST",
    headers: {
      ...supabasePublicHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => undefined);
}

export async function staffRpc(
  accessToken: string,
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<Response> {
  return fetch(`${supabaseProjectUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      ...supabasePublicHeaders(),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
