import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Relax Fix UAE" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setRateLimited(false);
    try {
      const response = await fetch("/api/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.status === 429) setRateLimited(true);
      setComplete(true);
    } catch {
      setComplete(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-muted/45 px-6 py-20" dir="auto">
      <section className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-7 shadow-elegant sm:p-9">
        <h1 className="text-3xl font-black">نسيت كلمة السر؟</h1>
        <p className="mt-2 text-sm font-bold text-muted-foreground">Forgot password?</p>
        {complete ? (
          <div className="mt-8 space-y-5">
            <p className="rounded-2xl bg-primary/10 p-4 leading-7">
              إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.
              <span className="mt-2 block text-sm">If the account exists, a recovery email will be sent.</span>
            </p>
            {rateLimited && (
              <p className="text-sm text-muted-foreground">
                محاولات كثيرة. حاول لاحقًا. / Too many attempts. Try again later.
              </p>
            )}
            <Link to="/staff" className="inline-flex font-black text-primary">
              العودة إلى تسجيل الدخول / Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="recovery-email" className="mb-2 block text-sm font-black">
                البريد الإلكتروني / Email
              </label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-deep px-5 py-3.5 font-black text-white disabled:opacity-50"
            >
              {submitting ? "جارٍ الإرسال... / Sending..." : "إرسال رابط الاستعادة / Send recovery link"}
            </button>
            <Link to="/staff" className="block text-center text-sm font-black text-primary">
              العودة / Back
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
