import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  RotateCcw,
  Save,
  ShieldAlert,
  WandSparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  contentWorkflowErrorMessage,
  transitionContent,
  updateContent,
  type ContentUpdateInput,
} from "../platform/os-content-workflow";
import { fetchOsContentItems } from "../platform/os-read-models";

export const Route = createFileRoute("/os/planner")({ component: PlannerPage });

type EditDraft = Omit<ContentUpdateInput, "hashtags"> & { hashtagsText: string };

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

function parseHashtags(value: string): string[] {
  return [...new Set(value.split(/[,\n]+/).map((item) => item.trim()).filter(Boolean))];
}

function PlannerPage() {
  const queryClient = useQueryClient();
  const [scheduleValues, setScheduleValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const contentQuery = useQuery({
    queryKey: ["os", "content-items"],
    queryFn: fetchOsContentItems,
    retry: false,
  });

  async function invalidateWorkflowQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["os", "content-items"] }),
      queryClient.invalidateQueries({ queryKey: ["os", "command-center"] }),
      queryClient.invalidateQueries({ queryKey: ["os", "operations"] }),
    ]);
  }

  const transitionMutation = useMutation({
    mutationFn: transitionContent,
    onSuccess: async (result) => {
      toast.success(`Content item moved to ${result.status}.`);
      await invalidateWorkflowQueries();
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "CONTENT_TRANSITION_FAILED";
      toast.error(contentWorkflowErrorMessage(code));
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateContent,
    onSuccess: async () => {
      toast.success("Content changes saved and returned to needs_review.");
      setEditingId(null);
      setEditDraft(null);
      await invalidateWorkflowQueries();
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "CONTENT_UPDATE_FAILED";
      toast.error(contentWorkflowErrorMessage(code));
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

  function beginEdit(item: NonNullable<typeof contentQuery.data>[number]) {
    setEditingId(item.id);
    setEditDraft({
      contentItemId: item.id,
      topic: item.topic,
      hook: item.hook,
      caption: item.caption,
      cta: item.cta,
      hashtagsText: item.hashtags.join(", "),
      visualPrompt: item.visualPrompt,
    });
  }

  function saveEdit() {
    if (!editDraft || updateMutation.isPending) return;
    updateMutation.mutate({
      contentItemId: editDraft.contentItemId,
      topic: editDraft.topic,
      hook: editDraft.hook,
      caption: editDraft.caption,
      cta: editDraft.cta,
      hashtags: parseHashtags(editDraft.hashtagsText),
      visualPrompt: editDraft.visualPrompt,
    });
  }

  const busy = transitionMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Content Planner</h1>
          <p className="mt-2 text-muted-foreground">
            Edit, review, approve, and schedule real Supabase content. Any edit forces a fresh review and clears an active publish schedule.
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
          const editing = editingId === item.id && editDraft?.contentItemId === item.id;

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

              {editing && editDraft ? (
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-black">
                    Topic
                    <input
                      value={editDraft.topic}
                      maxLength={300}
                      onChange={(event) => setEditDraft({ ...editDraft, topic: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-black">
                    Hook
                    <textarea
                      value={editDraft.hook}
                      maxLength={500}
                      rows={2}
                      onChange={(event) => setEditDraft({ ...editDraft, hook: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-black">
                    Caption
                    <textarea
                      value={editDraft.caption}
                      minLength={2}
                      maxLength={5000}
                      rows={7}
                      required
                      onChange={(event) => setEditDraft({ ...editDraft, caption: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-black">
                    CTA
                    <textarea
                      value={editDraft.cta}
                      maxLength={500}
                      rows={2}
                      onChange={(event) => setEditDraft({ ...editDraft, cta: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-black">
                    Hashtags · comma or new line separated
                    <textarea
                      value={editDraft.hashtagsText}
                      rows={3}
                      onChange={(event) => setEditDraft({ ...editDraft, hashtagsText: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs font-black">
                    Visual prompt
                    <textarea
                      value={editDraft.visualPrompt}
                      maxLength={2000}
                      rows={3}
                      onChange={(event) => setEditDraft({ ...editDraft, visualPrompt: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={busy || editDraft.caption.trim().length < 2}
                      onClick={saveEdit}
                      className="rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-40"
                    >
                      <Save className="me-1 inline h-4 w-4" /> Save & review again
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft(null);
                      }}
                      className="rounded-xl border border-border px-3 py-2.5 text-sm font-black disabled:opacity-40"
                    >
                      <X className="me-1 inline h-4 w-4" /> Cancel edit
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                      {item.platform} · {item.contentType}
                    </div>
                    <button
                      type="button"
                      disabled={item.status === "published" || busy}
                      onClick={() => beginEdit(item)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-black disabled:opacity-40"
                    >
                      <Pencil className="me-1 inline h-3.5 w-3.5" /> Edit
                    </button>
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
                </>
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
