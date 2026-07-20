import { Clock3, ExternalLink, Mail, MapPin, MessageCircle, Users } from "lucide-react";
import { useLang } from "../lib/i18n";
import {
  GENERAL_AVAILABILITY,
  OPERATIONAL_EMAIL,
  PUBLIC_PRICING,
  TRAINING_LOCATIONS,
  WHATSAPP_DISPLAY,
  operationalWhatsAppUrl,
  type TrainingLocationStatus,
} from "../platform/public-business-config";

const statusCopy: Record<TrainingLocationStatus, { ar: string; en: string; className: string }> = {
  available: {
    ar: "متاح",
    en: "Available",
    className: "bg-emerald-500/10 text-emerald-700",
  },
  "limited-availability": {
    ar: "توفر محدود",
    en: "Limited availability",
    className: "bg-amber-500/10 text-amber-800",
  },
  "temporarily-unavailable": {
    ar: "غير متاح مؤقتًا",
    en: "Temporarily unavailable",
    className: "bg-slate-500/10 text-slate-700",
  },
};

function trackWhatsApp(ctaId: string) {
  window.dispatchEvent(
    new CustomEvent("relaxfix:analytics-event", {
      detail: { eventName: "whatsapp_click", ctaId, source: "website" },
    }),
  );
}

