import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import {
  OPERATIONAL_EMAIL,
  WHATSAPP_DISPLAY,
  operationalWhatsAppUrl,
} from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";

type PublicContactLanguage = "ar" | "en";

const copy = {
  ar: {
    breadcrumbHome: "Relax Fix UAE",
    breadcrumbCurrent: "تواصل معنا",
    title: "التواصل والحجز",
    body: "يمكنك إرسال طلب التقييم من صفحة الحجز أو التواصل عبر واتساب. إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا.",
    nonMedical:
      "المعلومات العامة لا تمثل تشخيصًا أو علاجًا طبيًا، والحالات الطارئة يجب توجيهها إلى خدمات الطوارئ المختصة.",
    whatsapp: "واتساب",
    email: "البريد التشغيلي",
    bookingCta: "انتقل إلى نموذج طلب التقييم",
    homeHref: "/" as const,
    bookingHref: "/#book" as const,
  },
  en: {
    breadcrumbHome: "Relax Fix UAE",
    breadcrumbCurrent: "Contact",
    title: "Contact and booking",
    body: "Submit an assessment request from the booking form or contact us on WhatsApp. Submitting a request does not confirm an appointment.",
    nonMedical:
      "General information is not medical diagnosis or treatment; emergencies should go to qualified emergency services.",
    whatsapp: "WhatsApp",
    email: "Operational email",
    bookingCta: "Go to the assessment request form",
    homeHref: "/en" as const,
    bookingHref: "/en#book" as const,
  },
} as const;

export function PublicContactPage({ language }: { language: PublicContactLanguage }) {
  const text = copy[language];
  const isArabic = language === "ar";

  return (
    <main
      lang={isArabic ? "ar-AE" : "en-AE"}
      dir={isArabic ? "rtl" : "ltr"}
      className="mx-auto max-w-5xl px-5 py-12 sm:px-6"
    >
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to={text.homeHref} className="font-semibold text-primary hover:underline">
          {text.breadcrumbHome}
        </Link>
        <span aria-hidden="true"> · </span>
        <span>{text.breadcrumbCurrent}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-black sm:text-5xl">{text.title}</h1>
        <p className="mt-5 leading-8 text-muted-foreground">{text.body}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{text.nonMedical}</p>
      </header>

      <div className="mt-10 grid gap-3 sm:max-w-xl">
        <a
          href={operationalWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          onClick={() => emitPublicCtaClick("booking_section_whatsapp", language)}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"
        >
          <MessageCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <span>
            {text.whatsapp}: <span dir="ltr">{WHATSAPP_DISPLAY}</span>
          </span>
        </a>
        <a
          href={`mailto:${OPERATIONAL_EMAIL}`}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 font-black"
        >
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>
            {text.email}: {OPERATIONAL_EMAIL}
          </span>
        </a>
        <Link
          to={text.homeHref}
          hash="book"
          className="inline-flex items-center justify-center rounded-2xl bg-deep px-5 py-4 text-sm font-black text-white"
        >
          {text.bookingCta}
        </Link>
      </div>
    </main>
  );
}
