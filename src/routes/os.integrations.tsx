import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, ShieldAlert } from "lucide-react";
import { fetchProviderStatuses } from "../platform/provider-status";

export const Route = createFileRoute("/os/integrations")({ component: IntegrationsPage });

function IntegrationsPage() {
  const providersQuery = useQuery({
    queryKey: ["os", "integrations"],
    queryFn: fetchProviderStatuses,
    retry: false,
  });

  return (
    <div>
      <h1 className="text-3xl font-black">Integrations</h1>
      <p className="mt-2 text-muted-foreground">
        Server-side readiness only. Secret values are never returned to the browser.
      </p>

      {providersQuery.isError && (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" />
          {providersQuery.error.message === "UNAUTHORIZED"
            ? "Staff session required."
            : "Unable to read integration readiness from the server."}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providersQuery.data?.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black">{item.label}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.provider ?? "provider not selected"}
                </div>
              </div>
              {item.executable ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <CircleAlert className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black">
              <span className={`rounded-full px-2.5 py-1 ${item.configured ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-700"}`}>
                {item.configured ? "CONFIG PRESENT" : "CONFIG MISSING"}
              </span>
              <span className={`rounded-full px-2.5 py-1 ${item.executable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {item.executable ? "EXECUTABLE" : "ADAPTER NOT READY"}
              </span>
            </div>
          </div>
        ))}
        {providersQuery.isLoading && (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Reading server-side provider readiness...
          </div>
        )}
      </div>
    </div>
  );
}
