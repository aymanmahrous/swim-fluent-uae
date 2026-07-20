import type { ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ConversionEventBridge } from "../components/conversion-event-bridge";
import { Route as PublicHomeDefinition } from "../components/public-home";
import { RevenueSections } from "../components/revenue-sections";
import { publicHomeHead } from "../platform/public-seo";

const PublicHomeComponent = PublicHomeDefinition.options.component as ComponentType;

export const Route = createFileRoute("/en")({
  head: () => publicHomeHead("en"),
  component: EnglishPublicHome,
});

function EnglishPublicHome() {
  return (
    <>
      <ConversionEventBridge />
      <PublicHomeComponent />
      <RevenueSections />
    </>
  );
}
