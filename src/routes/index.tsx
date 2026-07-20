import type { ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookingAccessibilityBridge } from "../components/booking-accessibility-bridge";
import { ConversionEventBridge } from "../components/conversion-event-bridge";
import { MobileConversionBar } from "../components/mobile-conversion-bar";
import { Route as PublicHomeDefinition } from "../components/public-home";
import { RevenueSections } from "../components/revenue-sections";
import { publicHomeHead } from "../platform/public-seo";

const PublicHomeComponent = PublicHomeDefinition.options.component as ComponentType;

export const Route = createFileRoute("/")({
  head: () => publicHomeHead("ar"),
  component: ArabicPublicHome,
});

function ArabicPublicHome() {
  return (
    <>
      <BookingAccessibilityBridge />
      <ConversionEventBridge />
      <PublicHomeComponent />
      <RevenueSections />
      <MobileConversionBar />
    </>
  );
}
