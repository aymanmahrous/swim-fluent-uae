import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const AUDIENCE = "relax-fix-ai-media-e2e";
const DEPLOYMENT_WAIT_ATTEMPTS = 120;
const DEPLOYMENT_WAIT_MS = 5_000;
const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const credentialsPath = process.env.E2E_CREDENTIALS_PATH;
const action = process.argv[2];

if (!baseUrl || !credentialsPath) {
  throw new Error("E2E_BASE_URL_AND_CREDENTIALS_PATH_REQUIRED");
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

async function e2eCall(body) {
  const token = await githubOidcToken();
  const response = await fetch(`${baseUrl}/api/internal/ai-media-e2e`, {
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
  if (result.response.ok && result.payload?.success) return result.payload;
  const code =
    typeof result.payload?.code === "string"
      ? result.payload.code
      : `HTTP_${result.response.status}`;
  throw new Error(`AI_MEDIA_E2E_ADMIN_${code}`);
}

if (action === "wait") {
  for (let attempt = 1; attempt <= DEPLOYMENT_WAIT_ATTEMPTS; attempt += 1) {
    const result = await e2eCall({ action: "status" });
    if (result.response.status === 200 && result.payload?.success && result.payload?.ready) {
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
  const payload = requireSuccess(await e2eCall({ action: "provision" }));
  if (!Array.isArray(payload.users) || payload.users.length !== 2) {
    throw new Error("AI_MEDIA_E2E_USERS_INVALID");
  }
  for (const user of payload.users) {
    if (!user || typeof user.password !== "string" || typeof user.userId !== "string") {
      throw new Error("AI_MEDIA_E2E_USER_INVALID");
    }
    console.log(`::add-mask::${user.password}`);
  }
  await mkdir(dirname(credentialsPath), { recursive: true });
  await writeFile(credentialsPath, JSON.stringify({ users: payload.users }), { mode: 0o600 });
  console.log("Temporary AI media E2E staff users provisioned.");
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
    requireSuccess(await e2eCall({ action: "cleanup", userIds }));
  }
  await rm(credentialsPath, { force: true });
  console.log(`Temporary AI media E2E resources cleaned (${userIds.length} users).`);
}
