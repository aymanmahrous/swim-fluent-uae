import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ShieldAlert, WandSparkles } from "lucide-react";
import { fetchOsContentItems } from "../platform/os-read-models";

export const Route = createFileRoute("/os/planner")({ component: PlannerPage });

function displayDate(value: string | null, fallback: string): string {
  const source = value ?? fallback;
  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime())
    ? source
    : new Intl.DateTimeFormat("en-AE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dubai",
      }).format(parsed);
}

function PlannerPage() {
  const contentQuery = useQuery({
    queryKey: ["os", "content-items"],
    queryFn: fetchOsContentItems,
    retry: false,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Content Planner</h1>
          <p className="mt-2 text-muted-foreground">
            Real content items from Supabase. Unscheduled generated items remain in review rather than receiving invented calendar dates.
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
        {contentQuery.data?.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="h-4 w-4 text-primary" />
                {item.scheduledFor
                  ? displayDate(item.scheduledFor, item.createdAt)
                  : `Unscheduled · created ${displayDate(null, item.createdAt)}`}
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase">
                {item.status}
              </span>
            </div>
            <div className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">
              {item.platform} · {item.contentType}
            </div>
            <h2 className="mt-2 text-lg font-black">{item.topic || "Untitled content item"}</h2>
            <p className="mt-2 text-sm leading-6">{item.hook || item.caption}</p>
            <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              CTA: {item.cta || "Not set"}
            </div>
            {item.status === "approved" && (
              <div className="mt-3 text-xs font-bold text-primary">
                <CheckCircle2 className="me-1 inline h-4 w-4" /> Approved
              </div>
            )}
          </article>
        ))}

        {contentQuery.isLoading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading content items...
          </div>
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
