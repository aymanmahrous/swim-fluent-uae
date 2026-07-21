import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
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
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { z } from "zod";
import { useLang } from "../lib/i18n";

const aiOsEnabled = import.meta.env.VITE_ENABLE_AI_OS === "true";

const StaffSessionSchema = z.object({
  authenticated: z.literal(true),
  profile: z.object({
    id: z.string().uuid(),
    display_name: z.string(),
    role: z.enum(["super_admin", "admin", "reception", "coach", "content_manager"]),
    active: z.literal(true),
  }),
});

async function fetchStaffSession() {
  const response = await fetch("/api/staff-session", { headers: { Accept: "application/json" } });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("STAFF_SESSION_UNAVAILABLE");
  const parsed = StaffSessionSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_STAFF_SESSION");
  return parsed.data;
}

export const Route = createFileRoute("/os")({ component: OperatingSystemLayout });

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
  const sessionQuery = useQuery({
    queryKey: ["staff-session"],
    queryFn: fetchStaffSession,
    enabled: aiOsEnabled,
    retry: false,
  });

  if (!aiOsEnabled) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-muted/20 px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-7 text-center shadow-elegant">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-black">AI OS is not enabled</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This internal workspace is closed by configuration. Staff access remains available through the secure staff portal.
          </p>
          <Link to="/staff" className="mt-6 inline-flex rounded-xl bg-deep px-5 py-3 text-sm font-black text-white">
            Go to secure staff portal
          </Link>
        </div>
      </div>
    );
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-muted/20 px-6 text-center text-muted-foreground">
        Verifying active staff session...
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-muted/20 px-6">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-card p-7 text-center shadow-elegant">
          <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
          <h1 className="mt-4 text-xl font-black">Unable to verify staff access</h1>
          <p className="mt-2 text-sm text-muted-foreground">The AI OS remains closed until the staff session can be verified.</p>
        </div>
      </div>
    );
  }

  if (!sessionQuery.data) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-muted/20 px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-7 text-center shadow-elegant">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-2xl font-black">Staff access required</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Relax Fix AI OS is available only to active staff profiles verified by Supabase Auth and RBAC.
          </p>
          <Link to="/staff" className="mt-6 inline-flex rounded-xl bg-deep px-5 py-3 text-sm font-black text-white">
            Go to secure staff login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-border bg-card/80 p-4 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-e">
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 font-black">
              <Megaphone className="h-5 w-5 text-primary" /> Relax Fix AI OS
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Growth, sales, booking & content operations</p>
            <div className="mt-3 text-[11px] font-bold text-primary">
              {sessionQuery.data.profile.display_name} · {sessionQuery.data.profile.role}
            </div>
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
