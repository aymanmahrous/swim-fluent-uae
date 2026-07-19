export type PublicAnalyticsEvent =
  | "booking_complete"
  | "conversation_start"
  | "whatsapp_click"
  | "call_click";

type SafeEventParameters = {
  language?: "ar" | "en";
  source?: "website" | "chatbot" | "booking-success";
  cta_id?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const analyticsEnabled = import.meta.env.VITE_ENABLE_GA4 === "true";
const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();
let initialized = false;
let consentGranted = false;

function validMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]+$/i.test(value));
}

export function grantAnalyticsConsent(): boolean {
  consentGranted = true;
  return initializeAnalytics();
}

export function denyAnalyticsConsent() {
  consentGranted = false;
}

export function analyticsReady(): boolean {
  return initialized && consentGranted;
}

function initializeAnalytics(): boolean {
  if (initialized) return true;
  if (!consentGranted || !analyticsEnabled || !validMeasurementId(measurementId)) return false;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.relaxfixAnalytics = "gtag";
  document.head.appendChild(script);

  initialized = true;
  return true;
}

export function trackPublicEvent(
  eventName: PublicAnalyticsEvent,
  parameters: SafeEventParameters = {},
): boolean {
  if (!analyticsReady() || !window.gtag) return false;

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => typeof value === "string" && value.length <= 80),
  );

  window.gtag("event", eventName, safeParameters);
  return true;
}
