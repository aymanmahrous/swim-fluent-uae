import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/reset")({
  component: StaffResetPage,
});

function StaffResetPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      toast.error("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/staff-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error();
      toast.success("تم تغيير كلمة المرور بنجاح.");
    } catch {
      toast.error("الرابط غير صالح أو انتهت صلاحيته.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[75vh] bg-muted/45 px-6 py-20">
      <form onSubmit={savePassword} className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-elegant">
        <h1 className="text-2xl font-black">تغيير كلمة مرور الموظف</h1>
        <p className="mt-3 text-sm text-muted-foreground">أنشئ كلمة مرور جديدة لحساب Relax Fix.</p>
        <input className="mt-6 w-full rounded-xl border p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور الجديدة" />
        <input className="mt-3 w-full rounded-xl border p-3" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="تأكيد كلمة المرور" />
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-deep p-3 font-black text-white">{loading ? "جارٍ الحفظ" : "حفظ كلمة المرور"}</button>
        <Link className="mt-4 block text-center text-sm text-primary" to="/staff">العودة للدخول</Link>
      </form>
    </section>
  );
}
