import { readFile } from "node:fs/promises";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`${label} missing: ${needle}`);
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) throw new Error(`${label} must not contain: ${needle}`);
}

const staff = await text("src/routes/staff.tsx");
requireText(staff, 'to="/forgot-password"', "staff recovery link");
requireText(staff, "نسيت كلمة السر؟ / Forgot password?", "bilingual staff recovery link");

const forgot = await text("src/routes/forgot-password.tsx");
for (const needle of [
  'createFileRoute("/forgot-password")',
  'fetch("/api/password-recovery"',
  "إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.",
  'to="/staff"',
]) requireText(forgot, needle, "forgot password page");
forbidText(forgot, "user exists", "account enumeration protection");

const reset = await text("src/routes/reset-password.tsx");
for (const needle of [
  'createFileRoute("/reset-password")',
  'hash.get("access_token")',
  'type !== "recovery"',
  'fetch("/api/password-reset"',
  'window.location.assign("/staff")',
  "Passwords do not match",
  "invalid or expired",
]) requireText(reset, needle, "reset password page");

const server = await text("src/platform/password-recovery.server.ts");
for (const needle of [
  'const RECOVERY_REDIRECT_URL = "https://relaxfixuae.com/reset-password"',
  '"/auth/v1/recover?redirect_to="',
  '"/auth/v1/user"',
  'MAX_ATTEMPTS = 3',
  'WINDOW_MS = 15 * 60 * 1000',
  'createHash("sha256")',
]) requireText(server, needle, "password recovery server flow");
for (const needle of ["SUPABASE_SECRET_KEY", "service_role", "console.log"]) {
  forbidText(server, needle, "password recovery secret isolation");
}

const recoveryRoute = await text("src/routes/api.password-recovery.ts");
for (const needle of [
  'createFileRoute("/api/password-recovery")',
  'code: "RATE_LIMITED"',
  'status: 429',
  '"Cache-Control": "no-store"',
]) requireText(recoveryRoute, needle, "password recovery endpoint");

const resetRoute = await text("src/routes/api.password-reset.ts");
for (const needle of [
  'createFileRoute("/api/password-reset")',
  'code: "RECOVERY_SESSION_INVALID"',
  'code: "PASSWORD_UPDATE_FAILED"',
  'code: "WEAK_OR_INVALID_PASSWORD"',
]) requireText(resetRoute, needle, "password reset endpoint");

console.log("Password recovery contracts verified.");
