import { CalendarCheck2, MessageCircle } from "lucide-react";
import { useLang } from "../lib/i18n";
import { operationalWhatsAppUrl } from "../platform/public-business-config";

function trackWhatsApp() {
  window.dispatchEvent(
    new CustomEvent("relaxfix:analytics-event", {
      detail: {
        eventName: "whatsapp_click",
        ctaId: "mobile_conversion_bar",
        source: "website",
        path: window.location.pathname,
      },
    }),
  );
}

export function MobileConversionBar() {
  const { lang } = useLang();
  const isArabic = lang === "ar";
  const message = isArabic
    ? "مرحبًا، أريد معرفة أنسب تدريب وطلب تقييم أولي."
    : "Hello, I would like to find the most suitable coaching option and request an initial assessment.";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,.14)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        <a
          href="#book"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-deep px-3 py-3 text-center text-sm font-black text-white"
        >
          <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
          {isArabic ? "اطلب تقييمًا" : "Request assessment"}
        </a>
        <a
          href={operationalWhatsAppUrl(message)}
          target="_blank"
          rel="noreferrer"
          onClick={trackWhatsApp}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-black text-white"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {isArabic ? "واتساب" : "WhatsApp"}
        </a>
      </div>
    </div>
  );
}
