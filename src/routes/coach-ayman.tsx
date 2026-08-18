import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "../lib/i18n";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const PAGE_URL = `${SITE_URL}/coach-ayman`;
const COACH_IMAGE_URL = `${SITE_URL}/coach-ayman.webp`;
const TITLE = "كوتش أيمن | Coach Ayman | ASCA Swimming Coach Abu Dhabi | Relax Fix UAE";
const DESCRIPTION =
  "Coach Ayman is an ASCA Level 1 & 2 swimming coach in Abu Dhabi with 15+ years of swimming experience.";

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
          image: COACH_IMAGE_URL,
          description: DESCRIPTION,
          jobTitle: "Swimming Coach",
          worksFor: { "@id": `${SITE_URL}/#organization` },
          knowsAbout: ["Swimming coaching", "Water confidence", "Beginner swimming", "Kids swimming lessons", "Stroke development"],
          hasCredential: [
            { "@type": "EducationalOccupationalCredential", name: "ASCA Level 1 — Foundations of Coaching", dateCreated: "2013" },
            { "@type": "EducationalOccupationalCredential", name: "ASCA Level 2 — Stroke School", dateCreated: "2014" },
          ],
          areaServed: { "@type": "City", name: "Abu Dhabi" },
        },
        {
          "@type": "ProfilePage",
          "@id": `${PAGE_URL}#profile`,
          url: PAGE_URL,
          name: TITLE,
          description: DESCRIPTION,
          mainEntity: { "@id": `${SITE_URL}/#coach-ayman` },
          primaryImageOfPage: { "@type": "ImageObject", url: COACH_IMAGE_URL, width: 600, height: 750 },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: ["ar-AE", "en-AE"],
        },
      ],
    }).replace(/</g, "\\u003c");

    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: PAGE_URL },
        { property: "og:image", content: COACH_IMAGE_URL },
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
    eyebrow: "ASCA Level 1 & 2 · أبوظبي",
    title: "خبرة تبني الثقة — خطوة هادئة وصحيحة كل مرة.",
    intro: "كوتش أيمن يجمع بين أكثر من 15 عامًا من خبرة السباحة وشهادات ASCA الموثقة منذ 2013. سواء كان الهدف التغلب على الخوف، التعلم من الصفر، أو تطوير التقنية، يبدأ التدريب من مستواك الحقيقي وليس من خطة واحدة للجميع.",
    talk: "تحدث مع كوتش أيمن",
    lessons: "شاهد برامج السباحة",
    years: "سنوات خبرة في السباحة",
    asca: "Level 1 و Level 2",
    photoCaption: "كوتش أيمن · Relax Fix UAE · أبوظبي",
    photoSub: "تدريب خاص ومجموعات صغيرة حتى 4 متدربين.",
    proofEyebrow: "دليل وليس مجرد وعود",
    proofTitle: "شهادات وخبرة دولية يمكنك الوثوق بها",
    proofBody: "نعرض فقط المؤهلات والخبرات المدعومة بمستندات محفوظة في الأرشيف المهني لكوتش أيمن.",
    asca1: "أساسيات التدريب — شهادة موثقة.",
    asca2: "Stroke School — شهادة موثقة.",
    glance: "في لمحة",
    experience: "الخبرة",
    experienceValue: "أكثر من 15 عامًا في السباحة",
    credentials: "الشهادات",
    credentialsValue: "ASCA Level 1 (2013) · ASCA Level 2 (2014)",
    languages: "اللغات",
    languagesValue: "العربية والإنجليزية",
    formats: "نوع الحصص",
    formatsValue: "خاص ومجموعات صغيرة",
    duration: "مدة الحصة",
    durationValue: "45 دقيقة",
    capacity: "سعة المجموعة",
    capacityValue: "حتى 4 متدربين",
    difference: "الفرق في أسلوب التدريب",
    differenceTitle: "السباح القوي يبدأ عندما يشعر بالأمان الكافي ليتعلم.",
    card1: "ابدأ من مستواك الحقيقي",
    card1Body: "نحدد مستواك الحالي وهدفك ومدى راحتك في الماء قبل اختيار المسار الأنسب.",
    card2: "الثقة قبل الضغط",
    card2Body: "المتدرب المتوتر يتقدم تدريجيًا بشرح واضح وتكرار هادئ بدل الاستعجال.",
    card3: "اهتمام مركز",
    card3Body: "الحصص الخاصة والمجموعات المحدودة إلى أربعة متدربين تجعل الملاحظات أكثر وضوحًا وشخصية.",
    firstStep: "خطوتك الأولى",
    firstTitle: "لا تحتاج أن تكون واثقًا قبل أن تبدأ.",
    firstBody: "أخبر كوتش أيمن أين تقف اليوم — مبتدئ، متوتر من الماء، ولي أمر يبحث عن المدرب المناسب، أو سباح يريد تطوير التقنية — وابدأ بخطوة مناسبة لك.",
    firstCta: "ابدأ الحديث مع كوتش أيمن",
    locations: "مواقع تدريب كوتش أيمن",
    locationHint: "أبوظبي · تفاصيل الموقع ورابط Google Maps",
    whatsapp: "مرحبًا كوتش أيمن، أريد معرفة البرنامج الأنسب لي.",
  },
  en: {
    breadcrumb: "Coach Ayman",
    eyebrow: "ASCA Level 1 & 2 · Abu Dhabi",
    title: "Experience that builds confidence — one calm, correct step at a time.",
    intro: "Coach Ayman brings 15+ years of swimming experience and verified ASCA coaching credentials dating to 2013. Whether the goal is overcoming fear, learning from zero, or improving technique, coaching starts from your real level — not a one-size-fits-all plan.",
    talk: "Talk to Coach Ayman",
    lessons: "View swimming programs",
    years: "Years of swimming experience",
    asca: "Level 1 & Level 2",
    photoCaption: "Coach Ayman · Relax Fix UAE · Abu Dhabi",
    photoSub: "Private coaching and small groups of up to four learners.",
    proofEyebrow: "Proof, not promises",
    proofTitle: "Credentials and international experience you can trust",
    proofBody: "We present only credentials and experience supported by records in Coach Ayman's professional archive.",
    asca1: "Foundations of Coaching — verified certificate.",
    asca2: "Stroke School — verified certificate.",
    glance: "At a glance",
    experience: "Experience",
    experienceValue: "15+ years in swimming",
    credentials: "Credentials",
    credentialsValue: "ASCA Level 1 (2013) · ASCA Level 2 (2014)",
    languages: "Languages",
    languagesValue: "Arabic & English",
    formats: "Lesson formats",
    formatsValue: "Private & small group",
    duration: "Lesson duration",
    durationValue: "45 minutes",
    capacity: "Group capacity",
    capacityValue: "Up to 4 learners",
    difference: "The difference is in the coaching",
    differenceTitle: "A strong swimmer starts with feeling safe enough to learn.",
    card1: "Start from your real level",
    card1Body: "We begin with your current ability, goal, and comfort in the water before choosing the right path.",
    card2: "Confidence before pressure",
    card2Body: "Nervous swimmers progress with clear explanations and calm repetition instead of being rushed.",
    card3: "Focused attention",
    card3Body: "Private lessons and groups capped at four learners keep feedback direct, personal, and easier to apply.",
    firstStep: "Your first step",
    firstTitle: "You do not need to be confident before you start.",
    firstBody: "Tell Coach Ayman where you are today — beginner, nervous swimmer, parent looking for the right coach, or swimmer working on technique — and start with a plan that fits you.",
    firstCta: "Start a conversation with Coach Ayman",
    locations: "Coach Ayman training locations",
    locationHint: "Abu Dhabi · View location details and Google Maps link",
    whatsapp: "Hello Coach Ayman, I would like to know which swimming program is right for me.",
  },
} as const;

