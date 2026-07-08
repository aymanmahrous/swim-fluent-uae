import { createFileRoute, redirect } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

const legacyAdminEnabled = import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (!legacyAdminEnabled) {
      throw redirect({ to: "/", replace: true });
    }
  },
  head: () => ({
    meta: [{ title: "Admin — Relax Fix UAE" }, { name: "robots", content: "noindex" }],
  }),
  component: LegacyAdminDisabled,
});

function LegacyAdminDisabled() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-6">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-elegant">
        <LockKeyhole className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-black">Staff authentication required</h1>
        <p className="mt-3 text-muted-foreground">
          The legacy browser-password admin has been retired. The production admin will be enabled
          only after server-verified staff authentication and role-based access control are in place.
        </p>
      </div>
    </div>
  );
}
