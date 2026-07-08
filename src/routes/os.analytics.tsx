import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, Eye, MessageCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/os/analytics")({ component: AnalyticsPage });
function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Growth Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        The north-star path is content → conversation → qualified lead → booking.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {[
          [Eye, "15.4K", "Views"],
          [MessageCircle, "47", "DMs"],
          [TrendingUp, "21", "Qualified"],
          [BookOpenCheck, "8", "Bookings"],
        ].map(([Icon, value, label], index, list) => {
          const IconComponent = Icon as typeof Eye;
          return (
            <div key={label as string} className="contents">
              <div className="min-w-40 rounded-2xl border border-border bg-card p-5">
                <IconComponent className="h-5 w-5 text-primary" />
                <div className="mt-3 text-3xl font-black">{value as string}</div>
                <div className="text-sm text-muted-foreground">{label as string}</div>
              </div>
              {index < list.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="text-sm font-bold text-primary">ATTRIBUTION GOAL</div>
        <h2 className="mt-1 text-2xl font-black">
          Measure which content produces real bookings, not just likes.
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          The database migration includes campaign/content/lead attribution foundations so future
          provider metrics can connect publishing performance to CRM and booking outcomes.
        </p>
      </div>
    </div>
  );
}
