import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n";
import {
  denyAnalyticsConsent,
  grantAnalyticsConsent,
  trackPublicPageView,
} from "../platform/public-analytics";
import {
  capturePublicAttributionAfterConsent,
  clearPublicAttribution,
} from "../platform/public-attribution";

export const ANALYTICS_CONSENT_EVENT = "relaxfix:analytics-consent";

export type AnalyticsConsentDecision = "accepted" | "rejected";

export function publishAnalyticsConsentDecision(
  decision: AnalyticsConsentDecision,
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AnalyticsConsentDecision>(ANALYTICS_CONSENT_EVENT, {
      detail: decision,
    }),
  );
}

export function AnalyticsConsentBridge() {
  const { lang } = useLang();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    denyAnalyticsConsent();

    const handleDecision = (event: Event) => {
      const decision = (event as CustomEvent<AnalyticsConsentDecision>).detail;

      if (decision === "accepted") {
        capturePublicAttributionAfterConsent(window.location.search);
        grantAnalyticsConsent();
        setConsentAccepted(true);
        return;
      }

      setConsentAccepted(false);
      clearPublicAttribution();
      denyAnalyticsConsent();
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleDecision);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleDecision);
  }, []);

  useEffect(() => {
    if (!consentAccepted) return;
    trackPublicPageView(pathname, lang);
  }, [consentAccepted, lang, pathname]);

  return null;
}
