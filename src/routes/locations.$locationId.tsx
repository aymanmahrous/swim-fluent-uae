import { createFileRoute, notFound } from "@tanstack/react-router";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const copy = {
  ar: {
    pageTitle: (name: string) => `تعليم السباحة للأطفال في ${name}، أبوظبي | كوتش أيمن`,
    description: (name: string) =>
      `تعليم السباحة والثقة المائية للأطفال بالقرب من ${name} في أبوظبي مع كوتش أيمن، ضمن مجموعات صغيرة ومواعيد حسب التقييم والتوفر.`,
    heading: (name: string) => `تعليم السباحة للأطفال بالقرب من ${name}`,
    body: (name: string) =>
      `تدريب سباحة وثقة مائية للأطفال في موقع ${name} داخل أبوظبي. يبدأ البرنامج بطلب تقييم أولي، ثم يتم تأكيد الموعد المناسب حسب مستوى الطفل والتوفر.`,
    cta: "اطلب تقييمًا عبر واتساب",
    map: "عرض الموقع على الخريطة",
  },
} as const;

export const Route = createFileRoute("/locations/$locationId")({
  loader: ({ params }) => {
    const location = TRAINING_LOCATIONS.find(
      (item) => item.id === params.locationId && item.localSeoEnabled,
    );
    if (!location) throw notFound();
    return { location };
  },
  head: ({ loaderData }) => {
    const location = loaderData?.location;
    if (!location) return {};
    const url = `${SITE_URL}/locations/${location.id}`;
    const title = copy.ar.pageTitle(location.displayName);
    const description = copy.ar.description(location.displayName);
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      description,
      serviceType: "Kids swimming lessons and water confidence coaching",
      areaServed: {
        "@type": "Place",
        name: location.displayName,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Abu Dhabi",
          addressCountry: "AE",
        },
        hasMap: location.shortUrl,
      },
      provider: {
        "@type": "Organization",
        name: "Relax Fix UAE",
        url: SITE_URL,
      },
      url,
      inLanguage: "ar-AE",
    }).replace(/</g, "\\u003c");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
  component: LocalLocationPage,
});

function LocalLocationPage() {
  const { location } = Route.useLoaderData();
  const whatsapp = operationalWhatsAppUrl(
    `أرغب في طلب تقييم أولي لتعليم السباحة للأطفال في ${location.displayName} - أبوظبي.`,
  );

  return (
    <main dir="rtl" lang="ar-AE" className="mx-auto max-w-3xl px-5 py-12">
      <p className="mb-3 text-sm font-medium">Relax Fix UAE · Coach Ayman</p>
      <h1 className="text-3xl font-bold tracking-tight">{copy.ar.heading(location.displayName)}</h1>
      <p className="mt-5 text-lg leading-8">{copy.ar.body(location.displayName)}</p>
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
      </div>
    </main>
  );
}
