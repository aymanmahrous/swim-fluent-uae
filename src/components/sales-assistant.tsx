import { MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLang } from "../lib/i18n";
import { businessWhatsAppUrl, fallbackBusinessSettings, useBusinessSettings } from "../platform/business-settings";

type Goal = "learn" | "confidence" | "performance";
type Learner = "child" | "adult";

type AssistantState = {
  learner?: Learner;
  goal?: Goal;
  location?: string;
};

function track(name: string, metadata: Record<string, string> = {}) {
  window.dispatchEvent(
    new CustomEvent("relaxfix:analytics-event", {
      detail: { name, metadata },
    }),
  );
}

export function SalesAssistant() {
  const { lang, dir } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AssistantState>({});

  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        title: "مساعد اختيار البرنامج",
        intro: "سأساعدك في اختيار المسار المناسب ثم أنقلك للحجز أو واتساب. لا يتم حفظ أي بيانات هنا.",
        learner: "لمن التدريب؟",
        child: "طفل",
        adult: "بالغ",
        goal: "ما الهدف الأساسي؟",
        learn: "تعلم السباحة",
        confidence: "الثقة في الماء",
        performance: "تحسين الأداء",
        location: "اختر المنطقة الأقرب",
        recommendation: "الاقتراح المناسب",
        recommendationBody: "ابدأ بطلب تقييم. سيؤكد المدرب الملاءمة والموعد قبل أي حجز نهائي.",
        book: "طلب تقييم",
        whatsapp: "متابعة عبر واتساب",
        reset: "ابدأ من جديد",
        open: "افتح مساعد اختيار البرنامج",
        close: "إغلاق المساعد",
      }
    : {
        title: "Program selection assistant",
        intro: "I’ll help you choose the right path, then continue to booking or WhatsApp. Nothing entered here is stored.",
        learner: "Who is the training for?",
        child: "Child",
        adult: "Adult",
        goal: "What is the main goal?",
        learn: "Learn to swim",
        confidence: "Water confidence",
        performance: "Improve performance",
        location: "Choose the nearest area",
        recommendation: "Recommended next step",
        recommendationBody: "Start with an assessment request. The coach will confirm suitability and timing before any final booking.",
        book: "Request assessment",
        whatsapp: "Continue on WhatsApp",
        reset: "Start again",
        open: "Open program selection assistant",
        close: "Close assistant",
      };

  const recommendation = useMemo(() => {
    if (!state.learner || !state.goal || !state.location) return null;
    const learner = state.learner === "child" ? copy.child : copy.adult;
    const goal =
      state.goal === "learn" ? copy.learn : state.goal === "confidence" ? copy.confidence : copy.performance;
    return { learner, goal, location: state.location };
  }, [copy.adult, copy.child, copy.confidence, copy.learn, copy.performance, state]);

  function openAssistant() {
    setOpen(true);
    track("sales_assistant_opened", { language: lang });
  }

  function goToBooking() {
    track("sales_assistant_booking_clicked", {
      language: lang,
      learner: state.learner ?? "unknown",
      goal: state.goal ?? "unknown",
      location: state.location ?? "unknown",
    });
    setOpen(false);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  function openWhatsApp() {
    const summary = recommendation
      ? isArabic
        ? `مرحبًا، أريد طلب تقييم. المتدرب: ${recommendation.learner}. الهدف: ${recommendation.goal}. المنطقة: ${recommendation.location}.`
        : `Hello, I would like to request an assessment. Learner: ${recommendation.learner}. Goal: ${recommendation.goal}. Area: ${recommendation.location}.`
      : isArabic
        ? "مرحبًا، أريد المساعدة في اختيار البرنامج المناسب."
        : "Hello, I would like help choosing the right program.";

    track("sales_assistant_whatsapp_clicked", {
      language: lang,
      learner: state.learner ?? "unknown",
      goal: state.goal ?? "unknown",
      location: state.location ?? "unknown",
    });
    window.open(businessWhatsAppUrl(settings, summary), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        type="button"
        onClick={openAssistant}
        aria-label={copy.open}
        className="fixed bottom-24 end-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-deep text-white shadow-elegant transition hover:-translate-y-1 md:bottom-6"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center" dir={dir}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-assistant-title"
            className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-border bg-card p-5 shadow-elegant sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="sales-assistant-title" className="text-xl font-black">{copy.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.intro}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="rounded-full border border-border p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <Choice title={copy.learner} options={[
                ["child", copy.child],
                ["adult", copy.adult],
              ]} value={state.learner} onChange={(learner) => setState((current) => ({ ...current, learner: learner as Learner }))} />

              <Choice title={copy.goal} options={[
                ["learn", copy.learn],
                ["confidence", copy.confidence],
                ["performance", copy.performance],
              ]} value={state.goal} onChange={(goal) => setState((current) => ({ ...current, goal: goal as Goal }))} />

              <div>
                <div className="mb-3 text-sm font-black">{copy.location}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {settings.locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => setState((current) => ({ ...current, location }))}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold ${state.location === location ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {recommendation && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="font-black">{copy.recommendation}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.recommendationBody}</p>
                  <div className="mt-3 text-sm font-bold">
                    {recommendation.learner} · {recommendation.goal} · {recommendation.location}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" disabled={!recommendation} onClick={goToBooking} className="rounded-xl bg-deep px-5 py-3 font-black text-white disabled:opacity-40">
                  {copy.book}
                </button>
                <button type="button" onClick={openWhatsApp} className="rounded-xl border border-border px-5 py-3 font-black">
                  {copy.whatsapp}
                </button>
              </div>

              <button type="button" onClick={() => setState({})} className="w-full text-sm font-bold text-muted-foreground">
                {copy.reset}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Choice({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<[string, string]>;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-black">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(([optionValue, label]) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`rounded-xl border px-4 py-3 text-sm font-bold ${value === optionValue ? "border-primary bg-primary/10" : "border-border"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
