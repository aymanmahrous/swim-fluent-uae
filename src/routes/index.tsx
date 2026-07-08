import { createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2, MessageCircle, ShieldCheck, Sparkles, Users, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import heroImg from "../assets/hero-pool.jpg";
import { useLang, type TranslationKey } from "../lib/i18n";
import { buildWhatsAppMessage, generateSlots, type Booking } from "../lib/store";
import { formatDubaiCalendarDate, submitBookingRequest } from "../platform/booking-request";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relax Fix UAE — Coach Ayman | Swimming Academy Abu Dhabi" },
      {
        name: "description",
        content: "Book swimming lessons and aquatic coaching in Abu Dhabi with Coach Ayman.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { tr, lang, dir } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    category: "",
    location: "",
    otherLocation: "",
    swamBefore: "",
    afraid: "",
    trainingType: "",
    slot: "",
    agree: false,
  });
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date] = useState(new Date());

  const slots = useMemo(
    () => generateSlots(date, settings.sessionDurationMinutes),
    [date, settings.sessionDurationMinutes],
  );
  const isOther = form.location === "Other";
  const settingsReady = settingsQuery.isSuccess && settings.bookingEnabled;
  const canSubmit =
    settingsReady &&
    form.name &&
    form.phone &&
    form.gender &&
    form.category &&
    form.location &&
    (!isOther || form.otherLocation) &&
    form.swamBefore &&
    form.afraid &&
    form.trainingType &&
    form.slot &&
    form.agree;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsReady) {
      toast.error(
        lang === "ar"
          ? "تعذر تحميل إعدادات الحجز. حاول مرة أخرى بعد قليل."
          : "Booking settings are unavailable. Please try again shortly.",
      );
      return;
    }
    if (!canSubmit || isSubmitting) return;

    const booking: Booking = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fearOfWater: form.afraid === "yes",
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      category: form.category,
      location: form.location,
      otherLocation: isOther ? form.otherLocation : undefined,
      swamBefore: form.swamBefore === "yes",
      trainingType: form.trainingType,
      slot: form.slot,
      status: "pending",
    };

    setIsSubmitting(true);
    try {
      const result = await submitBookingRequest({
        name: booking.name,
        phone: booking.phone,
        gender: booking.gender,
        category: booking.category,
        location: booking.location,
        otherLocation: booking.otherLocation,
        swamBefore: booking.swamBefore,
        fearOfWater: booking.fearOfWater,
        trainingType: booking.trainingType,
        requestedDate: formatDubaiCalendarDate(date),
        requestedTime: booking.slot,
        termsAccepted: form.agree,
        idempotencyKey: booking.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSubmitted(booking);
      toast.success(lang === "ar" ? "تم حفظ طلب الحجز بنجاح" : "Booking request saved");
      window.open(
        businessWhatsAppUrl(settings, buildWhatsAppMessage(booking)),
        "_blank",
        "noopener,noreferrer",
      );
      setTimeout(
        () => document.getElementById("success")?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit booking request.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const input =
    "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
  const label = "mb-2 block text-sm font-semibold";
  const offer =
    (lang === "ar" ? settings.openingOfferTextAr : settings.openingOfferTextEn) ?? tr("offer");

  return (
    <div dir={dir}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Pool" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-white sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/90 px-4 py-2 text-xs font-bold text-[color:var(--deep)] shadow-gold sm:text-sm">
            <Sparkles className="h-4 w-4" /> {offer}
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
            {settings.businessName}
          </h1>
          <p className="mb-2 text-lg opacity-90 sm:text-xl">{tr("tagline")}</p>
          <p className="mb-8 text-xl font-semibold text-gold sm:text-2xl">{tr("slogan")}</p>
          <a href="#book" className="inline-flex items-center gap-2 rounded-xl gradient-gold px-8 py-4 font-bold text-[color:var(--deep)] shadow-gold transition hover:scale-105">
            <Waves className="h-5 w-5" /> {tr("book")}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl">{tr("why")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Award, t: "feat1", d: "feat1d" },
            { icon: ShieldCheck, t: "feat2", d: "feat2d" },
            { icon: Users, t: "feat3", d: "feat3d" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-aqua shadow-glow">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{tr(t as TranslationKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{tr(d as TranslationKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold sm:text-4xl">{tr("bookSession")}</h2>
          <p className="text-muted-foreground">{offer}</p>
        </div>

        {submitted ? (
          <div id="success" className="rounded-2xl border-2 border-primary bg-card p-8 text-center shadow-elegant">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h3 className="mb-2 text-2xl font-bold">{tr("success")}</h3>
            <a
              href={businessWhatsAppUrl(settings, buildWhatsAppMessage(submitted))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-5 w-5" /> {tr("contactWA")}
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8">
            {settingsQuery.isError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {lang === "ar"
                  ? "الحجز متوقف مؤقتًا لأن إعدادات النشاط لم تُحمّل من الخادم."
                  : "Booking is temporarily unavailable because business settings could not be loaded."}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>{tr("fullName")} *</label>
                <input required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={label}>{tr("phone")} *</label>
                <input required type="tel" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+971 5X XXX XXXX" />
              </div>
            </div>

            <ChoiceGroup
              label={tr("gender")}
              name="gender"
              value={form.gender}
              options={[["Male", tr("male")], ["Female", tr("female")]]}
              onChange={(gender) => setForm({ ...form, gender })}
            />

            <ChoiceGroup
              label={tr("category")}
              name="category"
              value={form.category}
              options={[["Boy", tr("boy")], ["Girl", tr("girl")], ["Adult", tr("adult")], ["People of Determination", tr("pod")]]}
              onChange={(category) => setForm({ ...form, category })}
            />

            <div>
              <label className={label}>{tr("neighborhood")} *</label>
              <select required className={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value, otherLocation: "" })}>
                <option value="">—</option>
                {settings.locations.map((location) => <option key={location} value={location}>{location}</option>)}
                <option value="Other">{tr("other")}</option>
              </select>
              {isOther && (
                <input required className={`${input} mt-3`} value={form.otherLocation} onChange={(e) => setForm({ ...form, otherLocation: e.target.value })} placeholder={tr("otherLabel")} />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ChoiceGroup label={tr("swamBefore")} name="swam" value={form.swamBefore} options={[["yes", tr("yes")], ["no", tr("no")]]} onChange={(swamBefore) => setForm({ ...form, swamBefore })} />
              <ChoiceGroup label={tr("afraid")} name="afraid" value={form.afraid} options={[["yes", tr("yes")], ["no", tr("no")]]} onChange={(afraid) => setForm({ ...form, afraid })} />
            </div>

            <ChoiceGroup
              label={tr("trainingType")}
              name="training"
              value={form.trainingType}
              options={[["Private", tr("private")], ["Semi-Private", tr("semi")], ["Group", tr("group")]]}
              onChange={(trainingType) => setForm({ ...form, trainingType })}
            />

            <div>
              <label className={label}>{tr("slot")} *</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setForm({ ...form, slot })}
                    className={`rounded-lg border-2 px-2 py-2 font-mono text-sm transition ${form.slot === slot ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4">
              <div className="mb-2 text-sm font-bold">{tr("disclaimer")}</div>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{tr("disclaimerText")}</p>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" required checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-1 h-5 w-5 accent-primary" />
                <span className="text-sm font-semibold">{tr("agree")}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full rounded-xl gradient-gold py-4 text-lg font-bold text-[color:var(--deep)] shadow-gold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : tr("submit")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label} *</label>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(([optionValue, optionLabel]) => (
          <label
            key={optionValue}
            className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition ${value === optionValue ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
          >
            <input type="radio" name={name} className="sr-only" checked={value === optionValue} onChange={() => onChange(optionValue)} />
            {optionLabel}
          </label>
        ))}
      </div>
    </div>
  );
}
