import { z } from "zod";

const OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const OIDC_JWKS_URL = `${OIDC_ISSUER}/.well-known/jwks`;
export const AI_MEDIA_E2E_AUDIENCE = "relax-fix-ai-media-e2e";
const EXPECTED_REPOSITORY = "aymanmahrous/swim-fluent-uae";
const EXPECTED_REF = "refs/heads/main";
const EXPECTED_SUBJECT = `repo:${EXPECTED_REPOSITORY}:ref:${EXPECTED_REF}`;
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
  event_name: z.literal("push"),
  ref: z.literal(EXPECTED_REF),
  sha: z.string().regex(/^[0-9a-f]{40}$/),
  sub: z.literal(EXPECTED_SUBJECT),
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
export type GithubActionsOidcContext = {
  eventName: "push";
  ref: typeof EXPECTED_REF;
  sha: string;
};

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

export async function verifyGithubActionsOidc(
  request: Request,
): Promise<GithubActionsOidcContext | null> {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) return null;
    const token = authorization.slice("Bearer ".length).trim();
    const segments = token.split(".");
    if (segments.length !== 3 || segments.some((segment) => segment.length < 1)) return null;

    const [headerSegment, claimsSegment, signatureSegment] = segments;
    const header = HeaderSchema.safeParse(decodeJson(headerSegment));
    const claims = ClaimsSchema.safeParse(decodeJson(claimsSegment));
    if (!header.success || !claims.success || !audienceMatches(claims.data.aud)) return null;

    const now = Math.floor(Date.now() / 1000);
    if (claims.data.exp <= now) return null;
    if (claims.data.iat && claims.data.iat > now + 60) return null;
    if (claims.data.nbf && claims.data.nbf > now + 60) return null;

    const key = (await githubOidcKeys()).find(
      (candidate) =>
        candidate.kid === header.data.kid &&
        (!candidate.alg || candidate.alg === header.data.alg),
    );
    if (!key) return null;

    const valid = await verifySignature(
      `${headerSegment}.${claimsSegment}`,
      signatureSegment,
      key,
    );
    if (!valid) return null;

    return {
      eventName: claims.data.event_name,
      ref: claims.data.ref,
      sha: claims.data.sha,
    };
  } catch {
    return null;
  }
}
