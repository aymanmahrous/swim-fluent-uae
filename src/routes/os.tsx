import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  CalendarDays,
  ContactRound,
  Inbox,
  LayoutDashboard,
  Library,
  Megaphone,
  Settings2,
  Workflow,
} from "lucide-react";
import { useLang } from "../lib/i18n";

const aiOsEnabled = import.meta.env.VITE_ENABLE_AI_OS === "true";

export const Route = createFileRoute("/os")({
  beforeLoad: () => {
    if (!aiOsEnabled) {
      throw redirect({ to: "/", replace: true });
    }
  },
  component: OperatingSystemLayout,
});

const items = [
  ["/os", "Command Center", LayoutDashboard],
  ["/os/inbox", "AI Inbox", Inbox],
  ["/os/crm", "CRM", ContactRound],
  ["/os/automations", "Automations", Workflow],
  ["/os/content", "AI Content Studio", Bot],
  ["/os/planner", "30-Day Planner", CalendarDays],
  ["/os/media", "Media Library", Library],
  ["/os/analytics", "Analytics", BarChart3],
  ["/os/integrations", "Integrations", Settings2],
] as const;

function OperatingSystemLayout() {
  const { dir } = useLang();
  return (
    <div dir={dir} className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-border bg-card/80 p-4 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-e">
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 font-black">
              <Megaphone className="h-5 w-5 text-primary" /> Relax Fix AI OS
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Growth, sales, booking & content operations
            </p>
          </div>
          <nav className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {items.map(([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/os" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-muted [&.active]:bg-primary [&.active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
