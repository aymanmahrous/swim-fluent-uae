export const SITE_URL = "https://www.relaxfixuae.com";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const COACH_ID = `${SITE_URL}/#coach-ayman`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SERVICE_ID = `${SITE_URL}/#swimming-water-confidence`;

const pageCopy = {
  ar: {
    title: "تعليم السباحة والثقة المائية في أبوظبي | كوتش أيمن | Relax Fix UAE",
    description:
      "تدريب سباحة وثقة مائية في أبوظبي مع كوتش أيمن للأطفال والبالغين وأصحاب الهمم. تقييم أولي وخطة تدريب تناسب الخبرة والراحة داخل الماء.",
    url: `${SITE_URL}/`,
    locale: "ar_AE",
    alternateLocale: "en_AE",
    language: "ar-AE",
    serviceName: "تدريب السباحة والثقة المائية في أبوظبي",
  },
  en: {
    title: "Swimming & Water Confidence Coach Abu Dhabi | Coach Ayman | Relax Fix UAE",
    description:
      "Swimming and water-confidence coaching in Abu Dhabi with Coach Ayman for children, adults and People of Determination. Start with an assessment and a coaching path built around your experience and comfort in the water.",
    url: `${SITE_URL}/en`,
    locale: "en_AE",
    alternateLocale: "ar_AE",
    language: "en-AE",
    serviceName: "Swimming and Water Confidence Coaching in Abu Dhabi",
  },
} as const;

type PublicLanguage = keyof typeof pageCopy;

function structuredData(lang: PublicLanguage) {
  const copy = pageCopy[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Relax Fix UAE",
        url: SITE_URL,
        email: "swimmingayman@gmail.com",
        telephone: "+971551378660",
        founder: { "@id": COACH_ID },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+971551378660",
          email: "swimmingayman@gmail.com",
          availableLanguage: ["Arabic", "English"],
          areaServed: "AE",
        },
      },
      {
        "@type": "Person",
        "@id": COACH_ID,
        name: "Coach Ayman",
        jobTitle: "Swimming and Water Confidence Coach",
        worksFor: { "@id": ORGANIZATION_ID },
        knowsAbout: [
          "Swimming coaching",
          "Water confidence",
          "Adaptive aquatic coaching",
          "Swimming technique",
        ],
        knowsLanguage: ["Arabic", "English"],
      },
      {
        "@type": "Service",
        "@id": SERVICE_ID,
        name: copy.serviceName,
        serviceType: "Swimming and water confidence coaching",
        provider: { "@id": ORGANIZATION_ID },
        areaServed: {
          "@type": "City",
          name: "Abu Dhabi",
          containedInPlace: {
            "@type": "Country",
            name: "United Arab Emirates",
          },
        },
        availableLanguage: ["Arabic", "English"],
        url: copy.url,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: "Relax Fix UAE",
        url: SITE_URL,
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: ["ar-AE", "en-AE"],
      },
      {
        "@type": "WebPage",
        "@id": `${copy.url}#webpage`,
        url: copy.url,
        name: copy.title,
        description: copy.description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": SERVICE_ID },
        inLanguage: copy.language,
      },
    ],
  };
}

export function publicHomeHead(lang: PublicLanguage) {
  const copy = pageCopy[lang];
  const jsonLd = JSON.stringify(structuredData(lang)).replace(/</g, "\\u003c");

  return {
    meta: [
      { title: copy.title },
      { name: "description", content: copy.description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: copy.title },
      { property: "og:description", content: copy.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: copy.url },
      { property: "og:site_name", content: "Relax Fix UAE" },
      { property: "og:locale", content: copy.locale },
      { property: "og:locale:alternate", content: copy.alternateLocale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: copy.title },
      { name: "twitter:description", content: copy.description },
    ],
    links: [
      { rel: "canonical", href: copy.url },
      { rel: "alternate", hrefLang: "ar-AE", href: `${SITE_URL}/` },
      { rel: "alternate", hrefLang: "en-AE", href: `${SITE_URL}/en` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}/` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd,
      },
    ],
  };
}
