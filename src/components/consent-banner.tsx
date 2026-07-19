import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "../lib/i18n";

export type ConsentChoice = "accepted" | "rejected";

const consentUiEnabled = import.meta.env.VITE_ENABLE_CONSENT_UI === "true";

export function ConsentBanner() {
  const { lang } = useLang();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);

  if (!consentUiEnabled || choice) return null;

  const isArabic = lang === "ar";
  const privacyPath = isArabic ? "/privacy" : "/en/privacy";

  function choose(nextChoice: ConsentChoice) {
    setChoice(nextChoice);
    window.dispatchEvent(
      new CustomEvent<ConsentChoice>("relaxfix:consent-choice", {
        detail: nextChoice,
      }),
    );
  }

  return (
    <section
      aria-label={isArabic ? "خيارات الخصوصية" : "Privacy choices"}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-3xl border border-border bg-background/98 p-5 shadow-elegant backdrop-blur-xl sm:inset-x-6 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-black">
            {isArabic ? "خيارات الخصوصية" : "Privacy choices"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isArabic
              ? "نستخدم القياس الاختياري فقط بعد موافقتك. رفض القياس لا يمنع تصفح الموقع أو الاتصال أو إرسال طلب التقييم."
              : "Optional measurement is used only after your consent. Rejecting measurement does not block browsing, contact, or assessment requests."}
          </p>
          <Link
            to={privacyPath}
            className="mt-2 inline-flex text-sm font-bold text-primary underline underline-offset-4"
          >
            {isArabic ? "اقرأ معلومات الخصوصية" : "Read privacy information"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-64">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-2xl border border-border px-4 py-3 text-sm font-black transition hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            {isArabic ? "رفض" : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-2xl border border-primary bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            {isArabic ? "قبول" : "Accept"}
          </button>
        </div>
      </div>
    </section>
  );
}
