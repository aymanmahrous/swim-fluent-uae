import heroAvif from "../assets/hero-pool.avif";
import heroImg from "../assets/hero-pool.jpg";
import { OPERATIONAL_EMAIL, TRAINING_LOCATIONS, WHATSAPP_DISPLAY } from "./public-business-config";

export const SITE_URL = "https://www.relaxfixuae.com";
export const INSTAGRAM_URL = "https://www.instagram.com/relaxfixuae/";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const COACH_ID = `${SITE_URL}/#coach-ayman`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SERVICE_ID = `${SITE_URL}/#swimming-water-confidence`;
const SOCIAL_IMAGE_URL = new URL(heroImg, `${SITE_URL}/`).toString();
const COACH_IMAGE_URL = `${SITE_URL}/coach-ayman.webp`;

const pageCopy = {
  ar: {
    title: "مدرب سباحة أبوظبي | كوتش أيمن | دروس سباحة خاصة للأطفال - النجدة وخليفة",
    description:
      "تعليم السباحة والثقة المائية للأطفال في أبوظبي مع كوتش أيمن، ضمن مجموعات صغيرة بحد أقصى 4 أطفال وفي مواقع تدريب موثقة داخل أبوظبي.",
    imageAlt: "تعليم السباحة للأطفال في أبوظبي مع كوتش أيمن",
    url: `${SITE_URL}/`,
    locale: "ar_AE",
    alternateLocale: "en_AE",
    language: "ar-AE",
    serviceName: "تعليم السباحة والثقة المائية للأطفال في أبوظبي",
  },
  en: {
    title: "Private Swimming Coach Abu Dhabi | Coach Ayman | Kids Swimming Lessons",
    description:
      "Kids swimming lessons and water-confidence coaching in Abu Dhabi with Coach Ayman, in small groups of up to four across verified Abu Dhabi training locations.",
    imageAlt: "Kids swimming lessons in Abu Dhabi with Coach Ayman",
    url: `${SITE_URL}/en`,
    locale: "en_AE",
    alternateLocale: "ar_AE",
    language: "en-AE",
    serviceName: "Kids Swimming Lessons and Water Confidence Coaching in Abu Dhabi",
  },
} as const;

type PublicLanguage = keyof typeof pageCopy;

function locationEntity(location: (typeof TRAINING_LOCATIONS)[number]) {
  const url = `${SITE_URL}/locations/${location.id}`;
  return {
    "@type": "Place",
    "@id": `${url}#location`,
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
  };
}

function structuredData(lang: PublicLanguage) {
  const copy = pageCopy[lang];
  const publicLocations = TRAINING_LOCATIONS.filter((location) => location.localSeoEnabled);
  const locationNodes = publicLocations.map(locationEntity);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "SportsActivityLocation"],
        "@id": ORGANIZATION_ID,
        name: "Relax Fix UAE",
        url: SITE_URL,
        image: SOCIAL_IMAGE_URL,
        sameAs: [INSTAGRAM_URL],
        email: OPERATIONAL_EMAIL,
        telephone: WHATSAPP_DISPLAY,
        areaServed: {
          "@type": "City",
          name: "Abu Dhabi",
          containedInPlace: {
            "@type": "Country",
            name: "United Arab Emirates",
          },
        },
        location: locationNodes.map((location) => ({ "@id": location["@id"] })),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: WHATSAPP_DISPLAY,
          email: OPERATIONAL_EMAIL,
          availableLanguage: ["Arabic", "English"],
          areaServed: "AE-AZ",
        },
      },
      ...locationNodes,
      {
        "@type": "Person",
        "@id": COACH_ID,
        name: "Coach Ayman",
        url: `${SITE_URL}/coach-ayman`,
        image: COACH_IMAGE_URL,
        jobTitle: "Swimming and Water Confidence Coach",
        worksFor: { "@id": ORGANIZATION_ID },
        knowsAbout: ["Swimming coaching", "Water confidence", "Swimming technique"],
        knowsLanguage: ["Arabic", "English"],
      },
      {
        "@type": "Service",
        "@id": SERVICE_ID,
        name: copy.serviceName,
        serviceType: "Kids swimming lessons and water confidence coaching",
        provider: { "@id": ORGANIZATION_ID },
        areaServed: publicLocations.map((location) => ({
          "@id": `${SITE_URL}/locations/${location.id}#location`,
        })),
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: copy.url,
          servicePhone: {
            "@type": "ContactPoint",
            telephone: WHATSAPP_DISPLAY,
            contactType: "booking",
          },
          availableLanguage: ["Arabic", "English"],
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
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: SOCIAL_IMAGE_URL,
          caption: copy.imageAlt,
        },
      },
    ],
  };
}

