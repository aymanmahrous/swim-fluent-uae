import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Settings, Waves, Sparkles } from "lucide-react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider, useLang } from "../lib/i18n";
import { Toaster } from "../components/ui/sonner";

const aiOsEnabled = import.meta.env.VITE_ENABLE_AI_OS === "true";
const legacyAdminEnabled = import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "root" });
  }, [error]);
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
        content:
          "Book swimming lessons in Abu Dhabi with Coach Ayman. Opening offer 150 AED / 45 min. Free first assessment.",
      },
      { property: "og:title", content: "Relax Fix UAE — Coach Ayman | Swimming Academy Abu Dhabi" },
      {
        property: "og:description",
        content:
          "Book swimming lessons in Abu Dhabi with Coach Ayman. Opening offer 150 AED / 45 min. Free first assessment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Relax Fix UAE — Coach Ayman | Swimming Academy Abu Dhabi",
      },
      {
        name: "twitter:description",
        content:
          "Book swimming lessons in Abu Dhabi with Coach Ayman. Opening offer 150 AED / 45 min. Free first assessment.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6e7fbc74-37d2-4b77-8c6c-f04867510e5b",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6e7fbc74-37d2-4b77-8c6c-f04867510e5b",
      },
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
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-aqua grid place-items-center shadow-glow group-hover:scale-105 transition">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm sm:text-base">{tr("brand")}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Coach Ayman</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link to="/" className="text-sm px-3 py-2 rounded-lg hover:bg-muted transition">
            {tr("home")}
          </Link>
          {aiOsEnabled && (
            <Link to="/os" className="text-sm px-3 py-2 rounded-lg hover:bg-muted transition">
              <Sparkles className="me-1 inline h-4 w-4" />
              AI OS
            </Link>
          )}
          {legacyAdminEnabled && (
            <Link to="/admin" className="text-sm px-3 py-2 rounded-lg hover:bg-muted transition">
              {tr("admin")}
            </Link>
          )}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition"
            aria-label="Language"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs font-semibold">{lang === "ar" ? "EN" : "ع"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { tr } = useLang();
  return (
    <footer className="mt-24 border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">{tr("slogan")}</p>
        <p>{tr("footer")}</p>
        <a
          href="https://wa.me/971551378660"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-primary hover:underline"
        >
          +971 55 137 8660
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
        <div className="min-h-screen flex flex-col">
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
