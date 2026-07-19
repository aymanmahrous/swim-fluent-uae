import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../../components/privacy-page";

export const Route = createFileRoute("/en/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy information | Relax Fix UAE" },
      {
        name: "description",
        content: "Information about the use and protection of assessment and booking-request data at Relax Fix UAE.",
      },
      { name: "robots", content: "index,follow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.relaxfixuae.com/en/privacy" },
      { rel: "alternate", hrefLang: "ar-AE", href: "https://www.relaxfixuae.com/privacy" },
      { rel: "alternate", hrefLang: "en-AE", href: "https://www.relaxfixuae.com/en/privacy" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.relaxfixuae.com/privacy" },
    ],
  }),
  component: () => <PrivacyPage language="en" />,
});
