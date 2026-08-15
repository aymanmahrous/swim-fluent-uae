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
  HandHeart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  UserRound,
  Waves,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import heroAvif from "../assets/hero-pool.avif";
import heroImg from "../assets/hero-pool.jpg";
import heroWebp from "../assets/hero-pool.webp";
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
import {
  emitBookingComplete,
  emitPublicCtaClick,
} from "../platform/public-cta-events";

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
  website: string;
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
  website: "",
};

const conversionCopy = {
  ar: {
    heroProof: "خاص 1 على 1 · مجموعة صغيرة بحد أقصى 4 سباحين",
    concernsEyebrow: "ابدأ من مستواك الحالي",
    concernsTitle: "مهما كانت نقطة البداية، نختار الخطوة المناسبة",
    concerns: [
      ["خوف من الماء", "تدرج هادئ لبناء الراحة والسيطرة داخل الماء."],
      ["مبتدئ تمامًا", "تأسيس واضح للتنفس والطفو والحركة."],
      ["تدريب سابق دون تقدم كافٍ", "فهم نقطة التعطل والعمل على التقنية خطوة بخطوة."],
      ["ثقة أو تقنية أفضل", "تدريب منظم يناسب المستوى والهدف الحالي."],
    ],
    offersEyebrow: "خياران واضحان",
    offersTitle: "اختر طريقة التدريب المناسبة",
    groupTitle: "مجموعة صغيرة — 4 سباحين فقط",
    groupPrice: "450 درهم / شهريًا",
    groupSchedule: "حصتان أسبوعيًا",
    groupPoints: ["اهتمام أوضح داخل مجموعة صغيرة", "تدريب منتظم", "تطور تدريجي حسب المستوى"],
    sibling: "الأخ أو الأخت الإضافية: 400 درهم شهريًا بدلًا من 450 درهمًا",
    privateTitle: "حصة سباحة خاصة",
    privatePrice: "150 درهم / للحصة",
    privateDuration: "45–60 دقيقة",
    privatePoints: ["اهتمام فردي", "تدريب حسب نقطة البداية", "اختيار الموقع والموعد حسب التوفر"],
    chooseTitle: "غير متأكد أي برنامج يناسبك؟",
    chooseBody: "استخدم المساعد الحالي لاختيار الخطوة المناسبة حسب العمر والمستوى والثقة والهدف والمنطقة.",
    chooseCta: "ساعدني في اختيار البرنامج",
    nearestCta: "اعثر على أقرب مسبح",
    needsEyebrow: "برامج مائية فردية لاحتياجات مختلفة",
    needsTitle: "الحركة واللياقة والثقة داخل الماء",
    needsBody: "يمكن مناقشة تدريب مائي متكيف مع قدرات واحتياجات السباح، أو نشاط مائي يركز على الحركة واللياقة والثقة. لا يقدم الموقع تشخيصًا أو علاجًا طبيًا.",
    needsCta: "تحدث معنا عن احتياجات السباح",
    coachLabel: "تدريب مباشر مع كوتش أيمن",
    coachTrust: "نقطة البداية والهدف ومستوى الثقة داخل الماء هي أساس اختيار أسلوب التدريب.",
    contactReason: "نطلب الاسم ورقم الهاتف فقط ليراجع الفريق الطلب ويتواصل لتأكيد الملاءمة والموعد. لا يتم إرسال هذه البيانات إلى أدوات القياس.",
  },
  en: {
    heroProof: "Private 1-on-1 · Small Group, maximum 4 swimmers",
    concernsEyebrow: "Start from your current level",
    concernsTitle: "Whatever the starting point, we choose the right next step",
    concerns: [
      ["Afraid of water", "A calm progression to build comfort and control in the water."],
      ["Complete beginner", "Clear foundations for breathing, floating, and movement."],
      ["Previous lessons, limited progress", "Identify the sticking point and build technique step by step."],
      ["Better confidence or technique", "Structured coaching matched to the current level and goal."],
    ],
    offersEyebrow: "Two clear options",
    offersTitle: "Choose the coaching format that fits",
    groupTitle: "Small Group — Only 4 Swimmers",
    groupPrice: "AED 450 / Month",
    groupSchedule: "2 Sessions per Week",
    groupPoints: ["Closer attention in a small group", "Consistent practice", "Progressive development by level"],
    sibling: "Additional sibling: AED 400/month instead of AED 450",
    privateTitle: "Private Swimming Lesson",
    privatePrice: "AED 150 / Session",
    privateDuration: "45–60 Minutes",
    privatePoints: ["Individual attention", "Coaching from the swimmer's starting point", "Location and timing subject to availability"],
    chooseTitle: "Not sure which program is right?",
    chooseBody: "Use the existing assistant to choose the next step based on age, level, confidence, goal, and area.",
    chooseCta: "Help me choose the right program",
    nearestCta: "Find the nearest pool",
    needsEyebrow: "Individual aquatic programs for different needs",
    needsTitle: "Movement, fitness, and confidence in water",
    needsBody: "You can discuss aquatic training adapted to the swimmer's abilities and needs, or water activity focused on movement, fitness, and confidence. The website does not provide medical diagnosis or treatment.",
    needsCta: "Talk to us about the swimmer's needs",
    coachLabel: "Direct coaching with Coach Ayman",
    coachTrust: "The swimmer's starting point, goal, and confidence in water guide the coaching approach.",
    contactReason: "We ask for a name and phone number so the team can review the request and confirm suitability and timing. These details are not sent to analytics.",
  },
} as const;

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
  const copy = conversionCopy[lang];
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bookingFormStartedAt = useRef(Date.now());

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

  function openAssistant(mode: "answers" | "guided", intent?: "locations") {
    window.dispatchEvent(
      new CustomEvent("relaxfix:open-sales-assistant", { detail: { mode, intent } }),
    );
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
        honeypot: form.website,
        formElapsedMs: Math.min(Date.now() - bookingFormStartedAt.current, 86_400_000),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (!result.duplicate) {
        emitBookingComplete({
          ctaId: "booking_section_submit",
          language: lang,
          backendConfirmed: true,
          duplicateResponse: false,
          resultKey: result.bookingRequestId,
        });
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
          <picture className="absolute inset-0 block h-full w-full">
            <source srcSet={heroAvif} type="image/avif" />
            <source srcSet={heroWebp} type="image/webp" />
            <img
              src={heroImg}
              alt="Swimming pool in Abu Dhabi"
              className="h-full w-full object-cover object-center"
              width={1024}
              height={1024}
              decoding="async"
              fetchPriority="high"
            />
          </picture>
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
            <p className="mt-5 text-sm font-semibold text-gold">{copy.heroProof}</p>
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

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>{copy.concernsEyebrow}</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{copy.concernsTitle}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.concerns.map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
            </article>
          ))}
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

      <section id="pricing" className="scroll-mt-24 bg-deep py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow light>{copy.offersEyebrow}</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-black sm:text-5xl">{copy.offersTitle}</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-aqua/35 bg-white/10 p-6 shadow-elegant sm:p-8">
              <div className="flex items-center gap-3 text-aqua">
                <Users className="h-7 w-7" aria-hidden="true" />
                <h3 className="text-xl font-black text-white sm:text-2xl">{copy.groupTitle}</h3>
              </div>
              <div className="mt-6 text-3xl font-black text-gold" dir="ltr">{copy.groupPrice}</div>
              <div className="mt-2 font-bold text-white/85">{copy.groupSchedule}</div>
              <ul className="mt-6 grid gap-3 text-sm text-white/75">
                {copy.groupPoints.map((point) => <li key={point} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-aqua" aria-hidden="true" />{point}</li>)}
              </ul>
              <p className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm font-black text-gold">{copy.sibling}</p>
            </article>

            <article className="rounded-[2rem] border border-white/15 bg-white/10 p-6 sm:p-8">
              <div className="flex items-center gap-3 text-aqua">
                <UserRound className="h-7 w-7" aria-hidden="true" />
                <h3 className="text-xl font-black text-white sm:text-2xl">{copy.privateTitle}</h3>
              </div>
              <div className="mt-6 text-3xl font-black text-gold" dir="ltr">{copy.privatePrice}</div>
              <div className="mt-2 font-bold text-white/85" dir="ltr">{copy.privateDuration}</div>
              <ul className="mt-6 grid gap-3 text-sm text-white/75">
                {copy.privatePoints.map((point) => <li key={point} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-aqua" aria-hidden="true" />{point}</li>)}
              </ul>
            </article>
          </div>

          <div className="mt-8 grid gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-xl font-black">{copy.chooseTitle}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">{copy.chooseBody}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[28rem]">
              <button type="button" onClick={() => openAssistant("guided")} className="min-h-12 rounded-xl gradient-gold px-4 py-3 text-sm font-black text-deep">{copy.chooseCta}</button>
              <button type="button" onClick={() => openAssistant("answers", "locations")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black"><MapPin className="h-4 w-4" aria-hidden="true" />{copy.nearestCta}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-deep text-aqua"><HandHeart className="h-8 w-8" aria-hidden="true" /></div>
            <div>
              <SectionEyebrow>{copy.needsEyebrow}</SectionEyebrow>
              <h2 className="mt-3 text-2xl font-black sm:text-4xl">{copy.needsTitle}</h2>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{copy.needsBody}</p>
            </div>
            <button type="button" onClick={() => openAssistant("guided")} className="min-h-12 rounded-xl bg-deep px-5 py-3 text-sm font-black text-white">{copy.needsCta}</button>
          </div>
        </div>
      </section>

      <section id="coach-ayman" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-6 py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:py-24">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2.25rem] bg-deep shadow-elegant">
          <picture className="absolute inset-0 block h-full w-full">
            <source srcSet={heroAvif} type="image/avif" />
            <source srcSet={heroWebp} type="image/webp" />
            <img
              src={heroImg}
              alt="Aquatic coaching environment in Abu Dhabi"
              className="absolute inset-0 h-full w-full object-cover opacity-75"
              width={1024}
              height={1024}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-aqua">{copy.coachLabel}</div>
            <div className="mt-2 text-3xl font-black">{tr("coachTitle")}</div>
          </div>
        </div>
        <div>
          <SectionEyebrow>{tr("coachTitle")}</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{tr("slogan")}</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{tr("coachBody")}</p>
          <p className="mt-4 font-bold leading-7 text-foreground">{copy.coachTrust}</p>
          <blockquote className="mt-8 rounded-2xl border-s-4 border-gold bg-muted/60 p-6 text-lg font-bold leading-8">
            “{tr("coachQuote")}”
          </blockquote>
        </div>
      </section>

      <section id="book" className="relative scroll-mt-24 bg-muted/55 py-24">
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
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(event) =>
                    setForm((value) => ({ ...value, website: event.target.value }))
                  }
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[10000px] h-px w-px overflow-hidden"
                />
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
  const { tr, lang } = useLang();
  return (
    <div className="grid gap-6 sm:grid-cols-2 animate-float-in">
      <div>
        <label htmlFor="booking-full-name" className={labelClass}>
          {tr("fullName")} *
        </label>
        <input
          id="booking-full-name"
          name="fullName"
          autoComplete="name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((value) => ({ ...value, name: e.target.value }))}
        />
      </div>
      <p className="rounded-2xl bg-muted/60 p-4 text-xs leading-6 text-muted-foreground sm:col-span-2">
        {conversionCopy[lang].contactReason}
      </p>
      <div>
        <label htmlFor="booking-phone" className={labelClass}>
          {tr("phone")} *
        </label>
        <input
          id="booking-phone"
          name="phone"
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
        <label htmlFor="booking-location" className={labelClass}>
          {tr("neighborhood")} *
        </label>
        <select
          id="booking-location"
          name="location"
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
          <>
            <label htmlFor="booking-other-location" className="sr-only">
              {tr("otherLabel")}
            </label>
            <input
              id="booking-other-location"
              name="otherLocation"
              className={`${inputClass} mt-3`}
              value={form.otherLocation}
              onChange={(e) => setForm((value) => ({ ...value, otherLocation: e.target.value }))}
              placeholder={tr("otherLabel")}
            />
          </>
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
          ["Group", tr("group")],
        ]}
        onChange={(trainingType) => setForm((value) => ({ ...value, trainingType }))}
        columns={2}
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
      <fieldset>
        <legend className={labelClass}>{tr("selectDate")} *</legend>
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
                aria-pressed={form.requestedDate === date}
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
      </fieldset>
      <fieldset>
        <legend className={labelClass}>{tr("slot")} *</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((slot) => (
            <button
              type="button"
              key={slot}
              aria-pressed={form.slot === slot}
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
      </fieldset>
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
  const { lang, tr } = useLang();
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
        onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)}
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
    <fieldset>
      <legend className={labelClass}>{label} *</legend>
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
              value={optionValue}
              className="sr-only"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            {optionLabel}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
