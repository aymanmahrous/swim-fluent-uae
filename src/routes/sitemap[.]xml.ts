import { createFileRoute } from "@tanstack/react-router";
import { TRAINING_LOCATIONS } from "../platform/public-business-config";
import { SITE_URL } from "../platform/public-seo";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const locationEntries = TRAINING_LOCATIONS.filter((location) => location.localSeoEnabled)
  .map(
    (location) => `  <url>
    <loc>${SITE_URL}/locations/${escapeXml(location.id)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n");

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="${SITE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>
  <url>
    <loc>${SITE_URL}/en</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="${SITE_URL}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>
${locationEntries}
</urlset>`;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(SITEMAP_XML, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        }),
    },
  },
});
