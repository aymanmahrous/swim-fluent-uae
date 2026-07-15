import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserRound,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import heroImg from "../assets/hero-pool.jpg";
import { useLang, type TranslationKey } from "../lib/i18n";
import {
  buildWhatsAppMessage,
  generateSlotsForDubaiDate,
  type Booking,
} from "../lib/store";
import { formatDubaiCalendarDate, submitBookingRequest } from "../platform/booking-request";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Relax Fix UAE — Coach Ayman | Swimming & Water Confidence Abu Dhabi" },
      {
        name: "description",
        content:
          "Swimming and water-confidence coaching in Abu Dhabi with Coach Ayman, with a clear assessment and step-by-step training based on each learner’s starting point.",
      },
    ],
  }),
  component: Home,
});

type BookingForm = {
  name: string;
  phone: string;
  gender: string;
  category: string;
  location: string;
  otherLocation: string;
  swamBefore: string;
  afraid: string;
  trainingType: string;
  requestedDate: string;
  slot: string;
  agree: boolean;
};

const emptyForm: BookingForm = {
  name: "",
  phone: "",
  gender: "",
  category: "",
  location: "",
  otherLocation: "",
  swamBefore: "",
  afraid: "",
  trainingType: "",
  requestedDate: "",
  slot: "",
  agree: false,
};

function upcomingDubaiDates(): string[] {
  const dates: string[] = [];
  for (let offset = 0; offset < 8; offset += 1) {
    const value = formatDubaiCalendarDate(new Date(Date.now() + offset * 86_400_000));
    if (!dates.includes(value)) dates.push(value);
  }
  return dates.slice(0, 7);
}

