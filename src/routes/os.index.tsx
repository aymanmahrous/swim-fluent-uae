import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarCheck2,
  Flame,
  MessageSquareReply,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
import { fetchCommandCenter } from "../platform/os-read-models";

export const Route = createFileRoute("/os/")({ component: CommandCenter });

function Metric({ label, value, icon: Icon }: { label: string; value: number | null; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-3 text-3xl font-black">{value === null ? "—" : value.toLocaleString()}</div>
    </div>
  );
}

function CommandCenter() {
  const dashboardQuery = useQuery({
    queryKey: ["os", "command-center"],
    queryFn: fetchCommandCenter,
    retry: false,
  });
  const dashboard = dashboardQuery.data?.dashboard;
  const metrics = dashboard?.metrics;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold text-primary">RELAX FIX OPERATIONS</p>
        <h1 className="mt-1 text-4xl font-black">Coach Ayman Command Center</h1>
        <p className="mt-2 text-muted-foreground">
          ركز على ما يحتاج تدخلك الآن. كل رقم أدناه يأتي من Read Model محمي، وليس من Demo Snapshot.
        </p>
      </div>

      {dashboardQuery.isError && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to load the command center from Supabase.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="New leads" value={metrics?.newLeads ?? null} icon={Users} />
        <Metric label="Hot leads" value={metrics?.hotLeads ?? null} icon={Flame} />
        <Metric label="Human replies" value={metrics?.humanReplies ?? null} icon={MessageSquareReply} />
        <Metric label="Follow-ups due" value={metrics?.followUpsDue ?? null} icon={CalendarCheck2} />
        <Metric label="Posts scheduled" value={metrics?.postsScheduled ?? null} icon={Send} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Priority queue</h2>
          <div className="mt-4 space-y-3">
            {dashboard?.priorityQueue.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <div className="font-bold">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">{lead.intent} · {lead.channel}</div>
                  {lead.nextFollowUpAt && (
                    <div className="mt-1 text-xs text-muted-foreground">Follow-up: {lead.nextFollowUpAt}</div>
                  )}
                </div>
                <div className="text-end">
                  <div className="font-black text-primary">{lead.score}/100</div>
                  {lead.humanRequired && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Human required
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!dashboardQuery.isLoading && dashboard && dashboard.priorityQueue.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No hot or human-required leads are currently in the queue.
              </div>
            )}
            {dashboardQuery.isLoading && <div className="text-sm text-muted-foreground">Loading priority queue...</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">System readiness</h2>
          <div className="mt-4 space-y-3">
            {dashboardQuery.data?.providers.map((integration) => (
              <div key={integration.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/50 p-3">
                <div>
                  <div className="font-semibold">{integration.label}</div>
                  <div className="text-xs text-muted-foreground">{integration.detail}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${integration.executable ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-700"}`}>
                  {integration.executable ? "EXECUTABLE" : integration.configured ? "ADAPTER NEEDED" : "NOT CONFIGURED"}
                </span>
              </div>
            ))}
            {dashboardQuery.isLoading && <div className="text-sm text-muted-foreground">Reading server readiness...</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
