import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Relax Fix UAE" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const token = hash.get("access_token");
    const type = hash.get("type");
    const providerError = hash.get("error_description") ?? query.get("error_description");
    if (providerError) {
      setSessionError("الرابط غير صالح أو منتهي. / The recovery link is invalid or expired.");
      return;
    }
    if (!token || type !== "recovery") {
      setSessionError("جلسة الاستعادة مفقودة أو غير صالحة. / Recovery session is missing or invalid.");
      return;
    }
    setAccessToken(token);
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const passwordStrong = useMemo(
    () => password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password),
    [password],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!accessToken) {
      setError("جلسة الاستعادة غير صالحة. / Invalid recovery session.");
      return;
    }
    if (!passwordStrong) {
      setError("استخدم 10 أحرف على الأقل مع حرف كبير وصغير ورقم. / Use at least 10 characters with upper, lower and a number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين. / Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const payload = (await response.json().catch(() => null)) as { code?: string } | null;
      if (!response.ok) {
        if (response.status === 401 || payload?.code === "RECOVERY_SESSION_INVALID") {
          setError("الرابط منتهي أو غير صالح. اطلب رابطًا جديدًا. / Link expired or invalid. Request a new one.");
        } else if (payload?.code === "WEAK_OR_INVALID_PASSWORD") {
          setError("كلمة المرور لا تحقق متطلبات الأمان. / Password does not meet security requirements.");
        } else {
          setError("تعذر تحديث كلمة المرور. حاول لاحقًا. / Password update failed. Try again later.");
        }
        return;
      }
      setComplete(true);
      setAccessToken(null);
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => window.location.assign("/staff"), 2500);
    } catch {
      setError("تعذر تحديث كلمة المرور. حاول لاحقًا. / Password update failed. Try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-muted/45 px-6 py-20" dir="auto">
      <section className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-7 shadow-elegant sm:p-9">
        <h1 className="text-3xl font-black">تعيين كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm font-bold text-muted-foreground">Set a new password</p>
        {sessionError ? (
          <div className="mt-8 space-y-5">
            <p className="rounded-2xl bg-destructive/10 p-4 text-destructive">{sessionError}</p>
            <Link to="/forgot-password" className="font-black text-primary">
              طلب رابط جديد / Request a new link
            </Link>
          </div>
        ) : complete ? (
          <div className="mt-8 space-y-5">
            <p className="rounded-2xl bg-primary/10 p-4">
              تم تحديث كلمة المرور بنجاح. / Password updated successfully.
            </p>
            <Link to="/staff" className="font-black text-primary">
              العودة إلى تسجيل الدخول / Return to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-black">كلمة المرور الجديدة / New password</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3.5" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-black">تأكيد كلمة المرور / Confirm password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3.5" />
            </div>
            {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={submitting || !accessToken} className="w-full rounded-2xl bg-deep px-5 py-3.5 font-black text-white disabled:opacity-50">
              {submitting ? "جارٍ التحديث... / Updating..." : "تحديث كلمة المرور / Update password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
