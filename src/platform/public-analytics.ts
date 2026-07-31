import type { PublicCtaId } from "./public-cta-registry";

export type PublicAnalyticsEvent =
  | "booking_complete"
  | "conversation_start"
  | "whatsapp_click"
  | "call_click";

export type PublicAnalyticsParameters = {
  language?: "ar" | "en";
  source?: "website" | "chatbot" | "booking-success";
  cta_id?: PublicCtaId;
};

const ALLOWED_PARAMETER_KEYS = new Set<keyof PublicAnalyticsParameters>([
  "language",
  "source",
  "cta_id",
]);
const ALLOWED_LANGUAGES = new Set(["ar", "en"]);
const ALLOWED_SOURCES = new Set(["website", "chatbot", "booking-success"]);

const FORBIDDEN_VALUE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d[\d\s().-]{7,}\d)/,
  /https?:\/\//i,
  /(?:gclid|gbraid|wbraid|fbclid)=/i,
];

const PREVIEW_HOST_SUFFIX = ".vercel.app";
const previewAnalyticsEnabled = import.meta.env.VITE_ENABLE_PREVIEW_GA4 === "true";
const previewMeasurementId = import.meta.env.VITE_PREVIEW_GA4_MEASUREMENT_ID?.trim();
const deploymentEnvironment = import.meta.env.VITE_DEPLOYMENT_ENV;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let consentConfigured = false;
let consentGranted = false;

function validMeasurementId(value: string | undefined): value is string {
  return Boolean(value && /^G-[A-Z0-9]+$/i.test(value));
}

function isApprovedPreviewHost(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase();
  return normalizedHostname.endsWith(PREVIEW_HOST_SUFFIX);
}

function previewRuntimeAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return deploymentEnvironment === "preview" && isApprovedPreviewHost(window.location.hostname);
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

export function previewAnalyticsRuntimeReady(): boolean {
  return (
    previewAnalyticsEnabled &&
    validMeasurementId(previewMeasurementId) &&
    previewRuntimeAllowed()
  );
}

function initializeAnalytics(): boolean {
  if (initialized) return true;
  if (!consentGranted || !previewAnalyticsRuntimeReady()) return false;

  if (!configureDefaultConsent() || !window.gtag || typeof document === "undefined") return false;

  window.gtag("js", new Date());
  window.gtag("config", previewMeasurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    debug_mode: true,
  });

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-relaxfix-analytics="gtag-preview"]',
  );

  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(previewMeasurementId)}`;
    script.dataset.relaxfixAnalytics = "gtag-preview";
    document.head.appendChild(script);
  }

  initialized = true;
  return true;
}

function sanitizeParameters(parameters: PublicAnalyticsParameters): PublicAnalyticsParameters | null {
  const entries = Object.entries(parameters);

  if (entries.some(([key]) => !ALLOWED_PARAMETER_KEYS.has(key as keyof PublicAnalyticsParameters))) {
    return null;
  }

  const safeParameters = Object.fromEntries(
    entries.filter(([, value]) => typeof value === "string" && value.length <= 80),
  ) as PublicAnalyticsParameters;

  if (safeParameters.language && !ALLOWED_LANGUAGES.has(safeParameters.language)) {
    return null;
  }

  if (safeParameters.source && !ALLOWED_SOURCES.has(safeParameters.source)) {
    return null;
  }

  if (
    Object.values(safeParameters).some((value) =>
      FORBIDDEN_VALUE_PATTERNS.some((pattern) => pattern.test(value ?? "")),
    )
  ) {
    return null;
  }

  return safeParameters;
}

configureDefaultConsent();

export function trackPublicEvent(
  eventName: PublicAnalyticsEvent,
  parameters: PublicAnalyticsParameters = {},
): boolean {
  if (!analyticsReady() || !window.gtag) return false;

  const safeParameters = sanitizeParameters(parameters);
  if (!safeParameters) return false;

  window.gtag("event", eventName, safeParameters);
  return true;
}
