import { createHash } from "node:crypto";
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
  'publicHomeHead(lang: PublicLanguage)',
  'rel: "canonical"',
  'hrefLang: "ar-AE"',
  'hrefLang: "en-AE"',
  'hrefLang: "x-default"',
  '"@type": "Organization"',
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
  "sameAs",
]) {
  forbidText(seo, needle, "truthful structured data");
}

const arabicRoute = await text("src/routes/index.tsx");
requireText(arabicRoute, 'publicHomeHead("ar")', "Arabic public route");
requireText(arabicRoute, 'createFileRoute("/")', "Arabic public route");

const englishRoute = await text("src/routes/en.tsx");
requireText(englishRoute, 'publicHomeHead("en")', "English public route");
requireText(englishRoute, 'createFileRoute("/en")', "English public route");

const publicHome = await readFile(join(root, "src/components/public-home.tsx"));
checks += 1;
const publicHomeBlobHash = createHash("sha1")
  .update(`blob ${publicHome.byteLength}\0`)
  .update(publicHome)
  .digest("hex");
if (publicHomeBlobHash !== "6ee7463c4ee42d1946ea0dc7f7c66c314572ba55") {
  throw new Error(`public home byte preservation: unexpected blob ${publicHomeBlobHash}`);
}
const publicHomeText = publicHome.toString("utf8");
requireText(publicHomeText, "submitBookingRequest", "preserved booking page");
requireText(publicHomeText, "generateSlotsForDubaiDate", "preserved booking page");
requireText(publicHomeText, 'id="book"', "preserved booking page");

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
