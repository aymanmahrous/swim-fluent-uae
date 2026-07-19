import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "../lib/i18n";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";

const chatbotEnabled = import.meta.env.VITE_ENABLE_CHATBOT_PREVIEW === "true";

type FaqId = "services" | "location" | "assessment" | "children" | "human";

type Faq = {
  id: FaqId;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
};

const approvedFaqs: Faq[] = [
  {
    id: "services",
    questionAr: "ما الخدمات المتاحة؟",
    questionEn: "What services are available?",
    answerAr:
      "تشمل الخدمات تعلّم السباحة، بناء الثقة في الماء، وتحسين التقنية والأداء وفق تقييم نقطة البداية.",
    answerEn:
      "Services include learn-to-swim coaching, water confidence, and technique and performance development based on an initial assessment.",
  },
  {
    id: "location",
    questionAr: "أين يتم التدريب؟",
    questionEn: "Where is coaching available?",
    answerAr:
      "الخدمة متاحة في أبوظبي. يراجع الفريق الموقع المناسب والتوفر عند التواصل أو إرسال طلب التقييم.",
    answerEn:
      "Coaching is available in Abu Dhabi. The team confirms the suitable location and availability after contact or an assessment request.",
  },
  {
    id: "assessment",
    questionAr: "كيف أبدأ؟",
    questionEn: "How do I get started?",
    answerAr:
      "ابدأ بإرسال طلب التقييم من نموذج الموقع. يراجع الفريق مستواك وهدفك والوقت المناسب قبل تأكيد أي موعد.",
    answerEn:
      "Start with the website assessment request. The team reviews your starting level, goal, and suitable time before confirming an appointment.",
  },
  {
    id: "children",
    questionAr: "هل يمكن تقديم طلب لطفل؟",
    questionEn: "Can I request coaching for a child?",
    answerAr:
      "نعم، يجب أن يقدم الطلب الأب أو الأم أو ولي أمر بالغ. لا ترسل معلومات طبية أو تشخيصية عبر المحادثة العامة.",
    answerEn:
      "Yes. The request must be made by a parent or adult guardian. Do not send medical or diagnostic information through the public chat.",
  },
  {
    id: "human",
    questionAr: "أريد التحدث مع شخص",
    questionEn: "I want to speak with a person",
    answerAr:
      "يمكنك الانتقال إلى واتساب للتواصل المباشر مع الفريق. لا يرسل المساعد أي رسالة تلقائيًا نيابةً عنك.",
    answerEn:
      "You can continue to WhatsApp for direct contact with the team. The assistant does not send any message automatically on your behalf.",
  },
];

export function ChatbotPreview() {
  const { lang } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<FaqId | null>(null);

  if (!chatbotEnabled) return null;

  const isArabic = lang === "ar";
  const selected = approvedFaqs.find((faq) => faq.id === selectedId) ?? null;
  const canContact = Boolean(settings.whatsappNumber && settings.publicPhone);

  function openChat() {
    setOpen(true);
    window.dispatchEvent(new CustomEvent("relaxfix:conversation-start"));
  }

  return (
    <div className="fixed bottom-4 end-4 z-[65] sm:bottom-6 sm:end-6">
      {open ? (
        <section
          aria-label={isArabic ? "مساعد Relax Fix UAE" : "Relax Fix UAE assistant"}
          className="mb-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-border bg-background shadow-elegant"
        >
          <header className="flex items-center justify-between bg-deep px-5 py-4 text-white">
            <div>
              <div className="font-black">
                {isArabic ? "مساعد Relax Fix UAE" : "Relax Fix UAE assistant"}
              </div>
              <div className="mt-1 text-xs text-white/65">
                {isArabic ? "إجابات معتمدة وتسليم بشري" : "Approved answers and human handoff"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aqua/30"
              aria-label={isArabic ? "إغلاق المساعد" : "Close assistant"}
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="max-h-[65vh] overflow-y-auto p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {isArabic
                ? "اختر سؤالًا. لا يطلب هذا المساعد اسمك أو هاتفك ولا يحفظ محادثة."
                : "Choose a question. This assistant does not ask for your name or phone number and does not retain a conversation."}
            </p>

            <div className="mt-4 grid gap-2">
              {approvedFaqs.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => setSelectedId(faq.id)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-start text-sm font-bold transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  {isArabic ? faq.questionAr : faq.questionEn}
                </button>
              ))}
            </div>

            {selected && (
              <div role="status" className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm leading-7">
                {isArabic ? selected.answerAr : selected.answerEn}
              </div>
            )}

            {canContact && (
              <a
                href={businessWhatsAppUrl(settings)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-deep px-5 py-3 font-black text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <MessageCircle className="h-5 w-5" />
                {isArabic ? "التحدث مع الفريق عبر واتساب" : "Talk to the team on WhatsApp"}
              </a>
            )}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={openChat}
        className="ms-auto grid h-14 w-14 place-items-center rounded-full bg-deep text-white shadow-elegant transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        aria-label={isArabic ? "فتح المساعد" : "Open assistant"}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
