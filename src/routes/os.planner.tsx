import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";
import { loadPlatformSnapshot, replaceContentPlan } from "../platform/data";
import type { PlatformSnapshot } from "../platform/types";

export const Route = createFileRoute("/os/planner")({ component: PlannerPage });

function PlannerPage() {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot>(() => loadPlatformSnapshot());
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">30-Day Content Planner</h1>
          <p className="mt-2 text-muted-foreground">
            A balanced month focused on bookings, trust, authority and education.
          </p>
        </div>
        <button
          onClick={() => setSnapshot((current) => replaceContentPlan(current))}
          className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground"
        >
          <RefreshCw className="me-2 inline h-4 w-4" /> Regenerate strategy
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {snapshot.content.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="h-4 w-4 text-primary" /> {item.date}
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase">
                {item.status}
              </span>
            </div>
            <div className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
              {item.platform} · {item.type} · {item.goal}
            </div>
            <h2 className="mt-2 text-lg font-black">{item.topic}</h2>
            <p className="mt-2 text-sm leading-6">{item.hook}</p>
            <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              CTA: {item.cta}
            </div>
            {item.status === "approved" && (
              <div className="mt-3 text-xs font-bold text-primary">
                <CheckCircle2 className="me-1 inline h-4 w-4" /> Approved
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
