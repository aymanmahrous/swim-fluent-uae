import { useState } from "react";
import { toast } from "sonner";

export function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = await fetch("/api/staff-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error();
      toast.success("إذا كان الحساب موجودًا سيتم إرسال رابط إعادة التعيين.");
      setOpen(false);
    } catch {
      toast.error("تعذر إرسال طلب إعادة التعيين.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 text-center">
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-bold text-primary hover:underline">
        نسيت كلمة المرور؟
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-elegant">
            <h2 className="text-xl font-black">إعادة تعيين كلمة المرور</h2>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="البريد الإلكتروني" className="mt-5 w-full rounded-xl border px-4 py-3" />
            <div className="mt-5 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border px-4 py-3 font-bold">إلغاء</button>
              <button disabled={loading} onClick={submit} className="flex-1 rounded-xl bg-deep px-4 py-3 font-bold text-white">{loading ? "إرسال" : "إرسال الرابط"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
