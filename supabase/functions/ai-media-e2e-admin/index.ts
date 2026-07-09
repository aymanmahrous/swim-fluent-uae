const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_JWKS_URL = `${OIDC_ISSUER}/.well-known/jwks`;
const OIDC_AUDIENCE = "relax-fix-ai-media-e2e";
const EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae";
const EXPECTED_REF = "refs/heads/main";
const EXPECTED_SUBJECT = `repo:${EXPECTED_REPOSITORY}:ref:${EXPECTED_REF}`;
const E2E_PURPOSE = "relax-fix-ai-media-e2e";
const MEDIA_BUCKET = "relax-fix-media";

type JsonObject = Record<string, unknown>;
type GithubOidcClaims = {
  iss: string;
  aud: string | string[];
  exp: number;
  iat?: number;
  nbf?: number;
  repository: string;
  event_name: string;
  ref: string;
  sha: string;
  sub: string;
};
type GithubJwk = JsonWebKey & { kid: string; alg?: string };
type TemporaryStaff = { userId: string; email: string; password: string };

type AdminUser = {
  id: string;
  email?: string | null;
  user_metadata?: JsonObject;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
    },
  });
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function base64UrlBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJsonSegment(segment: string): unknown {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(segment)));
}

function parseClaims(value: unknown): GithubOidcClaims | null {
  if (!isObject(value)) return null;
  const aud = value.aud;
  const validAudience =
    typeof aud === "string" ||
    (Array.isArray(aud) && aud.every((entry) => typeof entry === "string"));
  if (
    value.iss !== OIDC_ISSUER ||
    !validAudience ||
    typeof value.exp !== "number" ||
    (value.iat !== undefined && typeof value.iat !== "number") ||
    (value.nbf !== undefined && typeof value.nbf !== "number") ||
    value.repository !== EXPECTED_REPOSITORY ||
    value.event_name !== "push" ||
    value.ref !== EXPECTED_REF ||
    typeof value.sha !== "string" ||
    !/^[0-9a-f]{40}$/.test(value.sha) ||
    value.sub !== EXPECTED_SUBJECT
  ) {
    return null;
  }
  return value as unknown as GithubOidcClaims;
}

function audienceMatches(audience: string | string[]): boolean {
  return Array.isArray(audience)
    ? audience.includes(OIDC_AUDIENCE)
    : audience === OIDC_AUDIENCE;
}

async function verifyGithubActionsOidc(request: Request): Promise<GithubOidcClaims | null> {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return null;
    const token = authorization.slice("Bearer ".length).trim();
    const segments = token.split(".");
    if (segments.length !== 3 || segments.some((segment) => segment.length === 0)) return null;

    const [headerSegment, claimsSegment, signatureSegment] = segments;
    const header = decodeJsonSegment(headerSegment);
    const claims = parseClaims(decodeJsonSegment(claimsSegment));
    if (!isObject(header) || header.alg !== "RS256" || typeof header.kid !== "string") return null;
    if (!claims || !audienceMatches(claims.aud)) return null;

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp <= now) return null;
    if (claims.iat !== undefined && claims.iat > now + 60) return null;
    if (claims.nbf !== undefined && claims.nbf > now + 60) return null;

    const jwksResponse = await fetch(OIDC_JWKS_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!jwksResponse.ok) return null;
    const jwks: unknown = await jwksResponse.json().catch(() => null);
    if (!isObject(jwks) || !Array.isArray(jwks.keys)) return null;
    const key = jwks.keys.find(
      (candidate): candidate is GithubJwk =>
        isObject(candidate) &&
        candidate.kty === "RSA" &&
        candidate.kid === header.kid &&
        typeof candidate.n === "string" &&
        typeof candidate.e === "string" &&
        (candidate.alg === undefined || candidate.alg === "RS256"),
    );
    if (!key) return null;

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: key.n, e: key.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      base64UrlBytes(signatureSegment),
      new TextEncoder().encode(`${headerSegment}.${claimsSegment}`),
    );
    return valid ? claims : null;
  } catch {
    return null;
  }
}

