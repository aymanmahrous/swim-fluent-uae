import { useEffect } from "react";

function classifyConversion(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";

  if (href === "#book") return { eventName: "assessment_cta_click", ctaId: "assessment_request" };
  if (href.startsWith("mailto:")) return { eventName: "email_click", ctaId: "operational_email" };
  if (href.includes("maps.app.goo.gl") || href.includes("google.com/maps")) {
    return { eventName: "location_map_click", ctaId: "training_location_map" };
  }

  return null;
}

export function ConversionEventBridge() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const conversion = classifyConversion(anchor);
      if (!conversion) return;

      window.dispatchEvent(
        new CustomEvent("relaxfix:analytics-event", {
          detail: {
            ...conversion,
            source: "website",
            path: window.location.pathname,
          },
        }),
      );
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
