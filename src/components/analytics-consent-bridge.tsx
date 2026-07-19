import { useEffect } from "react";
import { useLang } from "../lib/i18n";
import {
  denyAnalyticsConsent,
  grantAnalyticsConsent,
  trackPublicEvent,
  type PublicAnalyticsEvent,
} from "../platform/public-analytics";

type ConsentChoice = "accepted" | "rejected";

export function AnalyticsConsentBridge() {
  const { lang } = useLang();

  useEffect(() => {
    function handleConsent(event: Event) {
      const choice = (event as CustomEvent<ConsentChoice>).detail;
      if (choice === "accepted") grantAnalyticsConsent();
      if (choice === "rejected") denyAnalyticsConsent();
    }

    function handleConversationStart() {
      trackPublicEvent("conversation_start", {
        language: lang,
        source: "chatbot",
        cta_id: "chatbot_open",
      });
    }

    function handlePublicEvent(event: Event) {
      const detail = (event as CustomEvent<{
        eventName: PublicAnalyticsEvent;
        ctaId?: string;
        source?: "website" | "chatbot" | "booking-success";
      }>).detail;

      if (!detail?.eventName) return;
      trackPublicEvent(detail.eventName, {
        language: lang,
        source: detail.source,
        cta_id: detail.ctaId,
      });
    }

    window.addEventListener("relaxfix:consent-choice", handleConsent);
    window.addEventListener("relaxfix:conversation-start", handleConversationStart);
    window.addEventListener("relaxfix:analytics-event", handlePublicEvent);

    return () => {
      window.removeEventListener("relaxfix:consent-choice", handleConsent);
      window.removeEventListener("relaxfix:conversation-start", handleConversationStart);
      window.removeEventListener("relaxfix:analytics-event", handlePublicEvent);
    };
  }, [lang]);

  return null;
}