function supabaseUrl(): string {
  const value = Deno.env.get("SUPABASE_URL")?.trim();
  if (!value) throw new Error("SUPABASE_URL_NOT_CONFIGURED");
  return value.replace(/\/$/, "");
}

function secretKey(): string {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (modern) {
    const parsed: unknown = JSON.parse(modern);
    if (isObject(parsed) && typeof parsed.default === "string" && parsed.default.length > 0) {
      return parsed.default;
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (legacy) return legacy;
  throw new Error("SUPABASE_SECRET_NOT_CONFIGURED");
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const key = secretKey();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  if (key.split(".").length === 3) {
    headers.set("Authorization", `Bearer ${key}`);
  }
  headers.set("Accept", "application/json");
  headers.set("Cache-Control", "no-store");
  headers.set("User-Agent", "relax-fix-ai-media-e2e-edge/1.0");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${supabaseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

async function requireOk(response: Response, code: string): Promise<void> {
  if (response.ok) return;
  throw new Error(`${code}_${response.status}`);
}

function generatedPassword(): string {
  return `${crypto.randomUUID()}Aa1!${crypto.randomUUID()}`;
}

function parseAdminUser(value: unknown): AdminUser | null {
  if (!isObject(value) || !isUuid(value.id)) return null;
  if (value.email !== undefined && value.email !== null && typeof value.email !== "string") return null;
  if (value.user_metadata !== undefined && !isObject(value.user_metadata)) return null;
  return {
    id: value.id,
    email: typeof value.email === "string" ? value.email : null,
    user_metadata: isObject(value.user_metadata) ? value.user_metadata : {},
  };
}

async function readAdminUser(userId: string): Promise<AdminUser | null> {
  const response = await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`);
  if (response.status === 404) return null;
  await requireOk(response, "E2E_AUTH_USER_READ");
  const user = parseAdminUser(await response.json().catch(() => null));
  if (!user) throw new Error("E2E_AUTH_USER_INVALID");
  return user;
}

async function deleteAuthUser(userId: string): Promise<void> {
  const response = await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (response.ok || response.status === 404) return;
  throw new Error(`E2E_AUTH_USER_DELETE_${response.status}`);
}

async function provisionTemporaryStaff(label: string): Promise<TemporaryStaff> {
  const email = `rf-e2e-${crypto.randomUUID()}@example.com`;
  const password = generatedPassword();
  const userResponse = await adminFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { purpose: E2E_PURPOSE, label },
    }),
  });
  const user = parseAdminUser(await userResponse.json().catch(() => null));
  if (!userResponse.ok || !user) {
    throw new Error(`E2E_AUTH_USER_CREATE_${userResponse.status}`);
  }

  const profileResponse = await adminFetch("/rest/v1/staff_profiles", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      id: user.id,
      display_name: `AI Media E2E ${label}`,
      role: "content_manager",
      active: true,
    }),
  });
  if (!profileResponse.ok) {
    await deleteAuthUser(user.id).catch(() => undefined);
    throw new Error(`E2E_STAFF_PROFILE_CREATE_${profileResponse.status}`);
  }

  return { userId: user.id, email, password };
}

function parseOwnedRows(value: unknown): Array<{ id: string; storage_path: string | null }> | null {
  if (!Array.isArray(value)) return null;
  const rows: Array<{ id: string; storage_path: string | null }> = [];
  for (const item of value) {
    if (!isObject(item) || !isUuid(item.id)) return null;
    if (item.storage_path !== null && typeof item.storage_path !== "string") return null;
    rows.push({ id: item.id, storage_path: item.storage_path as string | null });
  }
  return rows;
}

async function readOwnedStoragePaths(userId: string): Promise<string[]> {
  const encoded = encodeURIComponent(userId);
  const [mediaResponse, jobsResponse] = await Promise.all([
    adminFetch(`/rest/v1/media_assets?select=id,storage_path&created_by=eq.${encoded}`),
    adminFetch(`/rest/v1/ai_media_jobs?select=id,storage_path&requested_by=eq.${encoded}`),
  ]);
  await requireOk(mediaResponse, "E2E_MEDIA_READ");
  await requireOk(jobsResponse, "E2E_VIDEO_JOBS_READ");

  const media = parseOwnedRows(await mediaResponse.json().catch(() => null));
  const jobs = parseOwnedRows(await jobsResponse.json().catch(() => null));
  if (!media || !jobs) throw new Error("E2E_CLEANUP_ROWS_INVALID");
  return Array.from(
    new Set(
      [...media, ...jobs]
        .map((row) => row.storage_path)
        .filter((path): path is string => typeof path === "string" && path.length > 0),
    ),
  );
}

async function deleteStorageObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const response = await adminFetch(`/storage/v1/object/${MEDIA_BUCKET}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: paths }),
  });
  await requireOk(response, "E2E_STORAGE_DELETE");
}

