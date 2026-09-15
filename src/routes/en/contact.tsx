import { createFileRoute } from "@tanstack/react-router";
import { PublicContactPage } from "../../components/public-contact-page";
import { publicContactHead } from "../../platform/public-seo";

export const Route = createFileRoute("/en/contact")({
  head: () => publicContactHead("en"),
  component: () => <PublicContactPage language="en" />,
});
