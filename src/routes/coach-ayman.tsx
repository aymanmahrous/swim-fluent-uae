import { createFileRoute, Link } from "@tanstack/react-router";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const PAGE_URL = `${SITE_URL}/coach-ayman`;
const TITLE = "Coach Ayman | Swimming Coach in Abu Dhabi | Relax Fix UAE";
const DESCRIPTION =
  "Meet Coach Ayman, swimming coach in Abu Dhabi with more than 15 years of swimming-coaching experience. Private and small-group lessons across four Relax Fix UAE locations.";

export const Route = createFileRoute("/coach-ayman")({
  head: () => {
    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": `${SITE_URL}/#coach-ayman`,
          name: "Coach Ayman",
          url: PAGE_URL,
          description: DESCRIPTION,
          jobTitle: "Swimming Coach",
          worksFor: { "@id": `${SITE_URL}/#organization` },
          knowsAbout: ["Swimming coaching", "Water confidence", "Beginner swimming", "Kids swimming lessons"],
          areaServed: { "@type": "City", name: "Abu Dhabi" },
        },
        {
          "@type": "ProfilePage",
          "@id": `${PAGE_URL}#profile`,
          url: PAGE_URL,
          name: TITLE,
          description: DESCRIPTION,
          mainEntity: { "@id": `${SITE_URL}/#coach-ayman` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "en-AE",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${PAGE_URL}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Relax Fix UAE", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Coach Ayman", item: PAGE_URL },
          ],
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
        { property: "og:type", content: "profile" },
        { property: "og:url", content: PAGE_URL },
        { property: "og:site_name", content: "Relax Fix UAE" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [{ type: "application/ld+json", children: jsonLd }],
    };
  },
  component: CoachAymanPage,
});

function CoachAymanPage() {
  const whatsapp = operationalWhatsAppUrl(
    "Hello, I would like to know more about swimming coaching with Coach Ayman.",
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="font-semibold text-primary hover:underline">Relax Fix UAE</Link>
        <span aria-hidden="true"> · </span>
        <span>Coach Ayman</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
        <div>
          <p className="text-sm font-black text-primary">Swimming Coach · Abu Dhabi</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Coach Ayman — Swimming Coaching in Abu Dhabi</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Coach Ayman has more than 15 years of swimming-coaching experience. His coaching approach focuses on clarity, discipline and calm progression, helping learners understand the water, improve body control and build lasting confidence step by step.
          </p>
          <p lang="ar" dir="rtl" className="mt-5 rounded-2xl border border-border bg-muted/40 p-5 text-lg leading-8">
            كوتش أيمن لديه خبرة أكثر من 15 عامًا في تدريب السباحة في أبوظبي. أسلوب التدريب يعتمد على الوضوح والانضباط والهدوء، مع بناء الثقة في الماء خطوة بخطوة حسب نقطة بداية كل متدرب.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", "en")} className="rounded-xl bg-deep px-5 py-3 font-black text-white">Ask about coaching</a>
            <Link to="/swimming-lessons-abu-dhabi" className="rounded-xl border border-border px-5 py-3 font-black hover:bg-muted">Swimming lessons in Abu Dhabi</Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-black">At a glance</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="font-bold text-muted-foreground">Experience</dt><dd className="mt-1 font-black">15+ years</dd></div>
            <div><dt className="font-bold text-muted-foreground">Languages</dt><dd className="mt-1 font-black">Arabic & English</dd></div>
            <div><dt className="font-bold text-muted-foreground">Lesson formats</dt><dd className="mt-1 font-black">Private & small group</dd></div>
            <div><dt className="font-bold text-muted-foreground">Group capacity</dt><dd className="mt-1 font-black">Up to 4 learners</dd></div>
            <div><dt className="font-bold text-muted-foreground">Area</dt><dd className="mt-1 font-black">Abu Dhabi, UAE</dd></div>
          </dl>
        </aside>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black">Coaching approach</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border p-6"><h3 className="font-black">Clear starting point</h3><p className="mt-3 leading-7 text-muted-foreground">The learning path starts by understanding the learner’s current level and goal before confirming the right lesson path.</p></article>
          <article className="rounded-2xl border border-border p-6"><h3 className="font-black">Calm progression</h3><p className="mt-3 leading-7 text-muted-foreground">Water confidence is built progressively rather than by rushing the learner through movements before they are ready.</p></article>
          <article className="rounded-2xl border border-border p-6"><h3 className="font-black">Focused coaching</h3><p className="mt-3 leading-7 text-muted-foreground">Private lessons and small groups allow clearer guidance, with group capacity limited to four learners.</p></article>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black">Coach Ayman training locations</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TRAINING_LOCATIONS.map((location) => (
            <Link key={location.id} to="/locations/$locationId" params={{ locationId: location.id }} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:bg-primary/5">
              <h3 className="font-black">{location.displayName}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Abu Dhabi · View training-location details and Google Maps link</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
