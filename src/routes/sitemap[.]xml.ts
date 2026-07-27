import { createFileRoute } from "@tanstack/react-router";

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.relaxfixuae.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="https://www.relaxfixuae.com/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="https://www.relaxfixuae.com/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.relaxfixuae.com/" />
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/en</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="https://www.relaxfixuae.com/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="https://www.relaxfixuae.com/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.relaxfixuae.com/" />
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/locations/najda-street</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/locations/ics-al-falah</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/locations/ics-khalifa</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/locations/ics-mushrif</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
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
