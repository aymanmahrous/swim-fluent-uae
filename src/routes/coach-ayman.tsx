import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "../lib/i18n";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const PAGE_URL = `${SITE_URL}/coach-ayman`;
const TITLE = "كوتش أيمن | Coach Ayman | مدرب سباحة في أبوظبي | Relax Fix UAE";
const DESCRIPTION =
  "كوتش أيمن مدرب سباحة في أبوظبي بخبرة أكثر من 15 عامًا، مع حصص خاصة ومجموعات صغيرة في مواقع Relax Fix UAE المعتمدة.";

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
          inLanguage: ["ar-AE", "en-AE"],
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

const copy = {
  ar: {
    breadcrumb: "كوتش أيمن",
    eyebrow: "مدرب سباحة · أبوظبي",
    title: "كوتش أيمن — تدريب السباحة في أبوظبي",
    intro: "كوتش أيمن لديه خبرة أكثر من 15 عامًا في تدريب السباحة. التدريب يبدأ من فهم مستوى المتدرب وهدفه، ثم التدرج بخطوات واضحة وهادئة لبناء التحكم والثقة داخل الماء.",
    ask: "اسأل عن التدريب",
    lessons: "تعليم السباحة في أبوظبي",
    glance: "معلومات سريعة",
    experience: "الخبرة",
    experienceValue: "أكثر من 15 عامًا",
    languages: "اللغات",
    languagesValue: "العربية والإنجليزية",
    formats: "نوع الحصص",
    formatsValue: "خاصة ومجموعات صغيرة",
    capacity: "سعة المجموعة",
    capacityValue: "بحد أقصى 4 متدربين",
    area: "المنطقة",
    areaValue: "أبوظبي، الإمارات",
    approach: "أسلوب التدريب",
    card1Title: "نقطة بداية واضحة",
    card1Body: "نحدد المستوى الحالي والهدف قبل اختيار مسار التدريب المناسب.",
    card2Title: "تدرج هادئ",
    card2Body: "تُبنى الثقة في الماء تدريجيًا بدون استعجال المتدرب قبل أن يكون مستعدًا.",
    card3Title: "تدريب مركز",
    card3Body: "الحصص الخاصة والمجموعات الصغيرة تساعد على توجيه أوضح ومتابعة أفضل.",
    locations: "مواقع تدريب كوتش أيمن",
    locationHint: "أبوظبي · تفاصيل الموقع ورابط Google Maps",
    whatsapp: "مرحبًا، أريد معرفة المزيد عن التدريب مع كوتش أيمن.",
  },
  en: {
    breadcrumb: "Coach Ayman",
    eyebrow: "Swimming Coach · Abu Dhabi",
    title: "Coach Ayman — Swimming Coaching in Abu Dhabi",
    intro: "Coach Ayman has more than 15 years of swimming-coaching experience. Coaching starts by understanding the learner’s current level and goal, then progressing through clear, calm steps that build control and confidence in the water.",
    ask: "Ask about coaching",
    lessons: "Swimming lessons in Abu Dhabi",
    glance: "At a glance",
    experience: "Experience",
    experienceValue: "15+ years",
    languages: "Languages",
    languagesValue: "Arabic & English",
    formats: "Lesson formats",
    formatsValue: "Private & small group",
    capacity: "Group capacity",
    capacityValue: "Up to 4 learners",
    area: "Area",
    areaValue: "Abu Dhabi, UAE",
    approach: "Coaching approach",
    card1Title: "Clear starting point",
    card1Body: "We understand the learner’s current level and goal before choosing the right coaching path.",
    card2Title: "Calm progression",
    card2Body: "Water confidence is built progressively without rushing the learner before they are ready.",
    card3Title: "Focused coaching",
    card3Body: "Private lessons and small groups allow clearer guidance and closer attention.",
    locations: "Coach Ayman training locations",
    locationHint: "Abu Dhabi · View location details and Google Maps link",
    whatsapp: "Hello, I would like to know more about swimming coaching with Coach Ayman.",
  },
} as const;

function CoachAymanPage() {
  const { lang } = useLang();
  const c = copy[lang];
  const whatsapp = operationalWhatsAppUrl(c.whatsapp);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-7 text-sm text-muted-foreground">
        <Link to={lang === "ar" ? "/" : "/en"} className="font-semibold text-primary hover:underline">Relax Fix UAE</Link>
        <span aria-hidden="true"> · </span>
        <span>{c.breadcrumb}</span>
      </nav>

      <section className="grid gap-7 lg:grid-cols-[1.35fr_.65fr] lg:items-stretch">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black text-primary">{c.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{c.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{c.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)} className="rounded-xl bg-deep px-5 py-3 font-black text-white transition hover:-translate-y-0.5">{c.ask}</a>
            <Link to="/swimming-lessons-abu-dhabi" className="rounded-xl border border-border px-5 py-3 font-black transition hover:border-primary hover:bg-primary/5">{c.lessons}</Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-aqua/10 p-6 shadow-sm sm:p-7">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-deep text-2xl font-black text-white shadow-glow">CA</div>
          <h2 className="mt-5 text-xl font-black">{c.glance}</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="font-bold text-muted-foreground">{c.experience}</dt><dd className="mt-1 font-black">{c.experienceValue}</dd></div>
            <div><dt className="font-bold text-muted-foreground">{c.languages}</dt><dd className="mt-1 font-black">{c.languagesValue}</dd></div>
            <div><dt className="font-bold text-muted-foreground">{c.formats}</dt><dd className="mt-1 font-black">{c.formatsValue}</dd></div>
            <div><dt className="font-bold text-muted-foreground">{c.capacity}</dt><dd className="mt-1 font-black">{c.capacityValue}</dd></div>
            <div><dt className="font-bold text-muted-foreground">{c.area}</dt><dd className="mt-1 font-black">{c.areaValue}</dd></div>
          </dl>
        </aside>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-black">{c.approach}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6"><h3 className="font-black">{c.card1Title}</h3><p className="mt-3 leading-7 text-muted-foreground">{c.card1Body}</p></article>
          <article className="rounded-2xl border border-border bg-card p-6"><h3 className="font-black">{c.card2Title}</h3><p className="mt-3 leading-7 text-muted-foreground">{c.card2Body}</p></article>
          <article className="rounded-2xl border border-border bg-card p-6"><h3 className="font-black">{c.card3Title}</h3><p className="mt-3 leading-7 text-muted-foreground">{c.card3Body}</p></article>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-black">{c.locations}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TRAINING_LOCATIONS.map((location) => (
            <Link key={location.id} to="/locations/$locationId" params={{ locationId: location.id }} className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:bg-primary/5">
              <h3 className="font-black">{location.displayName}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.locationHint}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
