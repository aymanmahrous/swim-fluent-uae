import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, Eye, MessageCircle, ShieldAlert, TrendingUp } from "lucide-react";
import { fetchGrowthAnalytics } from "../platform/os-read-models";

export const Route = createFileRoute("/os/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const analyticsQuery = useQuery({
    queryKey: ["os", "analytics"],
    queryFn: fetchGrowthAnalytics,
    retry: false,
  });
  const analytics = analyticsQuery.data;

  const metrics = [
    [Eye, analytics?.views ?? 0, "Recorded views"],
    [MessageCircle, analytics?.dms ?? 0, "Recorded DMs"],
    [TrendingUp, analytics?.qualifiedLeads ?? 0, "CRM qualified+"],
    [BookOpenCheck, analytics?.bookingRequests ?? 0, "Booking requests"],
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-black">Growth Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        Real recorded totals only. Cross-entity attribution is shown separately and is never inferred from unrelated counts.
      </p>

      {analyticsQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to load growth analytics from Supabase.
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {metrics.map(([Icon, value, label], index) => (
          <div key={label} className="contents">
            <div className="min-w-40 rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-3xl font-black">{analyticsQuery.isLoading ? "—" : value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
            {index < metrics.length - 1 && (
              <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
            )}
          </div>
        ))}
      </div>

      <div className={`mt-8 rounded-2xl border p-6 ${analytics?.attributionReady ? "border-primary/20 bg-primary/5" : "border-amber-500/30 bg-amber-500/10"}`}>
        <div className={`text-sm font-bold ${analytics?.attributionReady ? "text-primary" : "text-amber-700"}`}>
          {analytics?.attributionReady ? "ATTRIBUTION ACTIVE" : "ATTRIBUTION NOT YET CLAIMED"}
        </div>
        <h2 className="mt-1 text-2xl font-black">
          {analytics?.attributionReady
            ? "Content-to-booking attribution is populated."
            : "Current totals are real, but they are not presented as one conversion funnel yet."}
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {analytics?.note ?? "Loading analytics provenance..."}
        </p>
        {analytics && (
          <p className="mt-4 text-xs font-bold text-muted-foreground">
            Content items: {analytics.contentItems} · Published items: {analytics.publishedItems}
          </p>
        )}
      </div>
    </div>
  );
}
