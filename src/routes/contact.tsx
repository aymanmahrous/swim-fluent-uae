import { createFileRoute } from "@tanstack/react-router";
import { PublicContactPage } from "../components/public-contact-page";
import { publicContactHead } from "../platform/public-seo";

export const Route = createFileRoute("/contact")({
  head: () => publicContactHead("ar"),
  component: () => <PublicContactPage language="ar" />,
});
