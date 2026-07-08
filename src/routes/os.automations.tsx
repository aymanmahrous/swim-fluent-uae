import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Clock3, RefreshCw, ShieldAlert, UserRoundCheck } from "lucide-react";
import { fetchOperationsQueue } from "../platform/os-operations-data";

export const Route = createFileRoute("/os/automations")({ component: AutomationPage });

function dubaiTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(date);
}

function AutomationPage() {
  const queueQuery = useQuery({
    queryKey: ["os", "operations"],
    queryFn: fetchOperationsQueue,
    retry: false,
    refetchInterval: 60_000,
  });
  const queue = queueQuery.data;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Operations Queue</h1>
          <p className="mt-2 text-muted-foreground">
            Real follow-up and background job state from Supabase. This page does not pretend a visual flow is executing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => queueQuery.refetch()}
          disabled={queueQuery.isFetching}
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw className={`me-2 inline h-4 w-4 ${queueQuery.isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {queueQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to load the operations queue from Supabase.
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Follow-up jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Scheduled CRM follow-ups and stop reasons.</p>
            </div>
            <Clock3 className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {queue?.followUps.map((job) => (
              <article key={job.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{job.leadName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Attempt {job.attemptNumber} · {dubaiTime(job.scheduledFor)}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase">{job.status}</span>
                </div>
                {job.stoppedReason && (
                  <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800">Stopped: {job.stoppedReason}</div>
                )}
              </article>
            ))}
            {!queueQuery.isLoading && queue && queue.followUps.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No follow-up jobs exist.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Background jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Real async worker queue state and retry information.</p>
            </div>
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {queue?.backgroundJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{job.jobType}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Attempts {job.attemptCount} · created {dubaiTime(job.createdAt)}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase">{job.status}</span>
                </div>
                {job.nextRetryAt && <div className="mt-3 text-xs text-muted-foreground">Next retry: {dubaiTime(job.nextRetryAt)}</div>}
                {job.lastError && (
                  <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{job.lastError}</div>
                )}
              </article>
            ))}
            {!queueQuery.isLoading && queue && queue.backgroundJobs.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No background jobs exist.</div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
        <UserRoundCheck className="me-2 inline h-5 w-5" />
        Visual automation editing and worker execution are not claimed here. This page reports persisted queue state only; provider/channel workers still require real adapters and credentials.
      </div>
    </div>
  );
}
