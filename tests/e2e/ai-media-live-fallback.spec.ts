import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { z } from "zod";

const CredentialsSchema = z.object({
  users: z
    .array(
      z.object({
        userId: z.string().uuid(),
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .length(2),
});

const ImageResponseSchema = z.object({
  success: z.literal(true),
  mediaAssetId: z.string().uuid(),
  storagePath: z.string().min(1),
  publicUrl: z.string().url(),
  provider: z.enum(["openai-gpt-image", "alibaba-wan-image"]),
  uploadMode: z.enum(["standard", "tus"]),
});

const VideoCreateResponseSchema = z.object({
  success: z.literal(true),
  jobId: z.string().uuid(),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  provider: z.enum(["google-veo", "alibaba-wan-video"]),
  pollAfterSeconds: z.number().int().positive(),
});

const VideoPollResponseSchema = z.object({
  success: z.literal(true),
  jobId: z.string().uuid(),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  publicUrl: z.string().url().optional(),
  storagePath: z.string().optional(),
  error: z.string().nullable().optional(),
});

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const credentialsPath = process.env.E2E_CREDENTIALS_PATH;

if (!baseUrl || !credentialsPath) {
  throw new Error("E2E_BASE_URL_AND_CREDENTIALS_PATH_REQUIRED");
}

type Credentials = z.infer<typeof CredentialsSchema>;
type StaffUser = Credentials["users"][number];

async function readCredentials(): Promise<Credentials> {
  const parsed = CredentialsSchema.safeParse(
    JSON.parse(await readFile(credentialsPath, "utf8")) as unknown,
  );
  if (!parsed.success) throw new Error("AI_MEDIA_E2E_CREDENTIALS_INVALID");
  return parsed.data;
}

async function fillLoginField(
  page: Page,
  label: string,
  fallbackSelector: string,
  value: string,
): Promise<void> {
  const semanticField = page.getByLabel(label);
  if ((await semanticField.count()) > 0) {
    await semanticField.fill(value);
    return;
  }
  await page.locator(fallbackSelector).fill(value);
}

async function login(page: Page, user: StaffUser): Promise<void> {
  await page.goto(`${baseUrl}/staff`, { waitUntil: "domcontentloaded" });
  await fillLoginField(page, "البريد الإلكتروني", 'input[type="email"]', user.email);
  await fillLoginField(page, "كلمة المرور", 'input[type="password"]', user.password);
  await page.getByRole("button", { name: "دخول آمن", exact: true }).click();
  await expect(page.getByRole("link", { name: "AI OS", exact: true })).toBeVisible({
    timeout: 30_000,
  });
}

async function assertMediaResponse(url: string, page: Page, contentTypePrefix: string) {
  const response = await page.request.get(url);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toMatch(
    new RegExp(`^${contentTypePrefix.replace("/", "\\/")}`),
  );
  expect((await response.body()).byteLength).toBeGreaterThan(0);
}

async function assertOwnedImageInLibrary(page: Page, prompt: string): Promise<void> {
  const card = page.locator("article").filter({ hasText: prompt });
  await expect(card).toHaveCount(1);
  await expect(card.locator("img")).toBeVisible();
}

async function assertOwnedVideoInLibrary(page: Page, prompt: string): Promise<void> {
  const card = page.locator("article").filter({ hasText: prompt });
  await expect(card).toHaveCount(1);
  await expect(card.locator("video")).toBeVisible();
}

async function verifyIsolation(browser: Browser, secondary: StaffUser, privatePrompt: string) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await login(page, secondary);
    await page.goto(`${baseUrl}/os/media`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Media Library", exact: true })).toBeVisible();
    await expect(page.getByText(privatePrompt, { exact: true })).toHaveCount(0);
  } finally {
    await context.close();
  }
}

test("live fallback: AI Image and AI Video persist privately and reload from Media Library", async ({
  page,
  browser,
}) => {
  test.setTimeout(25 * 60 * 1000);
  const [primary, secondary] = (await readCredentials()).users;
  const imagePrompt = `Relax Fix UAE live fallback image ${randomUUID()} premium swimmer training in Abu Dhabi, realistic editorial sports photography`;
  const videoPrompt = `Relax Fix UAE live fallback video ${randomUUID()} cinematic swimmer training sequence in a premium Abu Dhabi pool, realistic motion`;

  await login(page, primary);
  await page.goto(`${baseUrl}/os/content`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "AI Content Studio", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Image", exact: true }).click();
  await page.getByLabel("Image prompt").fill(imagePrompt);
  const imageButton = page.getByRole("button", {
    name: "Generate image & save permanently",
    exact: true,
  });
  await expect(imageButton).toBeEnabled({ timeout: 30_000 });

  const imageResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/os-media-generate-image",
    { timeout: 3 * 60 * 1000 },
  );
  await imageButton.click();
  const imageResponse = await imageResponsePromise;
  expect(imageResponse.status()).toBe(201);
  const imageResult = ImageResponseSchema.parse(await imageResponse.json());
  expect(imageResult.storagePath.startsWith(`${primary.userId}/image/`)).toBe(true);

  const generatedImage = page.getByAltText("Generated Relax Fix media", { exact: true });
  await expect(generatedImage).toBeVisible({ timeout: 3 * 60 * 1000 });
  await expect(generatedImage).toHaveAttribute("src", imageResult.publicUrl);
  await assertMediaResponse(imageResult.publicUrl, page, "image/");

  await page.goto(`${baseUrl}/os/media`, { waitUntil: "domcontentloaded" });
  await assertOwnedImageInLibrary(page, imagePrompt);
  await page.reload({ waitUntil: "domcontentloaded" });
  await assertOwnedImageInLibrary(page, imagePrompt);
  await verifyIsolation(browser, secondary, imagePrompt);
  console.log(
    `AI_MEDIA_E2E_IMAGE_LIBRARY_VISIBLE mediaAssetId=${imageResult.mediaAssetId} storagePath=${imageResult.storagePath}`,
  );

  await page.goto(`${baseUrl}/os/content`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Video", exact: true }).click();
  await page.getByLabel("Video prompt").fill(videoPrompt);
  await page.getByLabel("Duration").selectOption("5");

  const observedStatuses = new Set<string>();
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (
      response.request().method() === "GET" &&
      url.pathname === "/api/os-media-generate-video" &&
      response.status() === 200
    ) {
      void response
        .json()
        .then((body: unknown) => {
          const parsed = VideoPollResponseSchema.safeParse(body);
          if (parsed.success) observedStatuses.add(parsed.data.status);
        })
        .catch(() => undefined);
    }
  });

  const videoButton = page.getByRole("button", {
    name: "Generate video & track job",
    exact: true,
  });
  await expect(videoButton).toBeEnabled({ timeout: 30_000 });
  const videoCreatePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/os-media-generate-video",
    { timeout: 3 * 60 * 1000 },
  );
  await videoButton.click();
  const videoCreateResponse = await videoCreatePromise;
  expect(videoCreateResponse.status()).toBe(202);
  const videoCreate = VideoCreateResponseSchema.parse(await videoCreateResponse.json());
  observedStatuses.add(videoCreate.status);

  await expect(page.getByText("Video job: succeeded", { exact: true })).toBeVisible({
    timeout: 20 * 60 * 1000,
  });
  await expect.poll(() => observedStatuses.has("succeeded"), { timeout: 30_000 }).toBe(true);
  expect(observedStatuses.has("queued") || observedStatuses.has("running")).toBe(true);

  const generatedVideo = page.locator("video").first();
  await expect(generatedVideo).toBeVisible();
  const videoUrl = await generatedVideo.getAttribute("src");
  expect(videoUrl).toBeTruthy();
  await assertMediaResponse(videoUrl as string, page, "video/mp4");

  await page.goto(`${baseUrl}/os/media`, { waitUntil: "domcontentloaded" });
  await assertOwnedVideoInLibrary(page, videoPrompt);
  await page.reload({ waitUntil: "domcontentloaded" });
  await assertOwnedVideoInLibrary(page, videoPrompt);
  console.log(`AI_MEDIA_E2E_VIDEO_LIBRARY_VISIBLE jobId=${videoCreate.jobId}`);

  await page.goto(`${baseUrl}/staff`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  await expect(page.getByRole("button", { name: "دخول آمن", exact: true })).toBeVisible();
  await login(page, primary);
  await page.goto(`${baseUrl}/os/media`, { waitUntil: "domcontentloaded" });
  await assertOwnedImageInLibrary(page, imagePrompt);
  await assertOwnedVideoInLibrary(page, videoPrompt);
  console.log("AI_MEDIA_E2E_PERSISTENCE_AFTER_RELOGIN_CONFIRMED");
});
