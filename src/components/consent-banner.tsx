export type ConsentChoice = "accepted" | "rejected";

/**
 * Consent UI is intentionally inert until UAE-qualified legal review and
 * explicit publication/activation approval are complete.
 *
 * Keeping this component mounted but empty prevents environment drift from
 * exposing unapproved consent copy or privacy links in Preview or Production.
 */
export function ConsentBanner() {
  return null;
}
