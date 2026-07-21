import {
  GENERAL_AVAILABILITY,
  OPERATIONAL_EMAIL,
  PUBLIC_PRICING,
  TRAINING_LOCATIONS,
  WHATSAPP_DISPLAY,
} from "./public-business-config";
import type { ChatbotIntent, ChatbotLanguage } from "./chatbot-engine";

export type ChatbotCta = "pricing" | "booking" | "locations" | "contact" | "whatsapp";

export type ChatbotKnowledgeEntry = {
  intent: ChatbotIntent;
  quickReply: Record<ChatbotLanguage, string>;
  answer: Record<ChatbotLanguage, string>;
  ctas: readonly ChatbotCta[];
};

const locationNamesAr = TRAINING_LOCATIONS.map((location) => location.displayName).join("، ");
const locationNamesEn = TRAINING_LOCATIONS.map((location) => location.displayName).join(", ");

export const CHATBOT_KNOWLEDGE: readonly ChatbotKnowledgeEntry[] = [
  {
    intent: "services",
    quickReply: { ar: "الخدمات المتاحة", en: "Services" },
    answer: {
      ar: "تشمل الخدمات تعلّم السباحة، وبناء الثقة في الماء، وتحسين التقنية والأداء. يبدأ اختيار المسار المناسب بطلب تقييم أولي.",
      en: "Services include learn-to-swim coaching, water confidence, and technique and performance development. Choosing the right path starts with an initial assessment request.",
    },
    ctas: ["booking"],
  },
  {
    intent: "pricing",
    quickReply: { ar: "الأسعار", en: "Pricing" },
    answer: {
      ar: `المجموعة الصغيرة بحد أقصى ${PUBLIC_PRICING.groupMaxSize} أطفال. السعر ${PUBLIC_PRICING.groupChildPriceAED} درهمًا للطفل، وسعر الإخوة ${PUBLIC_PRICING.siblingChildPriceAED} درهم لكل طفل. جلسة الحركة المائية أو البرية ${PUBLIC_PRICING.aquaticSessionPriceAED} درهمًا. لا تحدد هذه الأسعار مدة أو عدد حصص أو باقة.`,
      en: `Small groups are limited to ${PUBLIC_PRICING.groupMaxSize} children. The price is AED ${PUBLIC_PRICING.groupChildPriceAED} per child and AED ${PUBLIC_PRICING.siblingChildPriceAED} per sibling child. An aquatic or land-based movement session is AED ${PUBLIC_PRICING.aquaticSessionPriceAED}. These prices do not specify a duration, number of sessions, or package.`,
    },
    ctas: ["pricing", "booking"],
  },
  {
    intent: "booking",
    quickReply: { ar: "طلب تقييم أو حجز", en: "Assessment or booking" },
    answer: {
      ar: "ابدأ من نموذج طلب التقييم الأولي. اختر الخدمة والموقع والوقت المبدئي، ثم يراجع الفريق الملاءمة وتوفر الموقع والتعارضات. إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا.",
      en: "Start with the initial assessment form. Choose a service, location, and preliminary time, then the team reviews suitability, location availability, and conflicts. Submitting a request does not confirm an appointment.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "locations",
    quickReply: { ar: "مواقع التدريب", en: "Training locations" },
    answer: {
      ar: `مواقع التدريب الحالية: ${locationNamesAr}. افتح قسم مواقع التدريب لاختيار الموقع ورابط Google Maps. يراجع الفريق توفر الموقع قبل تأكيد الموعد.`,
      en: `Current training locations: ${locationNamesEn}. Open the Training Locations section to choose a location and its Google Maps link. The team reviews location availability before confirming an appointment.`,
    },
    ctas: ["locations", "booking"],
  },
  {
    intent: "schedules",
    quickReply: { ar: "ساعات التوفر", en: "General hours" },
    answer: {
      ar: `${GENERAL_AVAILABILITY.weekend.ar}. ${GENERAL_AVAILABILITY.weekdays.ar}. هذه ساعات توفر عامة ولا تضمن توفر كل موقع، لذلك يجب فحص جدول الموقع قبل التأكيد.`,
      en: `${GENERAL_AVAILABILITY.weekend.en}. ${GENERAL_AVAILABILITY.weekdays.en}. These are general availability hours and do not guarantee every location, so the location schedule must be checked before confirmation.`,
    },
    ctas: ["booking"],
  },
  {
    intent: "adults",
    quickReply: { ar: "تدريب البالغين", en: "Adult coaching" },
    answer: {
      ar: "يمكن للبالغين إرسال طلب تقييم أولي لتحديد نقطة البداية والهدف. يراجع الفريق نوع التدريب والموقع والوقت المناسب قبل تأكيد أي موعد.",
      en: "Adults can submit an initial assessment request to establish their starting point and goal. The team reviews the suitable coaching type, location, and time before confirming an appointment.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "kids",
    quickReply: { ar: "تدريب الأطفال", en: "Kids coaching" },
    answer: {
      ar: `تدريب الأطفال متاح ضمن مجموعة صغيرة بحد أقصى ${PUBLIC_PRICING.groupMaxSize} أطفال. يجب أن يقدم الطلب الأب أو الأم أو ولي أمر بالغ. لا ترسل معلومات طبية أو تشخيصية عبر المساعد.`,
      en: `Children's coaching is available in small groups of up to ${PUBLIC_PRICING.groupMaxSize}. A parent or adult guardian must submit the request. Do not send medical or diagnostic information through the assistant.`,
    },
    ctas: ["pricing", "booking"],
  },
  {
    intent: "ladies",
    quickReply: { ar: "استفسار السيدات", en: "Ladies enquiry" },
    answer: {
      ar: "يمكنك إرسال طلب تقييم أولي، وسيؤكد الفريق ما إذا كان خيار التدريب المناسب للسيدات متاحًا حسب الخدمة والموقع والموعد. لا يفترض المساعد توفر حصة مخصصة قبل المراجعة.",
      en: "You can submit an initial assessment request, and the team will confirm whether a suitable ladies' coaching option is available for the service, location, and time. The assistant does not assume a dedicated session is available before review.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "contact",
    quickReply: { ar: "التواصل مع الفريق", en: "Contact the team" },
    answer: {
      ar: `يمكنك التواصل عبر واتساب على ${WHATSAPP_DISPLAY} أو مراجعة قسم التواصل. البريد التشغيلي هو ${OPERATIONAL_EMAIL}. لن يرسل المساعد رسالة تلقائيًا نيابةً عنك.`,
      en: `You can contact the team on WhatsApp at ${WHATSAPP_DISPLAY} or visit the Contact section. The operational email is ${OPERATIONAL_EMAIL}. The assistant will not send a message automatically on your behalf.`,
    },
    ctas: ["whatsapp", "contact"],
  },
] as const;

export const CHATBOT_QUICK_REPLY_INTENTS: readonly ChatbotIntent[] = [
  "services",
  "pricing",
  "booking",
  "locations",
  "schedules",
  "adults",
  "kids",
  "ladies",
  "contact",
];

export function chatbotKnowledgeFor(intent: ChatbotIntent): ChatbotKnowledgeEntry {
  const entry = CHATBOT_KNOWLEDGE.find((item) => item.intent === intent);
  if (!entry) {
    throw new Error(`Missing approved chatbot knowledge for intent: ${intent}`);
  }
  return entry;
}
