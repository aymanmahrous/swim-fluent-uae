import { BarChart3, Settings2, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "../lib/i18n";
import {
  publishAnalyticsConsentDecision,
  type AnalyticsConsentDecision,
} from "./analytics-consent-bridge";

export type ConsentChoice = AnalyticsConsentDecision;

// DRAFT COPY — PENDING LEGAL APPROVAL, do not treat as final.
// This banner copy has not been reviewed or approved as final legal wording
// (see docs/privacy/PRIVACY_ANALYTICS_OWNER_DECISION_PACK.md, D12).
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
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] start-3 z-[70] inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-black shadow-xl transition hover:border-primary md:bottom-4 md:start-4"
        aria-label={text.settings}
      >
        <Settings2 className="h-4 w-4" />
        {text.settings}
      </button>
    );
  }

  return (
    <section
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-background/97 p-3 shadow-2xl backdrop-blur-xl sm:p-4 md:bottom-3"
      aria-label={text.title}
      role="region"
    >
      <div className="flex items-start gap-3">
        <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:grid">
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
          <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{text.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="min-h-11 rounded-xl bg-deep px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 sm:px-4 sm:text-sm"
            >
              {text.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="min-h-11 rounded-xl border border-border px-3 py-2 text-xs font-black transition hover:border-primary hover:bg-primary/5 sm:px-4 sm:text-sm"
            >
              {text.reject}
            </button>
            <a
              href={privacyHref}
              className="col-span-2 inline-flex min-h-11 items-center justify-center px-3 py-2 text-xs font-bold text-primary underline-offset-4 hover:underline sm:text-sm"
            >
              {text.privacy}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
