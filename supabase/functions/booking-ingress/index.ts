import { createRemoteJWKSet, decodeJwt, jwtVerify } from "npm:jose@6";
import { z } from "npm:zod@3.24.2";

const VERCEL_TEAM_SLUG = "swimmingayman-8492s-projects";
const VERCEL_PROJECT_ID = "prj_HrvwRKrf0NueBmwjX18ARNRef9Fy";
const VERCEL_PROJECT_NAME = "swim-fluent-uae";
const EXPECTED_AUDIENCE = `https://vercel.com/${VERCEL_TEAM_SLUG}`;
const EXPECTED_SUBJECT =
  `owner:${VERCEL_TEAM_SLUG}:project:${VERCEL_PROJECT_NAME}:environment:production`;
const ALLOWED_ISSUERS = new Set([
  "https://oidc.vercel.com",
  `https://oidc.vercel.com/${VERCEL_TEAM_SLUG}`,
]);
const JWKS = createRemoteJWKSet(new URL("https://oidc.vercel.com/.well-known/jwks"));

const BookingIngressSchema = z.object({
  p_full_name: z.string().trim().min(2).max(120),
  p_phone: z.string().trim().min(7).max(40),
  p_gender: z.string().trim().min(1).max(40),
  p_category: z.string().trim().min(1).max(80),
  p_location: z.string().trim().min(1).max(120),
  p_other_location: z.string().trim().max(180).nullable().optional(),
  p_swam_before: z.boolean(),
  p_fear_of_water: z.boolean(),
  p_training_type: z.string().trim().min(1).max(80),
  p_requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  p_requested_time: z.string().regex(/^\d{2}:\d{2}(?::\d{2})?$/),
  p_terms_accepted: z.boolean(),
  p_idempotency_key: z.string().uuid(),
  _client_fingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  _honeypot: z.string().max(500).default(""),
  _form_elapsed_ms: z.number().int().min(0).max(86_400_000),
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function verifyVercelOidc(req: Request): Promise<boolean> {
  const authorization = req.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return false;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return false;

  try {
    const decoded = decodeJwt(token);
    const issuer = typeof decoded.iss === "string" ? decoded.iss : "";
    if (!ALLOWED_ISSUERS.has(issuer)) return false;

    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience: EXPECTED_AUDIENCE,
      subject: EXPECTED_SUBJECT,
    });

    return (
      payload.project_id === VERCEL_PROJECT_ID &&
      payload.project === VERCEL_PROJECT_NAME &&
      payload.environment === "production"
    );
  } catch {
    return false;
  }
}

function defaultSecretKey(): string | null {
  try {
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<
      string,
      unknown
    >;
    const key = secretKeys.default;
    return typeof key === "string" && key.startsWith("sb_secret_") ? key : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (!(await verifyVercelOidc(req))) {
    return json({ success: false, code: "UNAUTHORIZED" }, 401);
  }

  if (req.method !== "POST") {
    return json({ success: false, code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return json({ success: false, code: "INVALID_INPUT" }, 413);
  }

  const body = BookingIngressSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return json(
      {
        success: false,
        code: "INVALID_INPUT",
        message: "Invalid booking request.",
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const secretKey = defaultSecretKey();
  if (!supabaseUrl || !secretKey) {
    return json({ success: false, code: "INGRESS_UNAVAILABLE" }, 503);
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_booking_request_ingress`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      p_full_name: body.data.p_full_name,
      p_phone: body.data.p_phone,
      p_gender: body.data.p_gender,
      p_category: body.data.p_category,
      p_location: body.data.p_location,
      p_other_location: body.data.p_other_location ?? null,
      p_swam_before: body.data.p_swam_before,
      p_fear_of_water: body.data.p_fear_of_water,
      p_training_type: body.data.p_training_type,
      p_requested_date: body.data.p_requested_date,
      p_requested_time: body.data.p_requested_time,
      p_terms_accepted: body.data.p_terms_accepted,
      p_idempotency_key: body.data.p_idempotency_key,
      p_client_fingerprint: body.data._client_fingerprint,
      p_honeypot: body.data._honeypot,
      p_form_elapsed_ms: body.data._form_elapsed_ms,
    }),
  });

  const responseBody = await response.text();
  return new Response(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
});
