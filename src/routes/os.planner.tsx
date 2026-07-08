import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, RotateCcw, ShieldAlert, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { fetchOsContentItems } from "../platform/os-read-models";

export const Route = createFileRoute("/os/planner")({ component: PlannerPage });

const TransitionResultSchema = z.object({
  success: z.literal(true),
  contentItemId: z.string().uuid(),
  status: z.enum(["idea", "draft", "generated", "needs_review", "approved", "scheduled", "published", "failed"]),
  scheduledFor: z.string().nullable(),
  updatedAt: z.string(),
});

const TransitionErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: z.string(),
  status: z.string().optional(),
});

type TransitionInput =
  | { contentItemId: string; action: "approve" | "return_to_review" | "unschedule" }
  | { contentItemId: string; action: "schedule"; scheduledFor: string };

function displayDate(value: string | null, fallback: string): string {
  const source = value ?? fallback;
  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime())
    ? source
    : new Intl.DateTimeFormat("en-AE", {
        dateStyle: "medium",
        timeStyle: value ? "short" : undefined,
        timeZone: "Asia/Dubai",
      }).format(parsed);
}

function dubaiInputValue(value?: string | null): string {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Dubai",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

function asDubaiOffset(localValue: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localValue)) return null;
  const candidate = `${localValue}:00+04:00`;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now() ? null : candidate;
}

async function transitionContent(input: TransitionInput) {
  const response = await fetch("/api/os-content-transition", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = TransitionErrorSchema.safeParse(body);
    throw new Error(error.success ? error.data.code : `CONTENT_TRANSITION_HTTP_${response.status}`);
  }
  const result = TransitionResultSchema.safeParse(body);
  if (!result.success) {
    const businessError = TransitionErrorSchema.safeParse(body);
    throw new Error(businessError.success ? businessError.data.code : "INVALID_CONTENT_TRANSITION_RESPONSE");
  }
  return result.data;
}

function PlannerPage() {
  const queryClient = useQueryClient();
  const [scheduleValues, setScheduleValues] = useState<Record<string, string>>({});
  const contentQuery = useQuery({
    queryKey: ["os", "content-items"],
    queryFn: fetchOsContentItems,
    retry: false,
  });

  const transitionMutation = useMutation({
    mutationFn: transitionContent,
    onSuccess: async (result) => {
      toast.success(`Content item moved to ${result.status}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["os", "content-items"] }),
        queryClient.invalidateQueries({ queryKey: ["os", "command-center"] }),
      ]);
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "CONTENT_TRANSITION_FAILED";
      const message =
        code === "APPROVAL_REQUIRED"
          ? "Approve this content item before scheduling it."
          : code === "INVALID_SCHEDULE_TIME"
            ? "Choose a future Dubai date and time."
            : code === "SCHEDULE_TOO_FAR"
              ? "The schedule time must be within 366 days."
              : code === "INVALID_TRANSITION"
                ? "This content status cannot perform the requested transition."
                : `Content workflow failed: ${code}`;
      toast.error(message);
    },
  });

  function scheduleItem(contentItemId: string, currentValue?: string | null) {
    const localValue = scheduleValues[contentItemId] ?? dubaiInputValue(currentValue);
    const scheduledFor = asDubaiOffset(localValue);
    if (!scheduledFor) {
      toast.error("Choose a valid future Dubai date and time.");
      return;
    }
    transitionMutation.mutate({ contentItemId, action: "schedule", scheduledFor });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Content Planner</h1>
          <p className="mt-2 text-muted-foreground">
            Review, approve, and schedule real Supabase content. Scheduling is interpreted explicitly in Asia/Dubai (+04:00).
          </p>
        </div>
        <Link to="/os/content" className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">
          <WandSparkles className="me-2 inline h-4 w-4" /> Open Content Studio
        </Link>
      </div>

      {contentQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" />
          {contentQuery.error.message === "UNAUTHORIZED"
            ? "Staff session required."
            : "Unable to load content items from Supabase."}
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {contentQuery.data?.map((item) => {
          const canApprove = ["draft", "generated", "needs_review", "approved"].includes(item.status);
          const canReview = ["draft", "generated", "needs_review", "approved", "scheduled", "failed"].includes(item.status);
          const canSchedule = item.status === "approved" || item.status === "scheduled";
          const busy = transitionMutation.isPending;
          return (
            <article key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {item.scheduledFor
                    ? displayDate(item.scheduledFor, item.createdAt)
                    : `Unscheduled · created ${displayDate(null, item.createdAt)}`}
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase">{item.status}</span>
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
                {item.platform} · {item.contentType}
              </div>
              <h2 className="mt-2 text-lg font-black">{item.topic || "Untitled content item"}</h2>
              <p className="mt-2 text-sm leading-6">{item.hook || item.caption}</p>
              <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                CTA: {item.cta || "Not set"}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!canApprove || item.status === "approved" || busy}
                  onClick={() => transitionMutation.mutate({ contentItemId: item.id, action: "approve" })}
                  className="rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-40"
                >
                  <CheckCircle2 className="me-1 inline h-4 w-4" /> Approve
                </button>
                <button
                  type="button"
                  disabled={!canReview || item.status === "needs_review" || busy}
                  onClick={() => transitionMutation.mutate({ contentItemId: item.id, action: "return_to_review" })}
                  className="rounded-xl border border-border px-3 py-2.5 text-sm font-black disabled:opacity-40"
                >
                  <RotateCcw className="me-1 inline h-4 w-4" /> Return to review
                </button>
              </div>

              {canSchedule && (
                <div className="mt-4 rounded-xl border border-border p-3">
                  <label className="text-xs font-black">Dubai schedule time</label>
                  <input
                    type="datetime-local"
                    value={scheduleValues[item.id] ?? dubaiInputValue(item.scheduledFor)}
                    onChange={(event) => setScheduleValues((current) => ({ ...current, [item.id]: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => scheduleItem(item.id, item.scheduledFor)}
                      className="rounded-lg bg-deep px-3 py-2 text-xs font-black text-white disabled:opacity-40"
                    >
                      {item.status === "scheduled" ? "Update schedule" : "Schedule"}
                    </button>
                    <button
                      type="button"
                      disabled={item.status !== "scheduled" || busy}
                      onClick={() => transitionMutation.mutate({ contentItemId: item.id, action: "unschedule" })}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-black disabled:opacity-40"
                    >
                      Unschedule
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {contentQuery.isLoading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading content items...</div>
        )}
        {!contentQuery.isLoading && !contentQuery.isError && contentQuery.data?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
            No content items exist in Supabase yet. The planner intentionally shows an empty state instead of a generated demo month.
          </div>
        )}
      </div>
    </div>
  );
}
