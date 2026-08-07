import { useEffect } from "react";
import {
  denyAnalyticsConsent,
  grantAnalyticsConsent,
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
  useEffect(() => {
    denyAnalyticsConsent();

    const handleDecision = (event: Event) => {
      const decision = (event as CustomEvent<AnalyticsConsentDecision>).detail;

      if (decision === "accepted") {
        capturePublicAttributionAfterConsent(window.location.search);
        grantAnalyticsConsent();
        return;
      }

      clearPublicAttribution();
      denyAnalyticsConsent();
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleDecision);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleDecision);
  }, []);

  return null;
}
