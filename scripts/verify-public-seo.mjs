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
  '"@type": "Organization"',
  "sameAs: [INSTAGRAM_URL]",
  '"@type": "Person"',
  '"@type": "Service"',
  '"@type": "WebSite"',
  '"@type": "WebPage"',
  'name: "Abu Dhabi"',
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
  forbidText(seo, needle, "truthful structured data");
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

const publicConfig = await text("src/platform/public-business-config.ts");
for (const needle of [
  'OPERATIONAL_EMAIL = "relaxfix2026@gmail.com"',
  'WHATSAPP_NUMBER = "971551378660"',
  "groupMaxSize: 4",
  "groupChildPriceAED: 450",
  "siblingChildPriceAED: 400",
  "aquaticSessionPriceAED: 150",
  "landSessionPriceAED: 150",
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
  'pathname === "/en"',
  "<html lang={pageLang}",
  "initialLang={publicLang}",
  "persistPreference={!isLocalizedPublicPage}",
  'to="/en"',
]) {
  requireText(rootRoute, needle, "localized document shell");
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
  '"source": "/api/(.*)"',
  '"source": "/os/(.*)"',
  '"source": "/os"',
  '"source": "/staff"',
  '"source": "/admin"',
  '"key": "X-Robots-Tag"',
  '"value": "noindex, nofollow, noarchive"',
]) {
  requireText(vercel, needle, "private route indexing headers");
}

console.log(`Public SEO verification passed (${checks} assertions).`);
