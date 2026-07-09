import type { ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as PublicHomeDefinition } from "../components/public-home";
import { publicHomeHead } from "../platform/public-seo";

const PublicHomeComponent = PublicHomeDefinition.options.component as ComponentType;

export const Route = createFileRoute("/en")({
  head: () => publicHomeHead("en"),
  component: EnglishPublicHome,
});

function EnglishPublicHome() {
  return <PublicHomeComponent />;
}
