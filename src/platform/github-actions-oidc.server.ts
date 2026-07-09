import { z } from "zod";

const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_JWKS_URL = `${OIDC_ISSUER}/.well-known/jwks`;
export const AI_MEDIA_E2E_AUDIENCE = "relax-fix-ai-media-e2e";
const EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae";
const EXPECTED_REF = "refs/pull/9/merge";
const JWKS_CACHE_MS = 5 * 60 * 1000;

const HeaderSchema = z.object({
  alg: z.literal("RS256"),
  kid: z.string().min(1),
});

const ClaimsSchema = z.object({
  iss: z.literal(OIDC_ISSUER),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number().int(),
  iat: z.number().int().optional(),
  nbf: z.number().int().optional(),
  repository: z.literal(EXPECTED_REPOSITORY),
  event_name: z.literal("pull_request"),
  ref: z.literal(EXPECTED_REF),
  sub: z.string().min(1),
});

const JwksSchema = z.object({
  keys: z.array(
    z.object({
      kty: z.literal("RSA"),
      kid: z.string().min(1),
      n: z.string().min(1),
      e: z.string().min(1),
      alg: z.string().optional(),
    }),
  ),
});

type Jwk = z.infer<typeof JwksSchema>["keys"][number];

let cachedKeys: { fetchedAt: number; keys: Jwk[] } | null = null;

function decodeJson(segment: string): unknown {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

function audienceMatches(aud: string | string[]): boolean {
  return Array.isArray(aud)
    ? aud.includes(AI_MEDIA_E2E_AUDIENCE)
    : aud === AI_MEDIA_E2E_AUDIENCE;
}

async function githubOidcKeys(): Promise<Jwk[]> {
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < JWKS_CACHE_MS) {
    return cachedKeys.keys;
  }

  const response = await fetch(OIDC_JWKS_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GITHUB_OIDC_JWKS_${response.status}`);
  const parsed = JwksSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new Error("GITHUB_OIDC_JWKS_INVALID");
  cachedKeys = { fetchedAt: Date.now(), keys: parsed.data.keys };
  return parsed.data.keys;
}

async function verifySignature(
  signingInput: string,
  signatureSegment: string,
  key: Jwk,
): Promise<boolean> {
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: key.kty,
      n: key.n,
      e: key.e,
      alg: "RS256",
      ext: true,
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signatureSegment, "base64url"),
    new TextEncoder().encode(signingInput),
  );
}

export async function verifyGithubActionsOidc(request: Request): Promise<boolean> {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return false;
    const token = authorization.slice("Bearer ".length).trim();
    const segments = token.split(".");
    if (segments.length !== 3 || segments.some((segment) => segment.length < 1)) return false;

    const [headerSegment, claimsSegment, signatureSegment] = segments;
    const header = HeaderSchema.safeParse(decodeJson(headerSegment));
    const claims = ClaimsSchema.safeParse(decodeJson(claimsSegment));
    if (!header.success || !claims.success || !audienceMatches(claims.data.aud)) return false;

    const now = Math.floor(Date.now() / 1000);
    if (claims.data.exp <= now) return false;
    if (claims.data.iat && claims.data.iat > now + 60) return false;
    if (claims.data.nbf && claims.data.nbf > now + 60) return false;
    if (claims.data.sub !== `repo:${EXPECTED_REPOSITORY}:pull_request`) return false;

    const key = (await githubOidcKeys()).find(
      (candidate) =>
        candidate.kid === header.data.kid &&
        (!candidate.alg || candidate.alg === header.data.alg),
    );
    if (!key) return false;

    return verifySignature(
      `${headerSegment}.${claimsSegment}`,
      signatureSegment,
      key,
    );
  } catch {
    return false;
  }
}
