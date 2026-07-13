import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const expectedUrls = [
  "https://www.relaxfixuae.com/",
  "https://www.relaxfixuae.com/en",
];
const prohibitedPathPrefixes = [
  "/contact",
  "/admin",
  "/staff",
  "/os",
  "/api",
];

const [staticSitemap, routeSource, robots] = await Promise.all([
  readFile(join(root, "public/sitemap.xml"), "utf8"),
  readFile(join(root, "src/routes/sitemap[.]xml.ts"), "utf8"),
  readFile(join(root, "public/robots.txt"), "utf8"),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(staticSitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "sitemap XML declaration missing");
assert(/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(staticSitemap), "valid sitemap urlset namespace missing");
assert((staticSitemap.match(/<url>/g) ?? []).length === 2, "sitemap must contain exactly two <url> entries");

const locs = [...staticSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(JSON.stringify(locs) === JSON.stringify(expectedUrls), `unexpected sitemap URLs: ${JSON.stringify(locs)}`);

for (const value of locs) {
  const url = new URL(value);
  assert(url.protocol === "https:", `non-HTTPS sitemap URL: ${value}`);
  assert(url.hostname === "www.relaxfixuae.com", `non-canonical sitemap host: ${value}`);
  assert(url.search === "", `query string is not allowed in sitemap URL: ${value}`);
  assert(url.hash === "", `fragment is not allowed in sitemap URL: ${value}`);
  assert(!prohibitedPathPrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)), `private or prohibited sitemap path: ${value}`);
  assert(routeSource.includes(value), `server route missing ${value}`);
}

assert(routeSource.includes('createFileRoute("/sitemap.xml")'), "server sitemap route missing");
assert(routeSource.includes('"Content-Type": "application/xml; charset=utf-8"'), "XML content type missing");
assert(routeSource.includes("status: 200"), "HTTP 200 response missing");
assert(robots.split(/\r?\n/).filter((line) => line.startsWith("Sitemap:")).length === 1, "robots.txt must contain exactly one Sitemap line");
assert(robots.includes("Sitemap: https://www.relaxfixuae.com/sitemap.xml"), "robots.txt sitemap reference is incorrect");

console.log("Production sitemap verification passed (2 canonical public URLs, XML route, robots reference).");
