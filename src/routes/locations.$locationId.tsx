import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const copy = {
  ar: {
    pageTitle: (name: string) => `تعليم السباحة في ${name}، أبوظبي | كوتش أيمن | Relax Fix UAE`,
    description: (name: string) =>
      `حصص سباحة وثقة مائية في ${name} بأبوظبي مع كوتش أيمن، بحصص خاصة أو مجموعات صغيرة بحد أقصى 4 متدربين، حسب التقييم والتوفر.`,
    heading: (name: string) => `تعليم السباحة في ${name}، أبوظبي`,
    body: (name: string) =>
      `تدريب سباحة وثقة مائية في موقع ${name} داخل أبوظبي مع كوتش أيمن. تتوفر حصص خاصة أو مجموعات صغيرة بحد أقصى 4 متدربين، ويبدأ المسار بطلب تقييم أولي ثم مراجعة الموعد المناسب حسب التوفر.`,
    cta: "اطلب تقييمًا عبر واتساب",
    map: "عرض الموقع على الخريطة",
    pricing: "الأسعار",
    home: "العودة إلى Relax Fix UAE",
    otherLocations: "مواقع تدريب أخرى في أبوظبي",
    locationLabel: "موقع التدريب",
  },
} as const;

export const Route = createFileRoute("/locations/$locationId")({
  loader: ({ params }) => {
    const location = TRAINING_LOCATIONS.find(
      (item) => item.id === params.locationId && item.localSeoEnabled,
    );
    if (!location) throw notFound();
    return {
      location,
      otherLocations: TRAINING_LOCATIONS.filter(
        (item) => item.localSeoEnabled && item.id !== location.id,
      ),
    };
  },
  head: ({ loaderData }) => {
    const location = loaderData?.location;
    if (!location) return {};
    const url = `${SITE_URL}/locations/${location.id}`;
    const locationId = `${url}#location`;
    const serviceId = `${url}#swimming-service`;
    const title = copy.ar.pageTitle(location.displayName);
    const description = copy.ar.description(location.displayName);
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Place",
          "@id": locationId,
          name: location.displayName,
          alternateName: location.googleMapsObservedName,
          url,
          hasMap: location.shortUrl,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Abu Dhabi",
            addressRegion: "Abu Dhabi",
            addressCountry: "AE",
          },
        },
        {
          "@type": "Service",
          "@id": serviceId,
          name: title,
          description,
          serviceType: "Swimming lessons and water confidence coaching",
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@id": locationId },
          availableLanguage: ["Arabic", "English"],
          url,
          inLanguage: "ar-AE",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Relax Fix UAE",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: location.displayName,
              item: url,
            },
          ],
        },
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: title,
          description,
          about: { "@id": serviceId },
          breadcrumb: { "@id": `${url}#breadcrumb` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "ar-AE",
        },
      ],
    }).replace(/</g, "\\u003c");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
        { name: "geo.region", content: "AE-AZ" },
        { name: "geo.placename", content: "Abu Dhabi" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "Relax Fix UAE" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
  component: LocalLocationPage,
});

function LocalLocationPage() {
  const { location, otherLocations } = Route.useLoaderData();
  const whatsapp = operationalWhatsAppUrl(
    `أرغب في طلب تقييم أولي لتعليم السباحة في ${location.displayName} - أبوظبي.`,
  );

  return (
    <main dir="rtl" lang="ar-AE" className="mx-auto max-w-3xl px-5 py-12">
      <nav aria-label="مسار الصفحة" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="font-semibold text-primary hover:underline">
          Relax Fix UAE
        </Link>
        <span aria-hidden="true"> · </span>
        <span>{location.displayName}</span>
      </nav>

      <p className="mb-3 text-sm font-medium">Relax Fix UAE · Coach Ayman · Abu Dhabi</p>
      <h1 className="text-3xl font-bold tracking-tight">{copy.ar.heading(location.displayName)}</h1>
      <p className="mt-5 text-lg leading-8">{copy.ar.body(location.displayName)}</p>

      <section className="mt-7 rounded-2xl border border-border bg-muted/30 p-5" aria-label={copy.ar.locationLabel}>
        <h2 className="text-lg font-black">{location.displayName}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">أبوظبي، الإمارات العربية المتحدة</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">كوتش أيمن · خبرة أكثر من 15 عامًا · حصص خاصة ومجموعات صغيرة حتى 4 متدربين</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          className="rounded-lg border px-5 py-3 font-semibold"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          onClick={() => emitPublicCtaClick("booking_section_whatsapp", "ar")}
        >
          {copy.ar.cta}
        </a>
        <a
          className="rounded-lg border px-5 py-3 font-semibold"
          href={location.shortUrl}
          target="_blank"
          rel="noreferrer"
        >
          {copy.ar.map}
        </a>
        <a className="rounded-lg border px-5 py-3 font-semibold" href="/#pricing">
          {copy.ar.pricing}
        </a>
      </div>

      <section className="mt-12 rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <h2 className="text-lg font-black">اعرف أكثر عن التدريب في أبوظبي</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/swimming-lessons-abu-dhabi" className="rounded-xl bg-deep px-4 py-3 text-sm font-black text-white">
            Swimming Lessons Abu Dhabi
          </Link>
          <Link to="/coach-ayman" className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-black">
            كوتش أيمن · Coach Ayman
          </Link>
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-black">{copy.ar.otherLocations}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {otherLocations.map((item) => (
            <Link
              key={item.id}
              to="/locations/$locationId"
              params={{ locationId: item.id }}
              className="rounded-xl border border-border bg-card px-4 py-3 font-bold transition hover:border-primary hover:bg-primary/5"
            >
              {item.displayName}
            </Link>
          ))}
        </div>
        <Link to="/" className="mt-6 inline-flex font-bold text-primary hover:underline">
          {copy.ar.home}
        </Link>
      </section>
    </main>
  );
}
