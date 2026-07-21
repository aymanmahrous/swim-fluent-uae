import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../lib/i18n";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";
import {
  detectChatbotIntent,
  detectMessageLanguage,
  type ChatbotIntent,
  type ChatbotLanguage,
} from "../platform/chatbot-engine";
import {
  CHATBOT_QUICK_REPLY_INTENTS,
  chatbotKnowledgeFor,
  type ChatbotCta,
} from "../platform/chatbot-knowledge";
import { TRAINING_LOCATIONS } from "../platform/public-business-config";

type Goal = "learn" | "confidence" | "performance";
type Learner = "child" | "adult";

type AssistantState = {
  learner?: Learner;
  goal?: Goal;
  location?: string;
};

type AssistantMode = "answers" | "guided";

type AssistantAnswer = {
  intent: ChatbotIntent | null;
  language: ChatbotLanguage;
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
  const [mode, setMode] = useState<AssistantMode>("answers");
  const [state, setState] = useState<AssistantState>({});
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const isArabic = lang === "ar";
  const copy = isArabic
    ? {
        title: "مساعد اختيار البرنامج",
        intro:
          "إجابات معتمدة عن الخدمات والأسعار والمواقع والمواعيد، مع مسار سريع للحجز أو واتساب. لا يتم إرسال أو حفظ ما تكتبه.",
        answersMode: "إجابات سريعة",
        guidedMode: "ساعدني في الاختيار",
        quickReplies: "اختر سؤالًا شائعًا",
        askLabel: "أو اكتب سؤالك بالعربية أو الإنجليزية",
        askPlaceholder: "مثال: ما أسعار تدريب الأطفال؟",
        askSubmit: "إرسال السؤال",
        unknownTitle: "سأحوّلك إلى الخطوة الآمنة",
        unknownBody:
          "لم أتعرف إلى السؤال بثقة. استخدم أحد الخيارات السريعة أو تواصل مع الفريق عبر واتساب. لا ترسل معلومات طبية أو بيانات طفل هنا.",
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
        progress: "اكتمل",
        safety:
          "هذا المساعد لا يقدم تشخيصًا أو علاجًا ولا يتعامل مع الطوارئ. لا ترسل معلومات صحية أو بيانات شخصية حساسة.",
        ctas: {
          pricing: "عرض الأسعار",
          booking: "طلب تقييم أولي",
          locations: "عرض مواقع التدريب",
          contact: "فتح قسم التواصل",
          whatsapp: "التواصل عبر واتساب",
        },
      }
    : {
        title: "Program selection assistant",
        intro:
          "Approved answers about services, pricing, locations, and schedules, with a direct path to booking or WhatsApp. Nothing you type is sent or stored.",
        answersMode: "Quick answers",
        guidedMode: "Help me choose",
        quickReplies: "Choose a common question",
        askLabel: "Or ask in Arabic or English",
        askPlaceholder: "Example: What are the kids coaching prices?",
        askSubmit: "Send question",
        unknownTitle: "Here is the safe next step",
        unknownBody:
          "I could not identify the question confidently. Choose a quick reply or contact the team on WhatsApp. Do not send medical information or a child's personal data here.",
        learner: "Who is the training for?",
        child: "Child",
        adult: "Adult",
        goal: "What is the main goal?",
        learn: "Learn to swim",
        confidence: "Water confidence",
        performance: "Improve performance",
        location: "Choose the nearest area",
        recommendation: "Recommended next step",
        recommendationBody:
          "Start with an assessment request. The coach will confirm suitability and timing before any final booking.",
        book: "Request assessment",
        whatsapp: "Continue on WhatsApp",
        reset: "Start again",
        open: "Open program selection assistant",
        close: "Close assistant",
        progress: "complete",
        safety:
          "This assistant does not diagnose, treat, or handle emergencies. Do not send health information or sensitive personal data.",
        ctas: {
          pricing: "View pricing",
          booking: "Request an assessment",
          locations: "View training locations",
          contact: "Open contact section",
          whatsapp: "Continue on WhatsApp",
        },
      };

  const recommendation = useMemo(() => {
    if (!state.learner || !state.goal || !state.location) return null;
    const learner = state.learner === "child" ? copy.child : copy.adult;
    const goal =
      state.goal === "learn"
        ? copy.learn
        : state.goal === "confidence"
          ? copy.confidence
          : copy.performance;
    return { learner, goal, location: state.location };
  }, [copy.adult, copy.child, copy.confidence, copy.learn, copy.performance, state]);

  const completedAnswers =
    Number(Boolean(state.learner)) + Number(Boolean(state.goal)) + Number(Boolean(state.location));
  const progressPercent = Math.round((completedAnswers / 3) * 100);
  const knowledge = answer?.intent ? chatbotKnowledgeFor(answer.intent) : null;
  const answerCopy = knowledge && answer ? knowledge.answer[answer.language] : null;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const opener = openerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        track("sales_assistant_closed", { language: lang, method: "escape" });
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [lang, open]);

  function openAssistant() {
    setOpen(true);
    track("sales_assistant_opened", { language: lang });
    window.dispatchEvent(new CustomEvent("relaxfix:conversation-start"));
  }

  function closeAssistant(method: "button" | "backdrop") {
    setOpen(false);
    setMessage("");
    setAnswer(null);
    track("sales_assistant_closed", { language: lang, method });
  }

  function selectMode(nextMode: AssistantMode) {
    setMode(nextMode);
    setMessage("");
    setAnswer(null);
    track("sales_assistant_mode_selected", { language: lang, mode: nextMode });
  }

  function showIntent(intent: ChatbotIntent, source: "quick-reply" | "typed-question") {
    const responseLanguage =
      source === "typed-question" ? detectMessageLanguage(message, lang) : lang;
    setAnswer({ intent, language: responseLanguage });
    track("sales_assistant_intent_detected", {
      language: responseLanguage,
      intent,
      source,
    });
  }

  function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const responseLanguage = detectMessageLanguage(message, lang);
    const intent = detectChatbotIntent(message);
    setAnswer({ intent, language: responseLanguage });
    track("sales_assistant_intent_detected", {
      language: responseLanguage,
      intent: intent ?? "unknown",
      source: "typed-question",
    });
  }

  function chooseLearner(learner: Learner) {
    setState((current) => ({ ...current, learner }));
    track("sales_assistant_answered", { language: lang, question: "learner", answer: learner });
  }

  function chooseGoal(goal: Goal) {
    setState((current) => ({ ...current, goal }));
    track("sales_assistant_answered", { language: lang, question: "goal", answer: goal });
  }

  function chooseLocation(location: string) {
    setState((current) => ({ ...current, location }));
    track("sales_assistant_answered", { language: lang, question: "location", answer: location });
  }

  function goToBooking() {
    track("sales_assistant_booking_clicked", {
      language: lang,
      learner: state.learner ?? "unknown",
      goal: state.goal ?? "unknown",
      location: state.location ?? "unknown",
    });
    setOpen(false);
    window.setTimeout(
      () => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }),
      0,
    );
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

  function closeForInternalCta(cta: Exclude<ChatbotCta, "whatsapp">) {
    track("sales_assistant_cta_clicked", {
      language: answer?.language ?? lang,
      intent: answer?.intent ?? "unknown",
      cta,
    });
    setOpen(false);
    setMessage("");
    setAnswer(null);
  }

  function trackWhatsAppHandoff() {
    track("sales_assistant_whatsapp_clicked", {
      language: answer?.language ?? lang,
      intent: answer?.intent ?? "unknown",
      source: "knowledge-answer",
    });
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={openAssistant}
        aria-label={copy.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-24 end-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-deep text-white shadow-elegant transition hover:-translate-y-1 md:bottom-6"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
          dir={dir}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAssistant("backdrop");
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-assistant-title"
            aria-describedby="sales-assistant-description"
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-border bg-card p-5 shadow-elegant sm:max-h-[88vh] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="sales-assistant-title" className="text-xl font-black">
                  {copy.title}
                </h2>
                <p
                  id="sales-assistant-description"
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                >
                  {copy.intro}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => closeAssistant("button")}
                aria-label={copy.close}
                className="rounded-full border border-border p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1"
              aria-label={isArabic ? "طريقة استخدام المساعد" : "Assistant mode"}
            >
              <button
                type="button"
                aria-pressed={mode === "answers"}
                onClick={() => selectMode("answers")}
                className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${
                  mode === "answers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {copy.answersMode}
              </button>
              <button
                type="button"
                aria-pressed={mode === "guided"}
                onClick={() => selectMode("guided")}
                className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${
                  mode === "guided" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {copy.guidedMode}
              </button>
            </div>

            {mode === "answers" ? (
              <div className="mt-6 space-y-5">
                <div>
                  <h3 id="chatbot-quick-replies" className="text-sm font-black">
                    {copy.quickReplies}
                  </h3>
                  <div
                    className="mt-3 grid gap-2 sm:grid-cols-3"
                    aria-labelledby="chatbot-quick-replies"
                  >
                    {CHATBOT_QUICK_REPLY_INTENTS.map((intent) => {
                      const entry = chatbotKnowledgeFor(intent);
                      return (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => showIntent(intent, "quick-reply")}
                          aria-pressed={answer?.intent === intent}
                          className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                            answer?.intent === intent
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary hover:bg-primary/5"
                          }`}
                        >
                          {entry.quickReply[lang]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={submitQuestion}>
                  <label htmlFor="sales-assistant-question" className="text-sm font-black">
                    {copy.askLabel}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="sales-assistant-question"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={240}
                      autoComplete="off"
                      placeholder={copy.askPlaceholder}
                      className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      aria-label={copy.askSubmit}
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-deep text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>

                {answer && (
                  <div
                    role="status"
                    aria-live="polite"
                    dir={answer.language === "ar" ? "rtl" : "ltr"}
                    className="rounded-2xl border border-primary/25 bg-primary/5 p-4"
                  >
                    <div className="font-black">
                      {knowledge
                        ? knowledge.quickReply[answer.language]
                        : answer.language === "ar"
                          ? copy.unknownTitle
                          : "Here is the safe next step"}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {answerCopy ??
                        (answer.language === "ar"
                          ? copy.unknownBody
                          : "I could not identify the question confidently. Choose a quick reply or contact the team on WhatsApp. Do not send medical information or a child's personal data here.")}
                    </p>

                    {answer.intent === "locations" && (
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {TRAINING_LOCATIONS.map((location) => (
                          <li key={location.id}>
                            <a
                              href={location.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 w-full items-center rounded-xl border border-border bg-card px-3 py-2 text-sm font-black text-primary"
                            >
                              {location.displayName} — Google Maps
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(knowledge?.ctas ?? ["whatsapp", "contact"]).map((cta) =>
                        cta === "whatsapp" ? (
                          <a
                            key={cta}
                            href={businessWhatsAppUrl(settings)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={trackWhatsAppHandoff}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-deep px-4 py-2 text-sm font-black text-white"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {copy.ctas.whatsapp}
                          </a>
                        ) : (
                          <a
                            key={cta}
                            href={`#${cta === "booking" ? "book" : cta}`}
                            onClick={() => closeForInternalCta(cta)}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-black"
                          >
                            {copy.ctas[cta]}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <p className="rounded-xl bg-muted/60 px-4 py-3 text-xs leading-6 text-muted-foreground">
                  {copy.safety}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5" aria-label={`${progressPercent}% ${copy.progress}`}>
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>{completedAnswers}/3</span>
                    <span>
                      {progressPercent}% {copy.progress}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <Choice
                    title={copy.learner}
                    options={[
                      ["child", copy.child],
                      ["adult", copy.adult],
                    ]}
                    value={state.learner}
                    onChange={(learner) => chooseLearner(learner as Learner)}
                  />
                  <Choice
                    title={copy.goal}
                    options={[
                      ["learn", copy.learn],
                      ["confidence", copy.confidence],
                      ["performance", copy.performance],
                    ]}
                    value={state.goal}
                    onChange={(goal) => chooseGoal(goal as Goal)}
                  />

                  <div>
                    <div className="mb-3 text-sm font-black">{copy.location}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {TRAINING_LOCATIONS.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => chooseLocation(location.displayName)}
                          aria-pressed={state.location === location.displayName}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold ${state.location === location.displayName ? "border-primary bg-primary/10" : "border-border"}`}
                        >
                          {location.displayName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {recommendation && (
                    <div
                      className="rounded-2xl border border-primary/30 bg-primary/5 p-4"
                      aria-live="polite"
                    >
                      <div className="font-black">{copy.recommendation}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {copy.recommendationBody}
                      </p>
                      <div className="mt-3 text-sm font-bold">
                        {recommendation.learner} · {recommendation.goal} · {recommendation.location}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={!recommendation}
                      onClick={goToBooking}
                      className="rounded-xl bg-deep px-5 py-3 font-black text-white disabled:opacity-40"
                    >
                      {copy.book}
                    </button>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="rounded-xl border border-border px-5 py-3 font-black"
                    >
                      {copy.whatsapp}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setState({});
                      track("sales_assistant_reset", { language: lang });
                    }}
                    className="w-full text-sm font-bold text-muted-foreground"
                  >
                    {copy.reset}
                  </button>
                </div>
              </>
            )}
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
            aria-pressed={value === optionValue}
            className={`rounded-xl border px-4 py-3 text-sm font-bold ${value === optionValue ? "border-primary bg-primary/10" : "border-border"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
