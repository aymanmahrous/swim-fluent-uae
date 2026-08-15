import { MessageCircle, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLang } from "../lib/i18n";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";
import { emitPublicCtaClick } from "../platform/public-cta-events";

type ChatTurn = {
  role: "customer" | "ai" | "system";
  text: string;
};

type QuickAction = {
  id: string;
  ar: string;
  en: string;
  message: { ar: string; en: string };
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "nearest-pool",
    ar: "أقرب مسبح",
    en: "Nearest pool",
    message: { ar: "ما أقرب مسبح لي؟", en: "What is the nearest pool to me?" },
  },
  {
    id: "prices",
    ar: "الأسعار",
    en: "Prices",
    message: { ar: "ما هي الأسعار؟", en: "What are the prices?" },
  },
  {
    id: "availability",
    ar: "المواعيد المتاحة",
    en: "Available times",
    message: { ar: "ما المواعيد المتاحة؟", en: "What times are available?" },
  },
  {
    id: "booking",
    ar: "حجز حصة",
    en: "Book a lesson",
    message: { ar: "أريد حجز حصة سباحة.", en: "I would like to book a swimming lesson." },
  },
  {
    id: "fear-of-water",
    ar: "طفلي يخاف من الماء",
    en: "My child is afraid of water",
    message: {
      ar: "طفلي يخاف من الماء، هل يمكن مساعدته؟",
      en: "My child is afraid of water — can you help?",
    },
  },
];

const WEB_AI_CONCIERGE_ENABLED = import.meta.env.VITE_ENABLE_WEB_AI_CONCIERGE === "true";

export function WebAiConcierge() {
  const { lang, dir } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const isArabic = lang === "ar";

  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const copy = isArabic
    ? {
        open: "افتح المساعد الذكي للحجز",
        title: "مساعد Relax Fix الذكي",
        intro: "اسأل عن الأسعار أو المواقع أو المواعيد، أو ابدأ الحجز مباشرة.",
        placeholder: "اكتب سؤالك هنا…",
        send: "إرسال",
        close: "إغلاق",
        quickActions: "أسئلة سريعة",
        fallback:
          "تعذر الوصول للمساعد الآن. يمكنك التواصل مباشرة عبر واتساب وسنرد عليك بأسرع وقت.",
        whatsapp: "متابعة عبر واتساب",
        privacy: "لا نطلب معلومات غير ضرورية، وبياناتك تُستخدم فقط لمتابعة طلبك.",
      }
    : {
        open: "Open the AI booking assistant",
        title: "Relax Fix AI Concierge",
        intro: "Ask about pricing, locations, or availability — or start booking right away.",
        placeholder: "Type your question…",
        send: "Send",
        close: "Close",
        quickActions: "Quick questions",
        fallback:
          "The assistant is temporarily unavailable. You can reach us directly on WhatsApp and we'll reply as soon as possible.",
        whatsapp: "Continue on WhatsApp",
        privacy: "We only ask what's needed to help with your request.",
      };

  if (!WEB_AI_CONCIERGE_ENABLED) return null;

  function scrollToEnd() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setFailed(false);
    setInput("");
    setTurns((prev) => [...prev, { role: "customer", text: trimmed }]);
    setSending(true);
    scrollToEnd();

    try {
      const response = await fetch("/api/web-ai-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error(`status_${response.status}`);
      const data: { success: boolean; code: string; reply: string | null } = await response.json();

      if (!data.success) throw new Error(data.code);

      if (data.reply) {
        setTurns((prev) => [...prev, { role: "ai", text: data.reply as string }]);
      }
    } catch {
      setFailed(true);
      setTurns((prev) => [...prev, { role: "system", text: copy.fallback }]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  }

  function openWidget() {
    emitPublicCtaClick("floating_whatsapp", lang);
    setOpen(true);
    if (turns.length === 0) {
      setTurns([{ role: "ai", text: copy.intro }]);
    }
  }

  function openWhatsApp() {
    const summary = isArabic
      ? "مرحبًا، كنت أتحدث مع المساعد الذكي على الموقع وأحتاج للمتابعة."
      : "Hello, I was chatting with the website AI assistant and would like to continue.";
    window.open(businessWhatsAppUrl(settings, summary), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        type="button"
        onClick={openWidget}
        aria-label={copy.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-24 start-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-elegant transition hover:-translate-y-1 md:bottom-6"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
          dir={dir}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="web-ai-concierge-title"
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant sm:max-h-[85vh]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div>
                <h2 id="web-ai-concierge-title" className="text-lg font-black">
                  {copy.title}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.privacy}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="rounded-full border border-border p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {turns.map((turn, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    turn.role === "customer"
                      ? "ms-auto bg-deep text-white"
                      : turn.role === "system"
                        ? "border border-destructive/30 bg-destructive/5 text-destructive"
                        : "border border-border bg-muted"
                  }`}
                >
                  {turn.text}
                </div>
              ))}
              {sending && (
                <div className="max-w-[60%] rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  …
                </div>
              )}
            </div>

            {turns.length <= 1 && (
              <div className="border-t border-border p-3">
                <p className="mb-2 text-xs font-black text-muted-foreground">{copy.quickActions}</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => sendMessage(action.message[lang])}
                      className="rounded-xl border border-border px-3 py-2 text-start text-xs font-bold transition hover:border-primary hover:bg-primary/5"
                    >
                      {isArabic ? action.ar : action.en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {failed && (
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="w-full rounded-xl bg-deep px-4 py-3 text-center text-sm font-black text-white"
                >
                  {copy.whatsapp}
                </button>
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1000}
                autoComplete="off"
                placeholder={copy.placeholder}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label={copy.send}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-deep text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
