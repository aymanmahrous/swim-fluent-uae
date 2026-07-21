/**
 * Analytics and consent-event wiring remain intentionally disabled until
 * legal review and explicit activation approval are complete.
 *
 * This inert bridge prevents Preview or Production environment drift from
 * enabling public measurement or consent listeners prematurely.
 */
export function AnalyticsConsentBridge() {
  return null;
}
