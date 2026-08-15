import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
let checks = 0;

async function text(path) {
  return readFile(join(root, path), "utf8");
}

function requireText(source, needle, label) {
  checks += 1;
  if (!source.includes(needle)) {
    throw new Error(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function forbidText(source, needle, label) {
  checks += 1;
  if (source.includes(needle)) {
    throw new Error(`${label}: forbidden ${JSON.stringify(needle)}`);
  }
}

const seo = await text("src/platform/public-seo.ts");
for (const needle of [
  'SITE_URL = "https://www.relaxfixuae.com"',
  'INSTAGRAM_URL = "https://www.instagram.com/relaxfixuae/"',
  "publicHomeHead(lang: PublicLanguage)",
  'rel: "canonical"',
  'hrefLang: "ar-AE"',
  'hrefLang: "en-AE"',
  'hrefLang: "x-default"',
  'property: "og:image"',
  'property: "og:image:alt"',
  'property: "og:image:type"',
  'name: "twitter:image"',
  'name: "twitter:image:alt"',
  'rel: "preload"',
  'as: "image"',
  'type: "image/avif"',
  'fetchPriority: "high"',
  '"@type": ["Organization", "LocalBusiness", "SportsActivityLocation"]',
  '"@type": "Person"',
  '"@type": "Service"',
  '"@type": "WebSite"',
  '"@type": "WebPage"',
  'name: "Abu Dhabi"',
  'name: "geo.region"',
  'content: "AE-AZ"',
  'type: "application/ld+json"',
]) {
  requireText(seo, needle, "public SEO contract");
}
for (const needle of [
  '"@type": "AggregateRating"',
  '"@type": "Review"',
  "streetAddress",
  "facebook.com/share/",
]) {
  forbidText(seo, needle, "truthful and non-duplicated structured head data");
}

const arabicRoute = await text("src/routes/index.tsx");
requireText(arabicRoute, 'publicHomeHead("ar")', "Arabic public route");
requireText(arabicRoute, 'createFileRoute("/")', "Arabic public route");
requireText(arabicRoute, "<RevenueSections />", "Arabic revenue-first public sections");

const englishRoute = await text("src/routes/en.tsx");
requireText(englishRoute, 'publicHomeHead("en")', "English public route");
requireText(englishRoute, 'createFileRoute("/en")', "English public route");
requireText(englishRoute, "<RevenueSections />", "English revenue-first public sections");

const publicHomeText = await text("src/components/public-home.tsx");
requireText(publicHomeText, "submitBookingRequest", "preserved booking page");
requireText(publicHomeText, "generateSlotsForDubaiDate", "preserved booking page");
requireText(publicHomeText, 'id="book"', "preserved booking page");
requireText(publicHomeText, "src={heroImg}", "SSR hero image discovery");
requireText(publicHomeText, "srcSet={heroAvif}", "AVIF hero source");
requireText(publicHomeText, "srcSet={heroWebp}", "WebP hero source");
requireText(publicHomeText, "width={1024}", "hero intrinsic dimensions");
requireText(publicHomeText, "height={1024}", "hero intrinsic dimensions");
requireText(publicHomeText, 'fetchPriority="high"', "first hero fetch priority");
requireText(publicHomeText, 'loading="lazy"', "below-the-fold hero loading");
requireText(publicHomeText, 'htmlFor="booking-full-name"', "booking full-name label association");
requireText(publicHomeText, 'id="booking-full-name"', "booking full-name accessible name");
requireText(publicHomeText, 'htmlFor="booking-phone"', "booking phone label association");
requireText(publicHomeText, 'id="booking-phone"', "booking phone accessible name");
requireText(publicHomeText, 'className="relative scroll-mt-24 bg-muted/55 py-24"', "booking sticky-header scroll offset");
requireText(publicHomeText, 'htmlFor="booking-location"', "booking location label association");
requireText(publicHomeText, 'id="booking-location"', "booking location accessible name");
requireText(publicHomeText, 'htmlFor="booking-other-location"', "booking other-location label association");
requireText(publicHomeText, 'id="booking-other-location"', "booking other-location accessible name");
requireText(publicHomeText, "<fieldset>", "booking grouped controls semantics");
requireText(publicHomeText, "<legend className={labelClass}>", "booking grouped controls accessible name");
requireText(publicHomeText, "aria-pressed={form.requestedDate === date}", "booking date selection state");
requireText(publicHomeText, "aria-pressed={form.slot === slot}", "booking time selection state");

const styles = await text("src/styles.css");
requireText(styles, "@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2", "self-hosted Arabic Cairo");
requireText(styles, "@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2", "self-hosted Latin Cairo");
requireText(styles, "@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2", "self-hosted Playfair Display");
requireText(styles, "font-display: swap", "local font loading policy");
forbidText(styles, "fonts.googleapis.com", "local-only font source");
forbidText(styles, "fonts.gstatic.com", "local-only font source");

const packageLock = await text("package-lock.json");
for (const fontPackage of [
  '"node_modules/@fontsource-variable/cairo"',
  '"node_modules/@fontsource-variable/playfair-display"',
]) {
  requireText(packageLock, fontPackage, `${fontPackage} dependency`);
}
requireText(packageLock, '"license": "OFL-1.1"', "font license");

const rootShell = await text("src/routes/__root.tsx");
for (const origin of ["fonts.googleapis.com", "fonts.gstatic.com", "premium.css"]) {
  forbidText(rootShell, origin, "render-blocking root resources");
}

const revenueSections = await text("src/components/revenue-sections.tsx");
requireText(revenueSections, "text-primary", "Locations contrast");
requireText(revenueSections, "bg-emerald-700", "WhatsApp contrast");

const mobileConversionBar = await text("src/components/mobile-conversion-bar.tsx");
requireText(mobileConversionBar, "bg-emerald-700", "mobile WhatsApp contrast");

const publicConfig = await text("src/platform/public-business-config.ts");
for (const needle of [
  'OPERATIONAL_EMAIL = "relaxfix2026@gmail.com"',
  'WHATSAPP_NUMBER = "971551378660"',
  "groupMaxSize: 4",
  "groupMonthlyPriceAED: 450",
  "groupSessionsPerWeek: 2",
  "siblingMonthlyPriceAED: 400",
  "privateSessionPriceAED: 150",
  'privateSessionDurationMinutes: "45–60"',
  'DISPLAY_NAME_OWNER_APPROVED = "Najda Street"',
  'displayName: "ICS Al Falah"',
  'displayName: "ICS Khalifa"',
  'displayName: "ICS Mushrif"',
  "isPublic: false",
  'start: "10:00"',
  'end: "22:00"',
  'start: "16:00"',
  'end: "21:00"',
]) {
  requireText(publicConfig, needle, "central public business configuration");
}

for (const publicSurface of [
  await text("src/components/revenue-sections.tsx"),
  await text("src/components/chatbot-preview.tsx"),
  await text("src/platform/public-seo.ts"),
  await text("src/platform/booking-automation.ts"),
]) {
  forbidText(publicSurface, "ICS Al Danah", "public Al Danah removal");
  forbidText(publicSurface, "ics-al-danah", "public Al Danah removal");
}

const i18n = await text("src/lib/i18n.tsx");
for (const needle of [
  "initialLang?: Lang",
  "persistPreference?: boolean",
  'initialLang = "ar"',
  "useState<Lang>(initialLang)",
  "if (!persistPreference)",
]) {
  requireText(i18n, needle, "localized language state");
}

const rootRoute = await text("src/routes/__root.tsx");
for (const needle of [
  "useLocation",
  "localizedPublicLanguage(pathname: string)",
  "localizedPublicHome(language: Lang)",
  "localizedLanguageSwitchTarget(pathname: string)",
  'pathname === "/en"',
  'if (pathname === "/") return "/en"',
  'if (pathname === "/en") return "/"',
  'if (pathname === "/privacy") return "/en/privacy"',
  'if (pathname === "/en/privacy") return "/privacy"',
  "const publicHome = localizedPublicHome(lang)",
  "const languageSwitchTarget = localizedLanguageSwitchTarget(pathname)",
  "const languageSwitchHref = languageSwitchTarget",
  "to={publicHome}",
  'href={isPublicHome ? "#programs" : `${publicHome}#programs`}',
  'href={isPublicHome ? "#book" : `${publicHome}#book`}',
  "href={languageSwitchHref}",
  "<html lang={pageLang}",
  "initialLang={publicLang}",
  "persistPreference={!isLocalizedPublicPage}",
]) {
  requireText(rootRoute, needle, "localized document shell");
}
if (rootRoute.includes("DeferredChatbotPreview")) {
  throw new Error("localized document shell: legacy duplicate chatbot must not be mounted");
}
for (const routePath of ["src/routes/index.tsx", "src/routes/en.tsx"]) {
  const routeSource = await text(routePath);
  requireText(routeSource, "<SalesAssistant />", `${routePath} assistant mount`);
}

const robots = await text("public/robots.txt");
for (const needle of [
  "Allow: /",
  "Disallow: /api/",
  "Disallow: /os",
  "Disallow: /staff",
  "Disallow: /admin",
  "Sitemap: https://www.relaxfixuae.com/sitemap.xml",
]) {
  requireText(robots, needle, "robots policy");
}

const sitemap = await text("public/sitemap.xml");
for (const needle of [
  "https://www.relaxfixuae.com/</loc>",
  "https://www.relaxfixuae.com/en</loc>",
  'hreflang="ar-AE"',
  'hreflang="en-AE"',
  'hreflang="x-default"',
]) {
  requireText(sitemap, needle, "public sitemap");
}
for (const needle of ["/os", "/staff", "/admin", "/api/"]) {
  forbidText(sitemap, needle, "public sitemap");
}

const vercel = await text("vercel.json");
for (const needle of [
  '"source": "/(.*)"',
  '"key": "X-Content-Type-Options"',
  '"value": "nosniff"',
  '"key": "Referrer-Policy"',
  '"value": "strict-origin-when-cross-origin"',
  '"key": "Permissions-Policy"',
  '"key": "X-Frame-Options"',
  '"value": "DENY"',
  '"source": "/api/(.*)"',
  '"source": "/os/(.*)"',
  '"source": "/os"',
  '"source": "/staff"',
  '"source": "/admin"',
  '"key": "X-Robots-Tag"',
  '"value": "noindex, nofollow, noarchive"',
]) {
  requireText(vercel, needle, "security and private-route headers");
}

console.log(`Public SEO verification passed (${checks} assertions).`);