export function RevenueSections() {
  const { lang } = useLang();
  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        eyebrow: "مجموعة صغيرة واهتمام أكبر",
        title: "تدريب واضح يبدأ من نقطة البداية الحقيقية",
        body: "نقدم تدريب الأطفال ضمن مجموعات صغيرة لا تتجاوز 4 أطفال، بما يتيح توجيهًا أوضح وتجربة أكثر هدوءًا وثقة. اختر الموقع الأقرب وأرسل طلب تقييم أولي، ثم نراجع مستوى المتدرب وتوفر الموقع والموعد قبل تأكيد الحجز.",
        pricing: "الأسعار",
        group: "تدريب الأطفال داخل مجموعة صغيرة",
        child: "للطفل",
        sibling: "لكل طفل من الإخوة",
        aquatic: "جلسة حركة مائية",
        land: "جلسة حركة برية",
        noDuration: "الأسعار المذكورة لا تحدد مدة أو عدد حصص أو باقة.",
        locations: "مواقع التدريب",
        locationsIntro:
          "اختر موقع التدريب الأقرب إليك، ثم أرسل طلب تقييم أولي. سنراجع مستوى المتدرب وتوفر الموقع والموعد قبل تأكيد الحجز.",
        maps: "فتح في Google Maps",
        assessment: "اطلب تقييمًا أوليًا",
        whatsapp: "واتساب",
        hours: "ساعات التوفر العامة",
        availabilityNote:
          "هذه ساعات توفر عامة وليست ضمانًا لتوفر كل موقع. لا يُؤكد الموعد إلا بعد فحص جدول الموقع والتعارضات.",
        contact: "التواصل والحجز",
        contactBody:
          "يمكنك إرسال طلب التقييم من النموذج أو التواصل عبر واتساب. إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا.",
        email: "البريد التشغيلي",
        nonMedical:
          "المعلومات العامة لا تمثل تشخيصًا أو علاجًا طبيًا، والحالات الطارئة يجب توجيهها إلى خدمات الطوارئ المختصة.",
      }
    : {
        eyebrow: "Small group, greater attention",
        title: "Clear coaching that starts from the learner’s real starting point",
        body: "Children’s coaching is offered in small groups of no more than four, allowing for clearer guidance and a calmer, more confident learning experience. Choose the nearest location and request an initial assessment; the learner’s level, location availability and appointment time are reviewed before any booking is confirmed.",
        pricing: "Pricing",
        group: "Children’s small-group coaching",
        child: "per child",
        sibling: "per sibling child",
        aquatic: "Aquatic movement session",
        land: "Land-based movement session",
        noDuration: "These prices do not state a duration, number of sessions or package.",
        locations: "Training Locations",
        locationsIntro:
          "Choose the most convenient training location and submit an initial assessment request. We will review the learner’s level, location availability and appointment time before confirming the booking.",
        maps: "Open in Google Maps",
        assessment: "Request an initial assessment",
        whatsapp: "WhatsApp",
        hours: "General availability",
        availabilityNote:
          "These are general availability hours, not a guarantee for every location. An appointment is confirmed only after the location calendar and conflicts are checked.",
        contact: "Contact and booking",
        contactBody:
          "Submit the assessment form or continue on WhatsApp. Sending a request does not mean the appointment is confirmed.",
        email: "Operational email",
        nonMedical:
          "General information is not medical diagnosis or treatment. Emergencies must be directed to the appropriate emergency services.",
      };

  return (
    <>
      <section id="pricing" className="bg-deep py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-aqua">{copy.eyebrow}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <h2 className="text-3xl font-black sm:text-5xl">{copy.title}</h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">{copy.body}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-gold" aria-hidden="true" />
                <h3 className="text-xl font-black">{copy.pricing}</h3>
              </div>
              <dl className="mt-5 grid gap-3">
                <Price
                  label={`${copy.group} (≤ ${PUBLIC_PRICING.groupMaxSize})`}
                  value={PUBLIC_PRICING.groupChildPriceAED}
                  suffix={copy.child}
                />
                <Price label={copy.sibling} value={PUBLIC_PRICING.siblingChildPriceAED} />
                <Price label={copy.aquatic} value={PUBLIC_PRICING.aquaticSessionPriceAED} />
                <Price label={copy.land} value={PUBLIC_PRICING.landSessionPriceAED} />
              </dl>
              <p className="mt-4 text-xs leading-5 text-white/60">{copy.noDuration}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="locations" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            {copy.locations}
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{copy.locations}</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">{copy.locationsIntro}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TRAINING_LOCATIONS.map((location) => {
            const status = statusCopy[location.status];
            const message = isArabic
              ? `مرحبًا، أريد طلب تقييم أولي في ${location.displayName}.`
              : `Hello, I would like to request an initial assessment at ${location.displayName}.`;
            return (
              <article
                key={location.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>
                    {isArabic ? status.ar : status.en}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black">{location.displayName}</h3>
                <div className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  <p>
                    {isArabic ? GENERAL_AVAILABILITY.weekend.ar : GENERAL_AVAILABILITY.weekend.en}
                  </p>
                  <p>
                    {isArabic ? GENERAL_AVAILABILITY.weekdays.ar : GENERAL_AVAILABILITY.weekdays.en}
                  </p>
                </div>
                <div className="mt-6 grid gap-2">
                  <a
                    href={location.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-black hover:bg-muted"
                  >
                    {copy.maps} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#book"
                    className="inline-flex items-center justify-center rounded-xl bg-deep px-4 py-3 text-sm font-black text-white"
                  >
                    {copy.assessment}
                  </a>
                  <a
                    href={operationalWhatsAppUrl(message)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsApp(`location_${location.id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> {copy.whatsapp}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-muted/60 p-6">
          <div className="flex items-center gap-3 font-black">
            <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" /> {copy.hours}
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.availabilityNote}</p>
        </div>
      </section>

      <section id="contact" className="bg-muted/55 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black sm:text-5xl">{copy.contact}</h2>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">{copy.contactBody}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {copy.nonMedical}
            </p>
          </div>
          <div className="grid gap-3">
            <a
              href={operationalWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsApp("contact_section")}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"
            >
              <MessageCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              <span>
                {copy.whatsapp}: <span dir="ltr">{WHATSAPP_DISPLAY}</span>
              </span>
            </a>
            <a
              href={`mailto:${OPERATIONAL_EMAIL}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"
            >
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
              <span>
                {copy.email}: {OPERATIONAL_EMAIL}
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Price({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-deep/35 px-4 py-3">
      <dt className="text-sm font-bold text-white/75">{label}</dt>
      <dd className="shrink-0 font-black">
        AED {value}
        {suffix ? ` ${suffix}` : ""}
      </dd>
    </div>
  );
}
