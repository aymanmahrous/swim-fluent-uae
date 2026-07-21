import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../components/privacy-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "معلومات الخصوصية | Relax Fix UAE" },
      {
        name: "description",
        content: "معلومات استخدام وحماية بيانات طلبات التقييم والحجز لدى Relax Fix UAE.",
      },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: () => <PrivacyPage language="ar" />,
});
