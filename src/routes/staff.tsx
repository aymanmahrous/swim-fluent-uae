import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { canonicalPhoneDisplay } from "../platform/international-phone";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ title: "Staff — Relax Fix UAE" }] }),
  component: StaffPage,
});

const StaffSessionSchema = z.object({
  authenticated: z.literal(true),
  profile: z.object({
    id: z.string().uuid(),
    display_name: z.string(),
    role: z.enum(["super_admin", "admin", "reception", "coach", "content_manager"]),
    active: z.literal(true),
  }),
});

const BookingSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  phone: z.string(),
  normalized_phone: z.string(),
  gender: z.string(),
  category: z.string(),
  location: z.string(),
  other_location: z.string().nullable(),
  swam_before: z.boolean(),
  fear_of_water: z.boolean(),
  training_type: z.string(),
  requested_date: z.string(),
  requested_time: z.string(),
  status: z.enum(["pending", "contacted", "confirmed", "declined", "cancelled"]),
  created_at: z.string(),
});

async function fetchSession() {
  const response = await fetch("/api/staff-session", { headers: { Accept: "application/json" } });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to verify staff session.");
  const parsed = StaffSessionSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Invalid staff session response.");
  return parsed.data;
}

async function fetchBookings() {
  const response = await fetch("/api/staff-bookings", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Unable to load booking requests.");
  const parsed = z.array(BookingSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("Invalid booking data response.");
  return parsed.data;
}

function StaffPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sessionQuery = useQuery({
    queryKey: ["staff-session"],
    queryFn: fetchSession,
    retry: false,
  });
  const session = sessionQuery.data;
  const bookingsQuery = useQuery({
    queryKey: ["staff-bookings"],
    queryFn: fetchBookings,
    enabled: Boolean(session),
    retry: false,
  });

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/staff-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        toast.error("بيانات الدخول غير صحيحة أو الحساب غير معتمد كموظف.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["staff-session"] });
      toast.success("تم تسجيل الدخول بنجاح.");
      setPassword("");
    } catch {
      toast.error("تعذر تسجيل الدخول الآن.");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/staff-session", { method: "DELETE" });
    queryClient.setQueryData(["staff-session"], null);
    queryClient.removeQueries({ queryKey: ["staff-bookings"] });
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/staff-bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ bookingRequestId: id, status }),
    });
    if (!response.ok) {
      toast.error("لا تملك الصلاحية أو تعذر تحديث الحجز.");
      return;
    }
    toast.success("تم تحديث حالة الحجز.");
    await queryClient.invalidateQueries({ queryKey: ["staff-bookings"] });
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">جارٍ التحقق من الجلسة...</div>
    );
  }

  if (!session) {
    return (
      <section className="min-h-[75vh] bg-muted/45 px-6 py-20">
        <div className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-7 shadow-elegant sm:p-9">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-deep text-aqua">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-black">دخول فريق Relax Fix</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            الدخول مخصص للحسابات المعتمدة في Supabase Auth والموجودة كموظفين نشطين فقط.
          </p>
          <form onSubmit={login} className="mt-8 space-y-4">
            <div>
              <label htmlFor="staff-email" className="mb-2 block text-sm font-black">
                البريد الإلكتروني
              </label>
              <input
                id="staff-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div>
              <label htmlFor="staff-password" className="mb-2 block text-sm font-black">
                كلمة المرور
              </label>
              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <div className="mt-2 text-end">
                <Link to="/forgot-password" className="text-sm font-black text-primary hover:underline">
                  نسيت كلمة السر؟ / Forgot password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-deep px-5 py-3.5 font-black text-white disabled:opacity-50"
            >
              {submitting ? "جارٍ تسجيل الدخول..." : "دخول آمن"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[75vh] bg-muted/45 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-deep p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-aqua">
              <Waves className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-aqua">Staff Operations</div>
              <h1 className="mt-1 text-2xl font-black">{session.profile.display_name}</h1>
              <div className="mt-1 text-xs text-white/60">{session.profile.role}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/os"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-aqua px-4 py-3 text-sm font-black text-deep"
            >
              <Sparkles className="h-4 w-4" /> AI OS
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black"
            >
              <LogOut className="h-4 w-4" /> خروج
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-border bg-card shadow-elegant">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-2xl font-black">طلبات الحجز</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                بيانات حقيقية من booking_requests عبر RPC محمية بالدور.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 px-4 py-2 font-black text-primary">
              {bookingsQuery.data?.length ?? 0}
            </div>
          </div>

          {bookingsQuery.isLoading ? (
            <div className="p-10 text-center text-muted-foreground">جارٍ تحميل الحجوزات...</div>
          ) : bookingsQuery.isError ? (
            <div className="p-10 text-center text-destructive">
              تعذر تحميل الحجوزات أو لا توجد صلاحية.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bookingsQuery.data?.map((booking) => {
                const phoneDigits = booking.normalized_phone.replace(/\D/g, "");
                const phoneDisplay = canonicalPhoneDisplay(phoneDigits, booking.phone);
                const canLinkPhone = /^[1-9][0-9]{7,14}$/.test(phoneDigits);
                return (
                  <article
                    key={booking.id}
                    className="grid gap-5 p-6 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black">{booking.full_name}</h3>
                        {booking.fear_of_water && (
                          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-black text-foreground">
                            خوف من الماء
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {canLinkPhone ? (
                          <>
                            <a
                              href={`tel:+${phoneDigits}`}
                              dir="ltr"
                              className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" /> {phoneDisplay}
                            </a>
                            <a
                              href={`https://wa.me/${phoneDigits}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`WhatsApp ${phoneDisplay}`}
                              className="inline-flex rounded-lg p-1.5 text-primary hover:bg-primary/10"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </>
                        ) : (
                          <span dir="ltr">{booking.phone}</span>
                        )}
                        <span>• {booking.category} • {booking.training_type}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="font-black">
                        {booking.requested_date} — {booking.requested_time.slice(0, 5)}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {booking.location === "Other" ? booking.other_location : booking.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <select
                        value={booking.status}
                        onChange={(event) => updateStatus(booking.id, event.target.value)}
                        disabled={
                          session.profile.role === "coach" ||
                          session.profile.role === "content_manager"
                        }
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold disabled:opacity-50"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="declined">مرفوض</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>
                  </article>
                );
              })}
              {bookingsQuery.data?.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">لا توجد طلبات حجز.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
