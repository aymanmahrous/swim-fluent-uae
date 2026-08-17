import { createFileRoute, Link } from "@tanstack/react-router";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const PAGE_URL = `${SITE_URL}/swimming-lessons-abu-dhabi`;
const TITLE = "Swimming Lessons Abu Dhabi | Kids & Beginners | Relax Fix UAE";
const DESCRIPTION =
  "Swimming lessons in Abu Dhabi with Coach Ayman for kids, beginners and water-confidence learners. Private coaching and small groups up to 4 across four Abu Dhabi locations.";

export const Route = createFileRoute("/swimming-lessons-abu-dhabi")({
  head: () => {
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${PAGE_URL}#service`,
          name: "Swimming lessons in Abu Dhabi",
          description: DESCRIPTION,
          serviceType: "Swimming lessons and water confidence coaching",
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@type": "City", name: "Abu Dhabi" },
          availableLanguage: ["Arabic", "English"],
          url: PAGE_URL,
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${PAGE_URL}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Relax Fix UAE", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Swimming Lessons Abu Dhabi", item: PAGE_URL },
          ],
        },
        {
          "@type": "WebPage",
          "@id": `${PAGE_URL}#webpage`,
          url: PAGE_URL,
          name: TITLE,
          description: DESCRIPTION,
          about: { "@id": `${PAGE_URL}#service` },
          breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: ["en-AE", "ar-AE"],
        },
      ],
    }).replace(/</g, "\\u003c");

    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
        { name: "geo.region", content: "AE-AZ" },
        { name: "geo.placename", content: "Abu Dhabi" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: PAGE_URL },
        { property: "og:site_name", content: "Relax Fix UAE" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
  component: SwimmingLessonsAbuDhabiPage,
});

function SwimmingLessonsAbuDhabiPage() {
  const whatsapp = operationalWhatsAppUrl(
    "Hello, I would like to know more about swimming lessons in Abu Dhabi.",
  );

  return (
    <main lang="en-AE" dir="ltr" className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="font-semibold text-primary hover:underline">Relax Fix UAE</Link>
        <span aria-hidden="true"> · </span>
        <span>Swimming Lessons Abu Dhabi</span>
      </nav>

      <section className="max-w-4xl">
        <p className="text-sm font-bold text-primary">Coach Ayman · Abu Dhabi · Arabic & English</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Swimming Lessons in Abu Dhabi for Kids, Beginners & Water Confidence</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Relax Fix UAE provides swimming coaching in Abu Dhabi with Coach Ayman, who has more than 15 years of swimming-coaching experience. Coaching is available as private lessons or small groups of up to 4 learners, with a clear starting-point assessment and availability check before a booking is confirmed.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", "en")} className="rounded-xl bg-deep px-5 py-3 font-black text-white">Ask about swimming lessons</a>
          <Link to="/coach-ayman" className="rounded-xl border border-border px-5 py-3 font-black hover:bg-muted">Meet Coach Ayman</Link>
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Kids swimming lessons</h2>
          <p className="mt-3 leading-7 text-muted-foreground">A calm, structured path for children learning water confidence, breathing, floating and movement fundamentals.</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Beginner swimming coaching</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Coaching can start from zero and progress step by step, with attention to confidence and control in the water.</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-black">Private or small group</h2>
          <p className="mt-3 leading-7 text-muted-foreground">Choose private coaching or a small group. Group capacity is limited to 4 learners.</p>
        </article>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black">Swimming lesson locations in Abu Dhabi</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Choose the most convenient Relax Fix UAE training location. Each location page includes its verified Google Maps destination.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {TRAINING_LOCATIONS.map((location) => (
            <Link key={location.id} to="/locations/$locationId" params={{ locationId: location.id }} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:bg-primary/5">
              <h3 className="font-black">{location.displayName}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Swimming coaching in Abu Dhabi · View location details and map</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-14" aria-labelledby="search-answers-heading">
        <p className="text-sm font-black text-primary">Quick answers for Abu Dhabi swimmers and parents</p>
        <h2 id="search-answers-heading" className="mt-3 text-3xl font-black">Common swimming lesson searches</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-black">Where can I find swimming lessons near me in Abu Dhabi?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Relax Fix UAE lists training at ICS Al Najda, ICS Al Falah, ICS Khalifa and ICS Al Mushrif. Tell us your area and we can help identify the nearest listed location before checking availability.</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-black">Are there swimming lessons for complete beginners?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Yes. Coaching can begin from zero with breathing, floating, movement fundamentals and water-confidence work matched to the learner’s starting point.</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-black">Do you offer kids swimming lessons in Abu Dhabi?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Yes. Relax Fix UAE provides kids swimming coaching in Abu Dhabi with Coach Ayman, including private lessons and small groups with a maximum of 4 learners.</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-black">Private swimming lessons or group lessons?</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Both formats are available. Private coaching is one-to-one, while group coaching is kept to a maximum of 4 learners. The right path depends on the learner’s goal, starting point and availability.</p>
          </article>
        </div>

        <div lang="ar" dir="rtl" className="mt-8 rounded-3xl border border-border bg-muted/50 p-7">
          <h2 className="text-2xl font-black">تعليم السباحة في أبوظبي</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            إذا كنت تبحث عن تعليم سباحة للأطفال، مدرب سباحة في أبوظبي، دروس سباحة للمبتدئين أو مسبح قريب للتدريب، تقدم Relax Fix UAE التدريب مع كوتش أيمن في أربعة مواقع: ICS Al Najda وICS Al Falah وICS Khalifa وICS Al Mushrif، مع تدريب خاص أو مجموعات صغيرة بحد أقصى 4 متدربين.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-muted/60 p-7 sm:p-9">
        <h2 className="text-2xl font-black">Looking for a swimming coach near you in Abu Dhabi?</h2>
        <p className="mt-4 leading-7 text-muted-foreground">Tell us your area and what you want to improve. We can help you identify the nearest listed training location and review the available lesson path before confirmation.</p>
        <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", "en")} className="mt-6 inline-flex rounded-xl bg-deep px-5 py-3 font-black text-white">Contact Relax Fix UAE</a>
      </section>
    </main>
  );
}