const contactCopy = {
  ar: {
    title: "تواصل معنا | Relax Fix UAE — أكاديمية سباحة في أبوظبي",
    description:
      "تواصل مع Relax Fix UAE / كوتش أيمن لطلب تقييم سباحة أو حجز دروس للأطفال في أبوظبي. واتساب وبريد تشغيلي فقط — خدمة تدريب سباحة في أبوظبي.",
    url: `${SITE_URL}/contact`,
    locale: "ar_AE",
    alternateLocale: "en_AE",
    language: "ar-AE",
    breadcrumbHome: "Relax Fix UAE",
    breadcrumbContact: "تواصل معنا",
    pageName: "تواصل مع Relax Fix UAE",
  },
  en: {
    title: "Contact | Relax Fix UAE — Swimming Academy Abu Dhabi",
    description:
      "Contact Relax Fix UAE / Coach Ayman to request a swimming assessment or kids swimming lessons in Abu Dhabi. WhatsApp and operational email only — Abu Dhabi service, not a design studio.",
    url: `${SITE_URL}/en/contact`,
    locale: "en_AE",
    alternateLocale: "ar_AE",
    language: "en-AE",
    breadcrumbHome: "Relax Fix UAE",
    breadcrumbContact: "Contact",
    pageName: "Contact Relax Fix UAE",
  },
} as const;

function contactStructuredData(lang: PublicLanguage) {
  const copy = contactCopy[lang];
  const homeUrl = lang === "en" ? `${SITE_URL}/en` : `${SITE_URL}/`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${copy.url}#contactpage`,
        url: copy.url,
        name: copy.pageName,
        description: copy.description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
        mainEntity: { "@id": ORGANIZATION_ID },
        inLanguage: copy.language,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${copy.url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: copy.breadcrumbHome, item: homeUrl },
          { "@type": "ListItem", position: 2, name: copy.breadcrumbContact, item: copy.url },
        ],
      },
    ],
  };
}

export function publicContactHead(lang: PublicLanguage) {
  const copy = contactCopy[lang];
  const jsonLd = JSON.stringify(contactStructuredData(lang)).replace(/</g, "\\u003c");

  return {
    meta: [
      { title: copy.title },
      { name: "description", content: copy.description },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
      { name: "geo.region", content: "AE-AZ" },
      { name: "geo.placename", content: "Abu Dhabi" },
      { property: "og:title", content: copy.title },
      { property: "og:description", content: copy.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: copy.url },
      { property: "og:site_name", content: "Relax Fix UAE" },
      { property: "og:locale", content: copy.locale },
      { property: "og:locale:alternate", content: copy.alternateLocale },
      { property: "og:image", content: SOCIAL_IMAGE_URL },
      { property: "og:image:alt", content: pageCopy[lang].imageAlt },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: copy.title },
      { name: "twitter:description", content: copy.description },
      { name: "twitter:image", content: SOCIAL_IMAGE_URL },
      { name: "twitter:image:alt", content: pageCopy[lang].imageAlt },
    ],
    links: [
      { rel: "canonical", href: copy.url },
      { rel: "alternate", hrefLang: "ar-AE", href: contactCopy.ar.url },
      { rel: "alternate", hrefLang: "en-AE", href: contactCopy.en.url },
      { rel: "alternate", hrefLang: "x-default", href: contactCopy.ar.url },
    ],
    scripts: [{ type: "application/ld+json", children: jsonLd }],
  };
}

export function publicHomeHead(lang: PublicLanguage) {
  const copy = pageCopy[lang];
  const jsonLd = JSON.stringify(structuredData(lang)).replace(/</g, "\\u003c");

  return {
    meta: [
      { title: copy.title },
      { name: "description", content: copy.description },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
      { name: "geo.region", content: "AE-AZ" },
      { name: "geo.placename", content: "Abu Dhabi" },
      { name: "theme-color", content: "#0b1f3a" },
      { property: "og:title", content: copy.title },
      { property: "og:description", content: copy.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: copy.url },
      { property: "og:site_name", content: "Relax Fix UAE" },
      { property: "og:locale", content: copy.locale },
      { property: "og:locale:alternate", content: copy.alternateLocale },
      { property: "og:image", content: SOCIAL_IMAGE_URL },
      { property: "og:image:alt", content: copy.imageAlt },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: copy.title },
      { name: "twitter:description", content: copy.description },
      { name: "twitter:image", content: SOCIAL_IMAGE_URL },
      { name: "twitter:image:alt", content: copy.imageAlt },
    ],
    links: [
      {
        rel: "preload",
        href: heroAvif,
        as: "image",
        type: "image/avif",
        fetchPriority: "high" as const,
      },
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
