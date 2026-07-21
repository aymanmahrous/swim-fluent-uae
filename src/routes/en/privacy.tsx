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
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: () => <PrivacyPage language="en" />,
});
