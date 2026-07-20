export type PublicAnalyticsEvent =
  "booking_complete" | "conversation_start" | "whatsapp_click" | "call_click";

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
let consentConfigured = false;
let consentGranted = false;

function validMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]+$/i.test(value));
}

function ensureGtag(): boolean {
  if (typeof window === "undefined") return false;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(..._args: unknown[]) {
      // Google Tag's queue protocol requires the function's Arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

  return true;
}

function configureDefaultConsent(): boolean {
  if (consentConfigured) return true;
  if (!ensureGtag() || !window.gtag) return false;

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  consentConfigured = true;
  return true;
}

export function grantAnalyticsConsent(): boolean {
  if (!configureDefaultConsent() || !window.gtag) return false;

  consentGranted = true;
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  return initializeAnalytics();
}

export function denyAnalyticsConsent() {
  if (!configureDefaultConsent() || !window.gtag) return;

  consentGranted = false;
  window.gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function analyticsReady(): boolean {
  return initialized && consentGranted;
}

function initializeAnalytics(): boolean {
  if (initialized) return true;
  if (!consentGranted || !analyticsEnabled || !validMeasurementId(measurementId)) return false;

  if (!configureDefaultConsent() || !window.gtag || typeof document === "undefined") return false;

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-relaxfix-analytics="gtag"]',
  );

  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.relaxfixAnalytics = "gtag";
    document.head.appendChild(script);
  }

  initialized = true;
  return true;
}

configureDefaultConsent();

export function trackPublicEvent(
  eventName: PublicAnalyticsEvent,
  parameters: SafeEventParameters = {},
): boolean {
  if (!analyticsReady() || !window.gtag) return false;

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(
      ([, value]) => typeof value === "string" && value.length <= 80,
    ),
  );

  window.gtag("event", eventName, safeParameters);
  return true;
}