function CoachAymanPage() {
  const { lang, dir } = useLang();
  const c = copy[lang];
  const whatsapp = operationalWhatsAppUrl(c.whatsapp);

  return (
    <main dir={dir} className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to={lang === "ar" ? "/" : "/en"} className="font-semibold text-primary hover:underline">Relax Fix UAE</Link>
        <span aria-hidden="true"> · </span>
        <span>{c.breadcrumb}</span>
      </nav>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">{c.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{c.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{c.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)} className="rounded-xl bg-deep px-6 py-3.5 font-black text-white">{c.talk}</a>
              <Link to="/swimming-lessons-abu-dhabi" className="rounded-xl border border-border px-6 py-3.5 font-black hover:bg-muted">{c.lessons}</Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Metric value="15+" label={c.years} />
              <Metric value="ASCA" label={c.asca} />
            </div>
          </div>

          <figure className="relative min-h-[470px] overflow-hidden bg-deep sm:min-h-[560px]">
            <img src="/coach-ayman.webp" alt="Coach Ayman, ASCA-certified swimming coach at Relax Fix UAE in Abu Dhabi" width={600} height={750} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-7 pt-24 text-white">
              <div className="text-sm font-bold uppercase tracking-[0.14em] text-white/75">Relax Fix UAE</div>
              <figcaption className="mt-2 text-2xl font-black">{c.photoCaption}</figcaption>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/80">{c.photoSub}</p>
            </div>
          </figure>
        </div>
      </section>

      <section className="mt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">{c.proofEyebrow}</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{c.proofTitle}</h2>
          <p className="mt-4 leading-7 text-muted-foreground">{c.proofBody}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Proof year="2013" title="ASCA Level 1" body={c.asca1} />
          <Proof year="2014" title="ASCA Level 2" body={c.asca2} />
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-black">{c.glance}</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <Info label={c.experience} value={c.experienceValue} />
            <Info label={c.credentials} value={c.credentialsValue} />
            <Info label={c.languages} value={c.languagesValue} />
            <Info label={c.formats} value={c.formatsValue} />
            <Info label={c.duration} value={c.durationValue} />
            <Info label={c.capacity} value={c.capacityValue} />
          </dl>
        </aside>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-primary">{c.difference}</p>
          <h2 className="mt-3 text-3xl font-black">{c.differenceTitle}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Card title={c.card1} body={c.card1Body} />
            <Card title={c.card2} body={c.card2Body} />
            <Card title={c.card3} body={c.card3Body} />
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-[2rem] bg-deep p-7 text-white sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-white/65">{c.firstStep}</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">{c.firstTitle}</h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{c.firstBody}</p>
        <a href={whatsapp} target="_blank" rel="noreferrer" onClick={() => emitPublicCtaClick("booking_section_whatsapp", lang)} className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 font-black text-deep">{c.firstCta}</a>
      </section>

      <section className="mt-16">
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

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl border border-border bg-muted/35 p-4"><div className="text-2xl font-black text-primary">{value}</div><div className="mt-1 text-sm font-bold">{label}</div></div>;
}

function Proof({ year, title, body }: { year: string; title: string; body: string }) {
  return <article className="rounded-3xl border border-border bg-card p-6 shadow-sm"><p className="text-sm font-black text-primary">{year}</p><h3 className="mt-2 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-bold text-muted-foreground">{label}</dt><dd className="mt-1 font-black">{value}</dd></div>;
}

function Card({ title, body }: { title: string; body: string }) {
  return <article className="rounded-2xl border border-border bg-card p-6"><h3 className="font-black">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{body}</p></article>;
}
