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

const pageCopy = {
  ar: {
    title: "تعليم السباحة للأطفال في أبوظبي | كوتش أيمن | Relax Fix UAE",
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
    title: "Kids Swimming Lessons Abu Dhabi | Coach Ayman | Relax Fix UAE",
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

function structuredData(lang: PublicLanguage) {
  const copy = pageCopy[lang];
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
        location: TRAINING_LOCATIONS.map((location) => ({
          "@type": "Place",
          name: location.displayName,
          alternateName: location.googleMapsObservedName,
          hasMap: location.shortUrl,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Abu Dhabi",
            addressCountry: "AE",
          },
        })),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: WHATSAPP_DISPLAY,
          email: OPERATIONAL_EMAIL,
          availableLanguage: ["Arabic", "English"],
          areaServed: "AE-AZ",
          hoursAvailable: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday"],
              opens: "10:00",
              closes: "22:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "16:00",
              closes: "21:00",
            },
          ],
        },
      },
      {
        "@type": "Person",
        "@id": COACH_ID,
        name: "Coach Ayman",
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
        areaServed: {
          "@type": "City",
          name: "Abu Dhabi",
          containedInPlace: {
            "@type": "Country",
            name: "United Arab Emirates",
          },
        },
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
