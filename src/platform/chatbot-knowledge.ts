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
  questions: Record<ChatbotLanguage, readonly string[]>;
  answer: Record<ChatbotLanguage, string>;
  ctas: readonly ChatbotCta[];
};

const locationNamesAr = TRAINING_LOCATIONS.map((location) => location.displayName).join("، ");
const locationNamesEn = TRAINING_LOCATIONS.map((location) => location.displayName).join(", ");

export const CHATBOT_KNOWLEDGE: readonly ChatbotKnowledgeEntry[] = [
  {
    intent: "services",
    quickReply: { ar: "الخدمات المتاحة", en: "Services" },
    questions: {
      ar: ["ما الخدمات المتاحة؟", "ما الخدمات التي تقدمونها؟", "ما نوع خدمات السباحة لديكم؟", "هل تساعدون على تعلم السباحة؟", "هل يوجد تدريب لتحسين تقنية السباحة؟", "أريد بناء الثقة في الماء", "ما برامج السباحة المتوفرة؟", "هل تقدمون تدريبًا لتحسين الأداء؟"],
      en: ["What services do you offer?", "Which services are available?", "What swimming services do you provide?", "Do you help people learn swimming?", "Do you offer swimming technique coaching?", "I want to build confidence in the water", "What swimming programmes are available?", "Do you provide performance coaching?"],
    },
    answer: {
      ar: "تشمل الخدمات تعلّم السباحة، وبناء الثقة في الماء، وتحسين التقنية والأداء. يبدأ اختيار المسار المناسب بطلب تقييم أولي.",
      en: "Services include learn-to-swim coaching, water confidence, and technique and performance development. Choosing the right path starts with an initial assessment request.",
    },
    ctas: ["booking"],
  },
  {
    intent: "pricing",
    quickReply: { ar: "الأسعار", en: "Pricing" },
    questions: {
      ar: ["ما الأسعار؟", "ما أسعار تدريب الأطفال؟", "كم تكلفة التدريب؟", "كم سعر الحصة؟", "ما تكلفة الحصة بالدرهم؟", "هل يوجد سعر خاص للإخوة؟", "كم سعر الطفل في المجموعة؟", "أريد معرفة الأسعار بالدرهم"],
      en: ["What are your prices?", "How much do lessons cost in AED?", "How much is the coaching?", "What is the lesson price?", "What is the session cost in dirhams?", "Is there a sibling price?", "What is the group price per child?", "I want to know the prices in AED"],
    },
    answer: {
      ar: `المجموعة الصغيرة بحد أقصى ${PUBLIC_PRICING.groupMaxSize} أطفال. السعر ${PUBLIC_PRICING.groupChildPriceAED} درهمًا للطفل، وسعر الإخوة ${PUBLIC_PRICING.siblingChildPriceAED} درهم لكل طفل. جلسة الحركة المائية أو البرية ${PUBLIC_PRICING.aquaticSessionPriceAED} درهمًا. لا تحدد هذه الأسعار مدة أو عدد حصص أو باقة.`,
      en: `Small groups are limited to ${PUBLIC_PRICING.groupMaxSize} children. The price is AED ${PUBLIC_PRICING.groupChildPriceAED} per child and AED ${PUBLIC_PRICING.siblingChildPriceAED} per sibling child. An aquatic or land-based movement session is AED ${PUBLIC_PRICING.aquaticSessionPriceAED}. These prices do not specify a duration, number of sessions, or package.`,
    },
    ctas: ["pricing", "booking"],
  },
  {
    intent: "booking",
    quickReply: { ar: "طلب تقييم أو حجز", en: "Assessment or booking" },
    questions: {
      ar: ["أريد حجز موعد تقييم", "كيف أحجز موعدًا؟", "أريد طلب تقييم أولي", "كيف أبدأ الحجز؟", "هل يمكنني حجز تقييم؟", "أريد اختيار موعد للحجز", "هل الطلب يؤكد الموعد؟", "أريد بدء طلب الحجز"],
      en: ["I want to book an assessment appointment", "How do I book?", "I want to request an initial assessment", "How do I start a booking?", "Can I book an assessment?", "I want to choose an appointment for booking", "Does submitting a booking confirm the appointment?", "I want to start a booking request"],
    },
    answer: {
      ar: "ابدأ من نموذج طلب التقييم الأولي. اختر الخدمة والموقع والوقت المبدئي، ثم يراجع الفريق الملاءمة وتوفر الموقع والتعارضات. إرسال الطلب لا يعني أن الموعد أصبح مؤكدًا.",
      en: "Start with the initial assessment form. Choose a service, location, and preliminary time, then the team reviews suitability, location availability, and conflicts. Submitting a request does not confirm an appointment.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "locations",
    quickReply: { ar: "مواقع التدريب", en: "Training locations" },
    questions: {
      ar: ["أين مواقع التدريب؟", "أين موقع المشرف على الخريطة؟", "ما أقرب موقع تدريب؟", "أريد رابط خريطة الموقع", "هل لديكم موقع في النجدة؟", "أين موقع خليفة؟", "ما المواقع المتاحة؟", "كيف أختار موقع التدريب؟"],
      en: ["Where are the training locations?", "Where is the Najda location?", "Which location is nearest?", "I need the location map link", "Do you have a location in Najda?", "Where is the Khalifa location?", "What locations are available?", "How do I choose a training location?"],
    },
    answer: {
      ar: `مواقع التدريب الحالية: ${locationNamesAr}. افتح قسم مواقع التدريب لاختيار الموقع ورابط Google Maps. يراجع الفريق توفر الموقع قبل تأكيد الموعد.`,
      en: `Current training locations: ${locationNamesEn}. Open the Training Locations section to choose a location and its Google Maps link. The team reviews location availability before confirming an appointment.`,
    },
    ctas: ["locations", "booking"],
  },
  {
    intent: "schedules",
    quickReply: { ar: "ساعات التوفر", en: "General hours" },
    questions: {
      ar: ["ما مواعيد الدوام؟", "متى تكونون متاحين؟", "ما ساعات التدريب؟", "ما ساعات العمل؟", "هل يوجد وقت متاح اليوم؟", "أريد معرفة جدول المواعيد", "متى يبدأ التدريب؟", "ما المواعيد المتاحة في نهاية الأسبوع؟"],
      en: ["When are you open?", "What are the general hours?", "What training times are available?", "What are your working hours?", "Is there an available time today?", "I want to know the schedule", "When does the training start?", "What times are available on the weekend?"],
    },
    answer: {
      ar: `${GENERAL_AVAILABILITY.weekend.ar}. ${GENERAL_AVAILABILITY.weekdays.ar}. هذه ساعات توفر عامة ولا تضمن توفر كل موقع، لذلك يجب فحص جدول الموقع قبل التأكيد.`,
      en: `${GENERAL_AVAILABILITY.weekend.en}. ${GENERAL_AVAILABILITY.weekdays.en}. These are general availability hours and do not guarantee every location, so the location schedule must be checked before confirmation.`,
    },
    ctas: ["booking"],
  },
  {
    intent: "adults",
    quickReply: { ar: "تدريب البالغين", en: "Adult coaching" },
    questions: {
      ar: ["هل يوجد تدريب للكبار؟", "أريد تدريب بالغين", "تدريب للكبار", "أنا بالغ ومبتدئ", "هل تقبلون بالغين مبتدئين؟", "أريد تدريبًا مخصصًا للكبار", "هل توجد جلسات بالغين؟", "كيف يبدأ بالغ التدريب؟"],
      en: ["Do you offer adult coaching?", "I want adult coaching", "Adult coaching", "I am an adult beginner", "Do you accept adult beginners?", "I need coaching for adults", "Are adult sessions offered?", "How does an adult begin?"],
    },
    answer: {
      ar: "يمكن للبالغين إرسال طلب تقييم أولي لتحديد نقطة البداية والهدف. يراجع الفريق نوع التدريب والموقع والوقت المناسب قبل تأكيد أي موعد.",
      en: "Adults can submit an initial assessment request to establish their starting point and goal. The team reviews the suitable coaching type, location, and time before confirming an appointment.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "kids",
    quickReply: { ar: "تدريب الأطفال", en: "Kids coaching" },
    questions: {
      ar: ["هل يوجد تدريب أطفال؟", "أريد تدريب أطفالي", "ما تفاصيل تدريب الأطفال؟", "ابني يحتاج تدريبًا", "هل يقبل ولي الأمر تقديم طلب عن طفل؟", "هل يمكن للأم تقديم طلب عن أطفال؟", "كم عدد الأطفال في المجموعة؟", "ابنتي تحتاج تدريبًا"],
      en: ["Do you offer kids coaching?", "I want coaching for my children", "Kids coaching", "My son needs coaching", "Can a parent submit for a child?", "Can a mother submit a request for children?", "How many children are in the group?", "My daughter needs coaching"],
    },
    answer: {
      ar: `تدريب الأطفال متاح ضمن مجموعة صغيرة بحد أقصى ${PUBLIC_PRICING.groupMaxSize} أطفال. يجب أن يقدم الطلب الأب أو الأم أو ولي أمر بالغ. لا ترسل معلومات طبية أو تشخيصية عبر المساعد.`,
      en: `Children's coaching is available in small groups of up to ${PUBLIC_PRICING.groupMaxSize}. A parent or adult guardian must submit the request. Do not send medical or diagnostic information through the assistant.`,
    },
    ctas: ["pricing", "booking"],
  },
  {
    intent: "ladies",
    quickReply: { ar: "استفسار السيدات", en: "Ladies enquiry" },
    questions: {
      ar: ["هل يوجد تدريب للسيدات؟", "أريد تدريبًا للسيدات", "هل توجد حصة مخصصة للسيدات؟", "هل يوجد خيار نسائي للسيدات؟", "أريد خيارًا مناسبًا للسيدات", "هل تقدمون تدريب نساء؟", "كيف يبدأ تدريب للسيدات؟", "هل يمكن تأكيد حصة سيدات؟"],
      en: ["Do you offer ladies coaching?", "I want ladies coaching", "Is a ladies-only session available?", "Do you provide coaching for women?", "I need a suitable option for ladies", "Is there an option for women?", "How does ladies coaching begin?", "Can you confirm a ladies session?"],
    },
    answer: {
      ar: "يمكنك إرسال طلب تقييم أولي، وسيؤكد الفريق ما إذا كان خيار التدريب المناسب للسيدات متاحًا حسب الخدمة والموقع والموعد. لا يفترض المساعد توفر حصة مخصصة قبل المراجعة.",
      en: "You can submit an initial assessment request, and the team will confirm whether a suitable ladies' coaching option is available for the service, location, and time. The assistant does not assume a dedicated session is available before review.",
    },
    ctas: ["booking", "whatsapp"],
  },
  {
    intent: "contact",
    quickReply: { ar: "التواصل مع الفريق", en: "Contact the team" },
    questions: {
      ar: ["كيف أتواصل مع الفريق؟", "أريد التواصل مع الفريق", "ما رقم الواتساب؟", "أريد التحدث مع شخص", "هل يمكنني الاتصال بالفريق؟", "أعطني وسيلة التواصل", "أريد رقم هاتف أو واتساب", "كيف أتحدث مع موظف؟"],
      en: ["How can I contact the team?", "I need to speak to a person on WhatsApp", "What is your WhatsApp number?", "I want to speak to a person", "Can I call the team?", "Please give me the contact details", "I need a phone or WhatsApp number", "How do I speak to a staff member?"],
    },
    answer: {
      ar: `يمكنك التواصل عبر واتساب على ${WHATSAPP_DISPLAY} أو مراجعة قسم التواصل. البريد التشغيلي هو ${OPERATIONAL_EMAIL}. لن يرسل المساعد رسالة تلقائيًا نيابةً عنك.`,
      en: `You can contact the team on WhatsApp at ${WHATSAPP_DISPLAY} or visit the Contact section. The operational email is ${OPERATIONAL_EMAIL}. The assistant will not send a message automatically on your behalf.`,
    },
    ctas: ["whatsapp", "contact"],
  },
] as const;

export const CHATBOT_QUICK_REPLY_INTENTS: readonly ChatbotIntent[] = ["services", "pricing", "booking", "locations", "schedules", "adults", "kids", "ladies", "contact"];

export const CHATBOT_APPROVED_QUESTIONS = CHATBOT_KNOWLEDGE.flatMap((entry) =>
  (["ar", "en"] as const).flatMap((language) =>
    entry.questions[language].map((question) => ({ intent: entry.intent, language, question, answer: entry.answer[language] })),
  ),
);

export function chatbotKnowledgeFor(intent: ChatbotIntent): ChatbotKnowledgeEntry {
  const entry = CHATBOT_KNOWLEDGE.find((item) => item.intent === intent);
  if (!entry) throw new Error(`Missing approved chatbot knowledge for intent: ${intent}`);
  return entry;
}
