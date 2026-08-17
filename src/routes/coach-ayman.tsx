import { createFileRoute, Link } from "@tanstack/react-router";
import { TRAINING_LOCATIONS, operationalWhatsAppUrl } from "../platform/public-business-config";
import { emitPublicCtaClick } from "../platform/public-cta-events";
import { SITE_URL } from "../platform/public-seo";

const PAGE_URL = `${SITE_URL}/coach-ayman`;
const COACH_IMAGE_URL = `${SITE_URL}/coach-ayman.webp`;
const TITLE = "Coach Ayman | ASCA-Certified Swimming Coach in Abu Dhabi | Relax Fix UAE";
const DESCRIPTION =
  "Meet Coach Ayman, an ASCA Level 1 & 2 certified swimming coach with 15+ years of swimming experience and documented FINA World Cup event involvement in Qatar. Private and small-group lessons across four Relax Fix UAE locations in Abu Dhabi.";

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
          knowsAbout: [
            "Swimming coaching",
            "Water confidence",
            "Beginner swimming",
            "Kids swimming lessons",
            "Stroke development",
          ],
          hasCredential: [
            {
              "@type": "EducationalOccupationalCredential",
              name: "ASCA Level 1 — Foundations of Coaching",
              dateCreated: "2013",
            },
            {
              "@type": "EducationalOccupationalCredential",
              name: "ASCA Level 2 — Stroke School",
              dateCreated: "2014",
            },
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
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: COACH_IMAGE_URL,
            width: 600,
            height: 750,
            caption: "Coach Ayman, ASCA-certified swimming coach at Relax Fix UAE in Abu Dhabi",
          },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: ["en-AE", "ar-AE"],
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
        { property: "og:image", content: COACH_IMAGE_URL },
        { property: "og:image:alt", content: "Coach Ayman, ASCA-certified swimming coach at Relax Fix UAE in Abu Dhabi" },
        { property: "og:image:type", content: "image/webp" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: COACH_IMAGE_URL },
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
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="font-semibold text-primary hover:underline">Relax Fix UAE</Link>
        <span aria-hidden="true"> · </span>
        <span>Coach Ayman</span>
      </nav>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
              ASCA Level 1 & 2 · Abu Dhabi
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Experience that builds confidence — one calm, correct step at a time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Coach Ayman brings 15+ years of swimming experience, verified ASCA coaching credentials
              dating to 2013, and documented involvement in international swimming events in Qatar.
              Whether the goal is overcoming fear, learning from zero, or improving technique, every
              lesson starts with the swimmer&apos;s real level — not a one-size-fits-all plan.
            </p>
            <p lang="ar" dir="rtl" className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-lg leading-8">
              كوتش أيمن يجمع بين أكثر من 15 عامًا من خبرة السباحة، وشهادات ASCA الموثقة منذ 2013،
              وخبرة موثقة في فعاليات سباحة دولية في قطر. سواء كان الهدف التغلب على الخوف، التعلم من
              الصفر، أو تطوير التقنية، يبدأ التدريب من مستواك الحقيقي وبخطوات هادئة وواضحة.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => emitPublicCtaClick("booking_section_whatsapp", "en")}
                className="rounded-xl bg-deep px-6 py-3.5 font-black text-white"
              >
                Talk to Coach Ayman
              </a>
              <Link
                to="/swimming-lessons-abu-dhabi"
                className="rounded-xl border border-border px-6 py-3.5 font-black hover:bg-muted"
              >
                View swimming lessons
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/35 p-4">
                <div className="text-2xl font-black text-primary">15+</div>
                <div className="mt-1 text-sm font-bold">Years of swimming experience</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/35 p-4">
                <div className="text-2xl font-black text-primary">ASCA</div>
                <div className="mt-1 text-sm font-bold">Level 1 & Level 2 certified</div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/35 p-4">
                <div className="text-2xl font-black text-primary">FINA</div>
                <div className="mt-1 text-sm font-bold">Documented World Cup event involvement</div>
              </div>
            </div>
          </div>

          <figure className="relative min-h-[520px] overflow-hidden bg-deep">
            <img
              src="/coach-ayman.webp"
              alt="Coach Ayman, ASCA-certified swimming coach at Relax Fix UAE in Abu Dhabi"
              width={600}
              height={750}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-7 pt-24 text-white">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-white/75">Relax Fix UAE</div>
              <figcaption className="mt-2 text-2xl font-black">Coach Ayman · Abu Dhabi</figcaption>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/80">
                Private coaching and small groups of up to four learners.
              </p>
            </div>
          </figure>
        </div>
      </section>

      <section className="mt-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Proof, not promises</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Credentials and international experience you can verify</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Relax Fix UAE presents only credentials and experience supported by Coach Ayman&apos;s professional archive.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-black text-primary">2013</p>
            <h3 className="mt-2 text-lg font-black">ASCA Level 1</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Foundations of Coaching — verified certificate.
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-black text-primary">2014</p>
            <h3 className="mt-2 text-lg font-black">ASCA Level 2</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Stroke School — verified certificate.
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-black text-primary">2014</p>
            <h3 className="mt-2 text-lg font-black">FINA World Cup experience</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Documented event experience linked to the FINA/Mastbank Swimming World Cup in Qatar.
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-black text-primary">2016</p>
            <h3 className="mt-2 text-lg font-black">International event involvement</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Archived documentation linked to the FINA Airweave Swimming World Cup in Qatar.
            </p>
          </article>
        </div>

        <p lang="ar" dir="rtl" className="mt-7 rounded-3xl border border-border bg-muted/45 p-6 text-lg leading-8">
          هنا لا نعتمد على كلمات تسويقية فقط: لدى كوتش أيمن شهادات ASCA Level 1 وLevel 2 موثقة،
          وسجل خبرة مرتبط بفعاليات كأس العالم للسباحة FINA في قطر. هذه الخبرة تُترجم داخل الحصة إلى
          هدوء في الشرح، ملاحظة أدق للتقنية، وخطة تناسب مستوى المتدرب الحقيقي.
        </p>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-black">At a glance</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="font-bold text-muted-foreground">Experience</dt><dd className="mt-1 font-black">15+ years in swimming</dd></div>
            <div><dt className="font-bold text-muted-foreground">Credentials</dt><dd className="mt-1 font-black">ASCA Level 1 (2013) · ASCA Level 2 (2014)</dd></div>
            <div><dt className="font-bold text-muted-foreground">Languages</dt><dd className="mt-1 font-black">Arabic & English</dd></div>
            <div><dt className="font-bold text-muted-foreground">Lesson formats</dt><dd className="mt-1 font-black">Private & small group</dd></div>
            <div><dt className="font-bold text-muted-foreground">Lesson duration</dt><dd className="mt-1 font-black">45 minutes</dd></div>
            <div><dt className="font-bold text-muted-foreground">Group capacity</dt><dd className="mt-1 font-black">Up to 4 learners</dd></div>
            <div><dt className="font-bold text-muted-foreground">Area</dt><dd className="mt-1 font-black">Abu Dhabi, UAE</dd></div>
          </dl>
        </aside>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">The difference is in the coaching</p>
          <h2 className="mt-3 text-3xl font-black">A strong swimmer starts with feeling safe enough to learn.</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border p-6">
              <h3 className="font-black">Start from your real level</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                The learning path begins with your current ability, goal, and comfort in the water before the right lesson path is confirmed.
              </p>
            </article>
            <article className="rounded-2xl border border-border p-6">
              <h3 className="font-black">Confidence before pressure</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Nervous swimmers are guided progressively, with clear explanations and calm repetition instead of being rushed.
              </p>
            </article>
            <article className="rounded-2xl border border-border p-6">
              <h3 className="font-black">Focused attention</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Private lessons and groups capped at four learners help keep feedback direct, personal, and easier to apply.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-[2rem] border border-border bg-deep p-7 text-white sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-white/65">Your first step</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">You do not need to be confident before you start.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">
              Tell Coach Ayman where you are today — beginner, nervous swimmer, parent looking for the right coach,
              or swimmer working on technique — and start with a clear next step.
            </p>
          </div>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={() => emitPublicCtaClick("booking_section_whatsapp", "en")}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-black text-deep"
          >
            Ask Coach Ayman
          </a>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-black">Coach Ayman training locations</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TRAINING_LOCATIONS.map((location) => (
            <Link
              key={location.id}
              to="/locations/$locationId"
              params={{ locationId: location.id }}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary hover:bg-primary/5"
            >
              <h3 className="font-black">{location.displayName}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Abu Dhabi · View training-location details and Google Maps link
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
