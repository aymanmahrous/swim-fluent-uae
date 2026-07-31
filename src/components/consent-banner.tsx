import { BarChart3, Settings2, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "../lib/i18n";
import {
  publishAnalyticsConsentDecision,
  type AnalyticsConsentDecision,
} from "./analytics-consent-bridge";

export type ConsentChoice = AnalyticsConsentDecision;

const copy = {
  ar: {
    title: "قياس استخدام الموقع",
    description:
      "نطلب إذنك لقياس التفاعل مع الموقع وتحسين الخدمة. القياس اختياري، ومرفوض افتراضيًا، ولا يؤثر رفضه في استخدام الموقع أو الحجز.",
    accept: "السماح بالقياس",
    reject: "رفض القياس",
    privacy: "سياسة الخصوصية",
    settings: "إعدادات القياس",
    close: "إغلاق إعدادات القياس",
  },
  en: {
    title: "Website measurement",
    description:
      "We ask for permission to measure website interactions and improve the service. Measurement is optional, denied by default, and rejecting it does not affect website or booking access.",
    accept: "Accept measurement",
    reject: "Reject measurement",
    privacy: "Privacy policy",
    settings: "Measurement settings",
    close: "Close measurement settings",
  },
} as const;

export function ConsentBanner() {
  const { lang } = useLang();
  const [decision, setDecision] = useState<ConsentChoice | null>(null);
  const [open, setOpen] = useState(true);
  const text = copy[lang];
  const privacyHref = lang === "ar" ? "/privacy" : "/en/privacy";

  const choose = (nextDecision: ConsentChoice) => {
    setDecision(nextDecision);
    publishAnalyticsConsentDecision(nextDecision);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 start-4 z-[70] inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black shadow-xl transition hover:border-primary"
        aria-label={text.settings}
      >
        <Settings2 className="h-4 w-4" />
        {text.settings}
      </button>
    );
  }

  return (
    <section
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-3xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5"
      aria-label={text.title}
      role="region"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-black sm:text-lg">{text.title}</h2>
            {decision && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
                aria-label={text.close}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{text.description}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-xl bg-deep px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              {text.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-black transition hover:border-primary hover:bg-primary/5"
            >
              {text.reject}
            </button>
            <a
              href={privacyHref}
              className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-bold text-primary underline-offset-4 hover:underline"
            >
              {text.privacy}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
