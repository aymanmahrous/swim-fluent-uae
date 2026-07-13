import { createFileRoute } from "@tanstack/react-router";

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://www.relaxfixuae.com/</loc>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="https://www.relaxfixuae.com/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="https://www.relaxfixuae.com/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.relaxfixuae.com/" />
  </url>
  <url>
    <loc>https://www.relaxfixuae.com/en</loc>
    <xhtml:link rel="alternate" hreflang="ar-AE" href="https://www.relaxfixuae.com/" />
    <xhtml:link rel="alternate" hreflang="en-AE" href="https://www.relaxfixuae.com/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.relaxfixuae.com/" />
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
