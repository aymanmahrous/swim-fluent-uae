import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Settings, Sparkles, Waves } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "../components/ui/sonner";
import { LangProvider, useLang } from "../lib/i18n";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";
import appCss from "../styles.css?url";

const aiOsEnabled = import.meta.env.VITE_ENABLE_AI_OS === "true";
const legacyAdminEnabled = import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "root" }), [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Relax Fix UAE — Coach Ayman | Swimming Academy Abu Dhabi" },
      {
        name: "description",
        content: "Swimming lessons and aquatic coaching in Abu Dhabi with Coach Ayman.",
      },
      { property: "og:title", content: "Relax Fix UAE — Coach Ayman" },
      {
        property: "og:description",
        content: "Swimming lessons and aquatic coaching in Abu Dhabi with Coach Ayman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Playfair+Display:wght@700;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Nav() {
  const { lang, setLang, tr } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-aqua shadow-glow transition group-hover:scale-105">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold sm:text-base">{settings.businessName}</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">{settings.coachName}</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link to="/" className="rounded-lg px-3 py-2 text-sm transition hover:bg-muted">
            {tr("home")}
          </Link>
          {aiOsEnabled && (
            <Link to="/os" className="rounded-lg px-3 py-2 text-sm transition hover:bg-muted">
              <Sparkles className="me-1 inline h-4 w-4" /> AI OS
            </Link>
          )}
          {legacyAdminEnabled && (
            <Link to="/admin" className="rounded-lg px-3 py-2 text-sm transition hover:bg-muted">
              {tr("admin")}
            </Link>
          )}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 transition hover:border-primary hover:bg-primary/5"
            aria-label="Language"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs font-semibold">{lang === "ar" ? "EN" : "ع"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { tr } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;

  return (
    <footer className="mt-24 border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">{tr("slogan")}</p>
        <p>{tr("footer")}</p>
        <a
          href={businessWhatsAppUrl(settings)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-primary hover:underline"
        >
          {settings.publicPhone}
        </a>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Toaster richColors position="top-center" />
        </div>
      </LangProvider>
    </QueryClientProvider>
  );
}
