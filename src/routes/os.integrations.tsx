import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { loadPlatformSnapshot } from "../platform/data";

export const Route = createFileRoute("/os/integrations")({ component: IntegrationsPage });
function IntegrationsPage() {
  const snapshot = loadPlatformSnapshot();
  return (
    <div>
      <h1 className="text-3xl font-black">Integrations</h1>
      <p className="mt-2 text-muted-foreground">
        Secrets stay server-side. Public/client configuration is separated from privileged provider
        credentials.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.integrations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-black">{item.label}</div>
              {item.configured ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <CircleAlert className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{item.detail}</div>
            <div
              className={`mt-4 text-xs font-black ${item.configured ? "text-primary" : "text-amber-700"}`}
            >
              {item.configured ? "CONFIGURED" : "ACTION REQUIRED"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
