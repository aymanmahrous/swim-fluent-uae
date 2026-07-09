import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const AUDIENCE = "relax-fix-ai-media-e2e";
const DEPLOYMENT_WAIT_ATTEMPTS = 120;
const DEPLOYMENT_WAIT_MS = 5_000;
const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const adminUrl = process.env.E2E_ADMIN_URL?.replace(/\/$/, "");
const credentialsPath = process.env.E2E_CREDENTIALS_PATH;
const expectedSha = process.env.GITHUB_SHA;
const action = process.argv[2];

if (!baseUrl || !adminUrl || !credentialsPath || !expectedSha) {
  throw new Error("E2E_BASE_URL_ADMIN_URL_CREDENTIALS_PATH_AND_SHA_REQUIRED");
}
if (!/^[0-9a-f]{40}$/.test(expectedSha)) {
  throw new Error("E2E_GITHUB_SHA_INVALID");
}
if (!["wait", "provision", "cleanup"].includes(action)) {
  throw new Error("E2E_ADMIN_ACTION_INVALID");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubOidcToken() {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestUrl || !requestToken) throw new Error("GITHUB_OIDC_ENV_MISSING");

  const url = new URL(requestUrl);
  url.searchParams.set("audience", AUDIENCE);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${requestToken}`, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`GITHUB_OIDC_TOKEN_${response.status}`);
  const body = await response.json();
  if (!body || typeof body.value !== "string" || body.value.length < 20) {
    throw new Error("GITHUB_OIDC_TOKEN_INVALID");
  }
  return body.value;
}

async function oidcCall(url, body) {
  const token = await githubOidcToken();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return {
    response,
    payload: await response.json().catch(() => null),
  };
}

function requireSuccess(result) {
  if (result.response.ok && result.payload?.success) {
    if (result.payload.sha !== undefined && result.payload.sha !== expectedSha) {
      throw new Error("AI_MEDIA_E2E_ADMIN_SHA_MISMATCH");
    }
    return result.payload;
  }
  const code =
    typeof result.payload?.code === "string"
      ? result.payload.code
      : `HTTP_${result.response.status}`;
  throw new Error(`AI_MEDIA_E2E_ADMIN_${code}`);
}

if (action === "wait") {
  const statusUrl = `${baseUrl}/api/internal/ai-media-e2e`;
  for (let attempt = 1; attempt <= DEPLOYMENT_WAIT_ATTEMPTS; attempt += 1) {
    const result = await oidcCall(statusUrl, { action: "status" });
    if (result.response.status === 200 && result.payload?.success && result.payload?.ready) {
      if (result.payload.sha !== expectedSha) {
        throw new Error("AI_MEDIA_E2E_DEPLOYMENT_SHA_MISMATCH");
      }
      console.log(`Matching production deployment is ready after ${attempt} probe(s).`);
      process.exit(0);
    }
    if (result.response.status === 401) {
      throw new Error("AI_MEDIA_E2E_ADMIN_UNAUTHORIZED");
    }

    const code =
      typeof result.payload?.code === "string"
        ? result.payload.code
        : `HTTP_${result.response.status}`;
    if (code !== "DEPLOYMENT_NOT_READY" && result.response.status !== 404) {
      console.log(`Deployment probe ${attempt}: ${code}`);
    }
    await sleep(DEPLOYMENT_WAIT_MS);
  }
  throw new Error("AI_MEDIA_E2E_DEPLOYMENT_TIMEOUT");
}

if (action === "provision") {
  const payload = requireSuccess(await oidcCall(adminUrl, { action: "provision" }));
  if (!Array.isArray(payload.users) || payload.users.length !== 2) {
    throw new Error("AI_MEDIA_E2E_USERS_INVALID");
  }
  for (const user of payload.users) {
    if (
      !user ||
      typeof user.email !== "string" ||
      typeof user.password !== "string" ||
      typeof user.userId !== "string"
    ) {
      throw new Error("AI_MEDIA_E2E_USER_INVALID");
    }
    console.log(`::add-mask::${user.email}`);
    console.log(`::add-mask::${user.password}`);
  }
  await mkdir(dirname(credentialsPath), { recursive: true });
  await writeFile(credentialsPath, JSON.stringify({ users: payload.users }), { mode: 0o600 });
  console.log("Temporary AI media E2E staff users provisioned through the Supabase Edge admin.");
} else if (action === "cleanup") {
  let credentials;
  try {
    credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.log("No E2E credentials file exists; cleanup is not required.");
      process.exit(0);
    }
    throw error;
  }

  const userIds = Array.isArray(credentials.users)
    ? credentials.users.map((user) => user?.userId).filter((value) => typeof value === "string")
    : [];
  if (userIds.length > 0) {
    requireSuccess(await oidcCall(adminUrl, { action: "cleanup", userIds }));
  }
  await rm(credentialsPath, { force: true });
  console.log(`Temporary AI media E2E resources cleaned (${userIds.length} users).`);
}
