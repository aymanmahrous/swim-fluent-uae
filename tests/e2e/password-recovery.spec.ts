import { expect, test } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";

test("forgot password returns a generic success message", async ({ page }) => {
  await page.route("**/api/password-recovery", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.",
      }),
    });
  });
  await page.goto(`${baseURL}/forgot-password`);
  await page.getByLabel(/البريد الإلكتروني|Email/).fill("unknown@example.com");
  await page.getByRole("button", { name: /إرسال رابط الاستعادة|Send recovery link/ }).click();
  await expect(page.getByText("إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.")).toBeVisible();
});

test("valid recovery session updates the password and returns to staff", async ({ page }) => {
  await page.route("**/api/password-reset", async (route) => {
    const payload = route.request().postDataJSON() as { accessToken: string; password: string };
    expect(payload.accessToken).toBe("valid-recovery-token-value");
    expect(payload.password).toBe("StrongPass123");
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await page.goto(`${baseURL}/reset-password#access_token=valid-recovery-token-value&type=recovery`);
  await page.getByLabel(/كلمة المرور الجديدة|New password/).fill("StrongPass123");
  await page.getByLabel(/تأكيد كلمة المرور|Confirm password/).fill("StrongPass123");
  await page.getByRole("button", { name: /تحديث كلمة المرور|Update password/ }).click();
  await expect(page.getByText(/تم تحديث كلمة المرور بنجاح|Password updated successfully/)).toBeVisible();
  await expect(page).toHaveURL(/\/staff$/, { timeout: 5_000 });
});

test("expired recovery link shows a safe error", async ({ page }) => {
  await page.goto(`${baseURL}/reset-password#error=access_denied&error_description=Email%20link%20is%20invalid%20or%20has%20expired`);
  await expect(page.getByText(/الرابط غير صالح أو منتهي|invalid or expired/)).toBeVisible();
  await expect(page.getByRole("link", { name: /طلب رابط جديد|Request a new link/ })).toHaveAttribute("href", "/forgot-password");
});

test("missing session blocks password reset", async ({ page }) => {
  await page.goto(`${baseURL}/reset-password`);
  await expect(page.getByText(/جلسة الاستعادة مفقودة أو غير صالحة|Recovery session is missing or invalid/)).toBeVisible();
});