function Home() {
  const { tr, lang, dir } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = useMemo(upcomingDubaiDates, []);
  const slots = useMemo(
    () =>
      form.requestedDate
        ? generateSlotsForDubaiDate(form.requestedDate, settings.sessionDurationMinutes)
        : [],
    [form.requestedDate, settings.sessionDurationMinutes],
  );
  const settingsReady = settingsQuery.isSuccess && settings.bookingEnabled;
  const isOther = form.location === "Other";
  const offer =
    (lang === "ar" ? settings.openingOfferTextAr : settings.openingOfferTextEn) ?? tr("offer");

  const canContinue =
    step === 1
      ? Boolean(form.name.trim().length >= 2 && form.phone.trim())
      : step === 2
        ? Boolean(
            form.gender &&
              form.category &&
              form.location &&
              (!isOther || form.otherLocation.trim().length >= 2) &&
              form.swamBefore &&
              form.afraid,
          )
        : step === 3
          ? Boolean(form.trainingType)
          : step === 4
            ? Boolean(form.requestedDate && form.slot)
            : form.agree;

  function goNext() {
    if (!canContinue) return;
    setStep((current) => Math.min(5, current + 1));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsReady) {
      toast.error(tr("settingsUnavailable"));
      return;
    }
    if (!canContinue || isSubmitting || step !== 5) return;

    const booking: Booking = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fearOfWater: form.afraid === "yes",
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      category: form.category,
      location: form.location,
      otherLocation: isOther ? form.otherLocation.trim() : undefined,
      swamBefore: form.swamBefore === "yes",
      trainingType: form.trainingType,
      requestedDate: form.requestedDate,
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
        requestedDate: booking.requestedDate,
        requestedTime: booking.slot,
        termsAccepted: form.agree,
        idempotencyKey: booking.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSubmitted(booking);
      toast.success(tr("requestSaved"));
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

  const programs: Array<{ icon: typeof Waves; title: TranslationKey; body: TranslationKey }> = [
    { icon: Waves, title: "programLearn", body: "programLearnD" },
    { icon: HeartHandshake, title: "programConfidence", body: "programConfidenceD" },
    { icon: Dumbbell, title: "programPerformance", body: "programPerformanceD" },
  ];

  return (
    <div dir={dir} className="overflow-hidden">
      <section className="relative isolate min-h-[82vh] overflow-hidden bg-deep text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Swimming pool in Abu Dhabi"
            className="h-full w-full object-cover object-center"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 premium-hero-overlay" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-deep to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-28">
          <div className="max-w-3xl animate-float-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-xl sm:text-sm">
              <Sparkles className="h-4 w-4 text-gold" /> {tr("heroEyebrow")}
            </div>
            <h1 className="text-balance text-4xl font-black leading-[1.08] sm:text-6xl lg:text-7xl">
              {tr("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-xl">
              {tr("heroBody")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-gold px-7 py-4 font-black text-deep shadow-gold transition hover:-translate-y-1"
              >
                {tr("book")} <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </a>
              <a
                href="#programs"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 py-4 font-bold backdrop-blur transition hover:bg-white/15"
              >
                {tr("viewPrograms")}
              </a>
            </div>
            <p className="mt-5 text-sm font-semibold text-gold">{offer}</p>
          </div>

          <div className="hidden lg:block">
            <div className="relative ms-auto max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-elegant backdrop-blur-2xl">
              <div className="absolute -inset-px -z-10 rounded-[2rem] premium-card-glow" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Metric icon={Star} label={tr("assessment")} value={tr("assessmentValue")} />
                <Metric
                  icon={CalendarDays}
                  label={tr("session")}
                  value={`${settings.sessionDurationMinutes} min`}
                />
                <Metric icon={Target} label={tr("abuDhabi")} value={tr("coverage")} />
                <Metric icon={Award} label={tr("coachTitle")} value={tr("feat1")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-12 z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card/95 p-5 shadow-elegant backdrop-blur md:grid-cols-3 md:p-7">
          {[
            { icon: Award, title: "feat1", body: "feat1d" },
            { icon: ShieldCheck, title: "feat2", body: "feat2d" },
            { icon: Target, title: "feat3", body: "feat3d" },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-2xl p-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-aqua shadow-glow">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-black">{tr(title as TranslationKey)}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {tr(body as TranslationKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>{tr("tagline")}</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{tr("programsTitle")}</h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">{tr("programsBody")}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map(({ icon: Icon, title, body }, index) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-elegant"
            >
              <div className="absolute end-4 top-3 text-7xl font-black text-primary/5">0{index + 1}</div>
              <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-deep text-aqua transition group-hover:scale-105">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-7 text-xl font-black">{tr(title)}</h3>
              <p className="relative mt-3 text-sm leading-7 text-muted-foreground">{tr(body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2.25rem] bg-deep shadow-elegant">
          <img src={heroImg} alt="Coach Ayman swimming coaching" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-aqua">Relax Fix UAE</div>
            <div className="mt-2 text-3xl font-black">{tr("coachTitle")}</div>
          </div>
        </div>
        <div>
          <SectionEyebrow>{tr("coachTitle")}</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{tr("slogan")}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{tr("coachBody")}</p>
          <blockquote className="mt-8 rounded-2xl border-s-4 border-gold bg-muted/60 p-6 text-lg font-bold leading-8">
            “{tr("coachQuote")}”
          </blockquote>
        </div>
      </section>

      <section id="book" className="relative bg-muted/55 py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>{offer}</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">{tr("bookSession")}</h2>
            <p className="mt-4 text-muted-foreground">{tr("wizardIntro")}</p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant">
            {submitted ? (
              <SuccessState booking={submitted} settings={settings} />
            ) : (
              <form onSubmit={submit}>
                <WizardProgress step={step} />
                <div className="p-6 sm:p-10">
                  {settingsQuery.isError && (
                    <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
                      {tr("settingsUnavailable")}
                    </div>
                  )}

                  {step === 1 && <AboutStep form={form} setForm={setForm} />}
                  {step === 2 && (
                    <ProfileStep form={form} setForm={setForm} locations={settings.locations} />
                  )}
                  {step === 3 && <GoalStep form={form} setForm={setForm} />}
                  {step === 4 && (
                    <TimeStep
                      form={form}
                      setForm={setForm}
                      dates={dates}
                      slots={slots}
                      lang={lang}
                    />
                  )}
                  {step === 5 && <ConfirmStep form={form} setForm={setForm} />}

                  <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
                    <button
                      type="button"
                      onClick={() => setStep((current) => Math.max(1, current - 1))}
                      disabled={step === 1 || isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted disabled:opacity-30"
                    >
                      <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {tr("back")}
                    </button>
                    {step < 5 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!canContinue}
                        className="inline-flex items-center gap-2 rounded-xl bg-deep px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {tr("next")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!canContinue || isSubmitting || !settingsReady}
                        className="inline-flex items-center gap-2 rounded-xl gradient-gold px-6 py-3 text-sm font-black text-deep shadow-gold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isSubmitting ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : tr("submit")}
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-deep/45 p-4">
      <Icon className="h-5 w-5 text-gold" />
      <div className="mt-4 text-xs text-white/60">{label}</div>
      <div className="mt-1 font-black">{value}</div>
    </div>
  );
}

function SectionEyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <div className={`text-xs font-black uppercase tracking-[0.2em] ${light ? "text-aqua" : "text-primary"}`}>
      {children}
    </div>
  );
}

function WizardProgress({ step }: { step: number }) {
  const { tr } = useLang();
  const labels: TranslationKey[] = ["stepAbout", "stepProfile", "stepGoal", "stepTime", "stepConfirm"];
  return (
    <div className="border-b border-border bg-muted/45 px-4 py-5 sm:px-8">
      <div className="grid grid-cols-5 gap-2">
        {labels.map((label, index) => {
          const number = index + 1;
          const active = step === number;
          const complete = step > number;
          return (
            <div key={label} className="text-center">
              <div
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-xs font-black transition ${
                  complete
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-deep text-white ring-4 ring-primary/15"
                      : "bg-card text-muted-foreground"
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : number}
              </div>
              <div className={`mt-2 hidden text-xs font-bold sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {tr(label)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const labelClass = "mb-2 block text-sm font-black";

type StepProps = {
  form: BookingForm;
  setForm: React.Dispatch<React.SetStateAction<BookingForm>>;
};

function AboutStep({ form, setForm }: StepProps) {
  const { tr } = useLang();
  return (
    <div className="grid gap-6 sm:grid-cols-2 animate-float-in">
      <div>
        <label className={labelClass}>{tr("fullName")} *</label>
        <input
          autoComplete="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))}
        />
      </div>
      <div>
        <label className={labelClass}>{tr("phone")} *</label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm((value) => ({ ...value, phone: e.target.value }))}
          placeholder="+971 5X XXX XXXX"
        />
      </div>
    </div>
  );
}

function ProfileStep({ form, setForm, locations }: StepProps & { locations: string[] }) {
  const { tr } = useLang();
  const isOther = form.location === "Other";
  return (
    <div className="space-y-7 animate-float-in">
      <ChoiceGroup
        label={tr("gender")}
        name="gender"
        value={form.gender}
        options={[["Male", tr("male")], ["Female", tr("female")]]}
        onChange={(gender) => setForm((value) => ({ ...value, gender }))}
      />
      <ChoiceGroup
        label={tr("category")}
        name="category"
        value={form.category}
        options={[
          ["Boy", tr("boy")],
          ["Girl", tr("girl")],
          ["Adult", tr("adult")],
        ]}
        onChange={(category) => setForm((value) => ({ ...value, category }))}
      />
      <div>
        <label className={labelClass}>{tr("neighborhood")} *</label>
        <select
          className={inputClass}
          value={form.location}
          onChange={(e) =>
            setForm((value) => ({ ...value, location: e.target.value, otherLocation: "" }))
          }
        >
          <option value="">—</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
          <option value="Other">{tr("other")}</option>
        </select>
        {isOther && (
          <input
            className={`${inputClass} mt-3`}
            value={form.otherLocation}
            onChange={(e) => setForm((value) => ({ ...value, otherLocation: e.target.value }))}
            placeholder={tr("otherLabel")}
          />
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <ChoiceGroup
          label={tr("swamBefore")}
          name="swam"
          value={form.swamBefore}
          options={[["yes", tr("yes")], ["no", tr("no")]]}
          onChange={(swamBefore) => setForm((value) => ({ ...value, swamBefore }))}
        />
        <ChoiceGroup
          label={tr("afraid")}
          name="afraid"
          value={form.afraid}
          options={[["yes", tr("yes")], ["no", tr("no")]]}
          onChange={(afraid) => setForm((value) => ({ ...value, afraid }))}
        />
      </div>
    </div>
  );
}

function GoalStep({ form, setForm }: StepProps) {
  const { tr } = useLang();
  return (
    <div className="animate-float-in">
      <ChoiceGroup
        label={tr("trainingType")}
        name="training"
        value={form.trainingType}
        options={[
          ["Private", tr("private")],
          ["Semi-Private", tr("semi")],
          ["Group", tr("group")],
        ]}
        onChange={(trainingType) => setForm((value) => ({ ...value, trainingType }))}
        columns={3}
      />
    </div>
  );
}

function TimeStep({
  form,
  setForm,
  dates,
  slots,
  lang,
}: StepProps & { dates: string[]; slots: string[]; lang: "ar" | "en" }) {
  const { tr } = useLang();
  return (
    <div className="space-y-8 animate-float-in">
      <div>
        <label className={labelClass}>{tr("selectDate")} *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {dates.map((date) => {
            const label = new Intl.DateTimeFormat(lang === "ar" ? "ar-AE" : "en-AE", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "Asia/Dubai",
            }).format(new Date(`${date}T12:00:00+04:00`));
            return (
              <button
                type="button"
                key={date}
                onClick={() => setForm((value) => ({ ...value, requestedDate: date, slot: "" }))}
                className={`rounded-2xl border px-3 py-3 text-xs font-bold transition ${
                  form.requestedDate === date
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className={labelClass}>{tr("slot")} *</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((slot) => (
            <button
              type="button"
              key={slot}
              onClick={() => setForm((value) => ({ ...value, slot }))}
              className={`rounded-xl border-2 px-3 py-3 font-mono text-sm font-bold transition ${
                form.slot === slot
                  ? "border-deep bg-deep text-white"
                  : "border-border bg-background hover:border-primary"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfirmStep({ form, setForm }: StepProps) {
  const { tr } = useLang();
  const summary = [
    [tr("fullName"), form.name],
    [tr("phone"), form.phone],
    [tr("category"), form.category],
    [tr("neighborhood"), form.location === "Other" ? form.otherLocation : form.location],
    [tr("trainingType"), form.trainingType],
    [tr("selectDate"), form.requestedDate],
    [tr("slot"), form.slot],
  ];
  return (
    <div className="space-y-6 animate-float-in">
      <div className="rounded-2xl bg-muted/60 p-5">
        <h3 className="font-black">{tr("selectedSummary")}</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-card p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm font-black">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-2xl border border-border p-5">
        <div className="font-black">{tr("disclaimer")}</div>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{tr("disclaimerText")}</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm((value) => ({ ...value, agree: e.target.checked }))}
            className="mt-1 h-5 w-5 accent-primary"
          />
          <span className="text-sm font-black">{tr("agree")}</span>
        </label>
      </div>
    </div>
  );
}

function SuccessState({
  booking,
  settings,
}: {
  booking: Booking;
  settings: typeof fallbackBusinessSettings;
}) {
  const { tr } = useLang();
  return (
    <div id="success" className="p-8 text-center sm:p-14">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">{tr("requestSaved")}</div>
      <h3 className="mx-auto mt-3 max-w-2xl text-2xl font-black sm:text-4xl">{tr("success")}</h3>
      <p className="mt-4 text-muted-foreground">{tr("whatsappOptional")}</p>
      <a
        href={businessWhatsAppUrl(settings, buildWhatsAppMessage(booking))}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-deep px-7 py-4 font-black text-white transition hover:-translate-y-1"
      >
        <MessageCircle className="h-5 w-5" /> {tr("contactWA")}
      </a>
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  value,
  options,
  onChange,
  columns = 2,
}: {
  label: string;
  name: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div>
      <label className={labelClass}>{label} *</label>
      <div className={`grid gap-2 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map(([optionValue, optionLabel]) => (
          <label
            key={optionValue}
            className={`cursor-pointer rounded-2xl border-2 px-4 py-3.5 text-center text-sm font-bold transition ${
              value === optionValue
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            {optionLabel}
          </label>
        ))}
      </div>
    </div>
  );
}
