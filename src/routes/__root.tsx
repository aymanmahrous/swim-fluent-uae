import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { Languages, MessageCircle, Sparkles, Waves } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "../components/ui/sonner";
import { LangProvider, useLang, type Lang } from "../lib/i18n";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";
import premiumCss from "../premium.css?url";
import appCss from "../styles.css?url";

const aiOsEnabled = import.meta.env.VITE_ENABLE_AI_OS === "true";
const legacyAdminEnabled = import.meta.env.VITE_ENABLE_LEGACY_ADMIN === "true";

function localizedPublicLanguage(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
}

function NotFoundComponent() {
  const { tr } = useLang();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="text-7xl font-black text-deep">404</div>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-deep px-5 py-3 text-sm font-black text-white"
        >
          {tr("home")}
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
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-black">Something went wrong</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-xl bg-deep px-5 py-3 text-sm font-black text-white"
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
      { title: "Relax Fix UAE — Coach Ayman | Swimming & Water Confidence Abu Dhabi" },
      {
        name: "description",
        content:
          "Premium swimming and water-confidence coaching in Abu Dhabi with Coach Ayman.",
      },
      { property: "og:title", content: "Relax Fix UAE — Coach Ayman" },
      {
        property: "og:description",
        content: "Swimming and water-confidence coaching in Abu Dhabi with Coach Ayman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: premiumCss },
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
  const pathname = useLocation({ select: (location) => location.pathname });
  const pageLang = localizedPublicLanguage(pathname);

  return (
    <html lang={pageLang} dir={pageLang === "ar" ? "rtl" : "ltr"}>
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
  const pathname = useLocation({ select: (location) => location.pathname });
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const isPublicHome = pathname === "/" || pathname === "/en";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-aqua shadow-glow transition group-hover:scale-105">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-black sm:text-base">{settings.businessName}</div>
            <div className="truncate text-[10px] text-muted-foreground sm:text-xs">{settings.coachName}</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={isPublicHome ? "#programs" : "/#programs"}
            className="hidden rounded-xl px-3 py-2 text-sm font-bold transition hover:bg-muted md:inline-flex"
          >
            {tr("viewPrograms")}
          </a>
          <a
            href={isPublicHome ? "#book" : "/#book"}
            className="inline-flex items-center gap-2 rounded-xl bg-deep px-3 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 sm:px-4 sm:text-sm"
          >
            <Waves className="h-4 w-4" /> {tr("book")}
          </a>
          {aiOsEnabled && (
            <Link to="/os" className="rounded-xl px-3 py-2 text-sm transition hover:bg-muted">
              <Sparkles className="me-1 inline h-4 w-4" /> AI OS
            </Link>
          )}
          {legacyAdminEnabled && (
            <Link to="/admin" className="rounded-xl px-3 py-2 text-sm transition hover:bg-muted">
              {tr("admin")}
            </Link>
          )}
          {isPublicHome ? (
            lang === "ar" ? (
              <Link
                to="/en"
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 transition hover:border-primary hover:bg-primary/5"
                aria-label="View English version"
              >
                <Languages className="h-4 w-4" />
                <span className="text-xs font-black">EN</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 transition hover:border-primary hover:bg-primary/5"
                aria-label="عرض النسخة العربية"
              >
                <Languages className="h-4 w-4" />
                <span className="text-xs font-black">ع</span>
              </Link>
            )
          ) : (
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 transition hover:border-primary hover:bg-primary/5"
              aria-label="Switch language"
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs font-black">{lang === "ar" ? "EN" : "ع"}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { tr } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const canContact = Boolean(settings.whatsappNumber && settings.publicPhone);

  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-aqua">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black">{settings.businessName}</div>
              <div className="text-xs text-white/60">{settings.coachName}</div>
            </div>
          </div>
          <p className="mt-5 max-w-xl font-bold text-white/80">{tr("slogan")}</p>
          <p className="mt-2 text-xs text-white/45">{tr("footer")}</p>
        </div>

        {canContact && (
          <a
            href={businessWhatsAppUrl(settings)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-black transition hover:bg-white/15"
          >
            <MessageCircle className="h-5 w-5 text-aqua" /> {settings.publicPhone}
          </a>
        )}
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useLocation({ select: (location) => location.pathname });
  const publicLang = localizedPublicLanguage(pathname);
  const isLocalizedPublicPage = pathname === "/" || pathname === "/en";

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider initialLang={publicLang} persistPreference={!isLocalizedPublicPage}>
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