async function deleteRows(table: string, column: string, userId: string): Promise<void> {
  const response = await adminFetch(
    `/rest/v1/${table}?${column}=eq.${encodeURIComponent(userId)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  );
  await requireOk(response, `E2E_${table.toUpperCase()}_DELETE`);
}

async function cleanupTemporaryStaff(userId: string): Promise<void> {
  const user = await readAdminUser(userId);
  if (!user) return;
  if (user.user_metadata?.purpose !== E2E_PURPOSE) {
    throw new Error("E2E_CLEANUP_USER_NOT_TAGGED");
  }

  const paths = await readOwnedStoragePaths(userId);
  await deleteStorageObjects(paths);
  await deleteRows("media_assets", "created_by", userId);
  await deleteRows("ai_media_jobs", "requested_by", userId);
  await deleteRows("audit_logs", "actor_id", userId);
  await deleteRows("staff_profiles", "id", userId);
  await deleteAuthUser(userId);
}

function safeCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "AI_MEDIA_E2E_FAILED";
  return message.split(":")[0].replace(/[^A-Z0-9_]/gi, "_").slice(0, 100);
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ success: false, code: "METHOD_NOT_ALLOWED" }, 405);
  const oidc = await verifyGithubActionsOidc(request);
  if (!oidc) return json({ success: false, code: "UNAUTHORIZED" }, 401);

  const body: unknown = await request.json().catch(() => null);
  if (!isObject(body) || typeof body.action !== "string") {
    return json({ success: false, code: "INVALID_INPUT" }, 400);
  }

  try {
    if (body.action === "provision") {
      const primary = await provisionTemporaryStaff("primary");
      try {
        const secondary = await provisionTemporaryStaff("secondary");
        return json({ success: true, sha: oidc.sha, users: [primary, secondary] });
      } catch (error) {
        await cleanupTemporaryStaff(primary.userId).catch(() => undefined);
        throw error;
      }
    }

    if (body.action === "cleanup") {
      if (
        !Array.isArray(body.userIds) ||
        body.userIds.length < 1 ||
        body.userIds.length > 4 ||
        !body.userIds.every(isUuid)
      ) {
        return json({ success: false, code: "INVALID_INPUT" }, 400);
      }
      const userIds = body.userIds as string[];
      const results = await Promise.allSettled(userIds.map(cleanupTemporaryStaff));
      const failures = results.filter((result) => result.status === "rejected").length;
      if (failures > 0) return json({ success: false, code: "E2E_CLEANUP_FAILED", failures }, 500);
      return json({ success: true, sha: oidc.sha, cleaned: userIds.length });
    }

    return json({ success: false, code: "INVALID_INPUT" }, 400);
  } catch (error) {
    return json({ success: false, code: safeCode(error) }, 500);
  }
});
