import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarCheck2,
  Flame,
  MessageSquareReply,
  Send,
  Users,
} from "lucide-react";
import { loadPlatformSnapshot } from "../platform/data";

export const Route = createFileRoute("/os/")({ component: CommandCenter });

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function CommandCenter() {
  const snapshot = loadPlatformSnapshot();
  const hot = snapshot.leads.filter((lead) => lead.score >= 80);
  const human = snapshot.conversations.filter(
    (conversation) => conversation.mode === "human_required",
  );
  const followUps = snapshot.leads.filter((lead) => lead.nextFollowUpAt);
  const scheduled = snapshot.content.filter((item) => item.status === "scheduled");
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold text-primary">RELAX FIX OPERATIONS</p>
        <h1 className="mt-1 text-4xl font-black">Good morning, Coach Ayman 👋</h1>
        <p className="mt-2 text-muted-foreground">
          ركز على ما يحتاج تدخلك الآن. بقية النظام تُبنى حول الأتمتة الآمنة والقياس.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="New leads"
          value={
            snapshot.leads.filter((lead) => lead.stage === "new" || lead.stage === "contacted")
              .length
          }
          icon={Users}
        />
        <Metric label="Hot leads" value={hot.length} icon={Flame} />
        <Metric label="Human replies" value={human.length} icon={MessageSquareReply} />
        <Metric label="Follow-ups due" value={followUps.length} icon={CalendarCheck2} />
        <Metric label="Posts scheduled" value={scheduled.length} icon={Send} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Priority queue</h2>
          <div className="mt-4 space-y-3">
            {[...hot, ...snapshot.leads.filter((lead) => lead.humanRequired)]
              .filter((lead, index, all) => all.findIndex((x) => x.id === lead.id) === index)
              .map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <div className="font-bold">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.intent} · {lead.channel}
                    </div>
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
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">System readiness</h2>
          <div className="mt-4 space-y-3">
            {snapshot.integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-muted/50 p-3"
              >
                <div>
                  <div className="font-semibold">{integration.label}</div>
                  <div className="text-xs text-muted-foreground">{integration.detail}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${integration.configured ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-700"}`}
                >
                  {integration.configured ? "READY" : "NOT CONFIGURED"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
