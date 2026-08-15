import { Clock3, ExternalLink, Mail, MapPin, MessageCircle } from "lucide-react";
import { useLang } from "../lib/i18n";
import {
  GENERAL_AVAILABILITY,
  OPERATIONAL_EMAIL,
  TRAINING_LOCATIONS,
  WHATSAPP_DISPLAY,
  operationalWhatsAppUrl,
  type TrainingLocationStatus,
} from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";

const statusCopy: Record<TrainingLocationStatus, { ar: string; en: string; className: string }> = {
  available: { ar: "متاح", en: "Available", className: "bg-emerald-500/10 text-emerald-700" },
  "limited-availability": { ar: "توفر محدود", en: "Limited availability", className: "bg-amber-500/10 text-amber-800" },
  "temporarily-unavailable": { ar: "غير متاح مؤقتًا", en: "Temporarily unavailable", className: "bg-slate-500/10 text-slate-700" },
};

export function RevenueSections() {
  const { lang } = useLang();
  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        locations: "اعثر على أقرب مسبح",
        locationsIntro: "اختر المنطقة الأقرب وافتح موقعها على الخريطة. يراجع الفريق توفر الموقع والموعد قبل تأكيد الحجز.",
        maps: "فتح في Google Maps",
        assessment: "ابدأ طلب الحجز",
        whatsapp: "واتساب",
        hours: "ساعات التوفر العامة",
        availabilityNote: "هذه ساعات توفر عامة وليست ضمانًا لتوفر كل موقع. لا يُؤكد الموعد إلا بعد فحص جدول الموقع والتعارضات.",
        faqEyebrow: "أسئلة تساعدك قبل الحجز",
        faqTitle: "إجابات سريعة وواضحة",
        faq: [
          ["هل تقبلون المبتدئين؟", "نعم. يبدأ التدريب من مستوى السباح الحالي، سواء كان مبتدئًا تمامًا أو لديه خبرة سابقة."],
          ["ماذا لو كان الطفل خائفًا من الماء؟", "يُراعى مستوى الراحة والخوف من الماء، ويكون التقدم تدريجيًا دون وعود بنتائج مضمونة."],
          ["خاص أم مجموعة صغيرة؟", "الخاص يقدم اهتمامًا فرديًا، والمجموعة الصغيرة تضم 4 سباحين كحد أقصى مع تدريب منتظم مرتين أسبوعيًا."],
          ["كم عدد السباحين في المجموعة؟", "الحد الأقصى 4 سباحين."],
          ["أين مواقع التدريب؟", "التدريب متاح في أربعة مواقع داخل أبوظبي. استخدم بطاقات المواقع أعلاه لفتح أقرب موقع على الخريطة."],
          ["هل إرسال الطلب يؤكد الحجز؟", "لا. يراجع الفريق الملاءمة وتوفر الموقع والموعد قبل التأكيد النهائي."],
        ],
        contact: "التواصل والحجز",
        contactBody: "يمكنك إرسال طلب الحجز من النموذج أو التواصل عبر واتساب. إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا.",
        email: "البريد التشغيلي",
        nonMedical: "المعلومات العامة لا تمثل تشخيصًا أو علاجًا طبيًا، والحالات الطارئة يجب توجيهها إلى خدمات الطوارئ المختصة.",
      }
    : {
        locations: "Find your nearest pool",
        locationsIntro: "Choose the closest area and open it on the map. The team reviews location and time availability before confirming a booking.",
        maps: "Open in Google Maps",
        assessment: "Start booking request",
        whatsapp: "WhatsApp",
        hours: "General availability",
        availabilityNote: "These are general availability hours, not a guarantee for every location. An appointment is confirmed only after the location calendar and conflicts are checked.",
        faqEyebrow: "Helpful answers before booking",
        faqTitle: "Quick, clear answers",
        faq: [
          ["Do you accept complete beginners?", "Yes. Coaching starts from the swimmer's current level, whether they are completely new or have previous experience."],
          ["What if my child is afraid of water?", "Comfort and fear of water are considered, with a gradual approach and no guaranteed-outcome claims."],
          ["Private or Small Group?", "Private coaching provides individual attention. Small Group is limited to four swimmers with regular twice-weekly practice."],
          ["How many swimmers are in a group?", "A maximum of four swimmers."],
          ["Where are the pools?", "Training is available at four Abu Dhabi locations. Use the location cards above to open the nearest pool on the map."],
          ["Does submitting the form confirm a booking?", "No. The team reviews suitability, location availability, and timing before final confirmation."],
        ],
        contact: "Contact and booking",
        contactBody: "Submit the booking request form or continue on WhatsApp. Sending a request does not mean the appointment is confirmed.",
        email: "Operational email",
        nonMedical: "General information is not medical diagnosis or treatment. Emergencies must be directed to the appropriate emergency services.",
      };

  return (
    <>
      <section id="locations" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{copy.locations}</p>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{copy.locations}</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">{copy.locationsIntro}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TRAINING_LOCATIONS.map((location) => {
            const status = statusCopy[location.status];
            const message = isArabic
              ? `مرحبًا، أريد طلب تقييم أولي في ${location.displayName}.`
              : `Hello, I would like to request an initial assessment at ${location.displayName}.`;
            return (
              <article key={location.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><MapPin className="h-6 w-6" aria-hidden="true" /></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{isArabic ? status.ar : status.en}</span>
                </div>
                <h3 className="mt-5 text-xl font-black">{location.displayName}</h3>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <a href={location.shortUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-black hover:bg-muted">{copy.maps} <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
                  <a href="#book" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-deep px-4 py-3 text-sm font-black text-white">{copy.assessment}</a>
                  <a href={operationalWhatsAppUrl(message)} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-800 sm:col-span-2"><MessageCircle className="h-4 w-4" aria-hidden="true" /> {copy.whatsapp}</a>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-8 rounded-3xl border border-border bg-muted/60 p-6">
          <div className="flex items-center gap-3 font-black"><Clock3 className="h-5 w-5 text-primary" aria-hidden="true" /> {copy.hours}</div>
          <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            <p>{isArabic ? GENERAL_AVAILABILITY.weekend.ar : GENERAL_AVAILABILITY.weekend.en}</p>
            <p>{isArabic ? GENERAL_AVAILABILITY.weekdays.ar : GENERAL_AVAILABILITY.weekdays.en}</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.availabilityNote}</p>
        </div>
      </section>

      <section id="faq" className="bg-deep py-20 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-aqua">{copy.faqEyebrow}</p>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{copy.faqTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {copy.faq.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-white/15 bg-white/10 p-5 open:bg-white/15">
                <summary className="cursor-pointer list-none font-black marker:hidden">{question}</summary>
                <p className="mt-3 text-sm leading-7 text-white/75">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-muted/55 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black sm:text-5xl">{copy.contact}</h2>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">{copy.contactBody}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.nonMedical}</p>
          </div>
          <div className="grid gap-3">
            <a href={operationalWhatsAppUrl()} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)} className="flex min-h-14 items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"><MessageCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" /><span>{copy.whatsapp}: <span dir="ltr">{WHATSAPP_DISPLAY}</span></span></a>
            <a href={`mailto:${OPERATIONAL_EMAIL}`} className="flex min-h-14 items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"><Mail className="h-6 w-6 text-primary" aria-hidden="true" /><span className="min-w-0 break-all">{copy.email}: {OPERATIONAL_EMAIL}</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
