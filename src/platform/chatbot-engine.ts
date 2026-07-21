export const CHATBOT_INTENTS = [
  "services",
  "pricing",
  "booking",
  "locations",
  "schedules",
  "adults",
  "kids",
  "ladies",
  "contact",
] as const;

export type ChatbotIntent = (typeof CHATBOT_INTENTS)[number];
export type ChatbotLanguage = "ar" | "en";

const intentKeywords: Record<ChatbotIntent, readonly string[]> = {
  services: [
    "services",
    "service",
    "swimming",
    "learn",
    "confidence",
    "technique",
    "performance",
    "الخدمات",
    "خدمات",
    "خدمة",
    "سباحة",
    "السباحة",
    "ثقة",
    "تقنية",
    "الأداء",
  ],
  pricing: [
    "price",
    "prices",
    "pricing",
    "cost",
    "aed",
    "dirham",
    "سعر",
    "الأسعار",
    "أسعار",
    "تكلفة",
    "درهم",
  ],
  booking: [
    "booking",
    "book",
    "assessment",
    "appointment",
    "reserve",
    "start",
    "حجز",
    "الحجز",
    "تقييم",
    "موعد",
    "احجز",
    "أبدأ",
    "ابدأ",
  ],
  locations: [
    "location",
    "locations",
    "maps",
    "map",
    "najda",
    "falah",
    "khalifa",
    "mushrif",
    "موقع",
    "الموقع",
    "مواقع",
    "المواقع",
    "خريطة",
    "النجدة",
    "الفلاح",
    "خليفة",
    "المشرف",
    "أين",
  ],
  schedules: [
    "schedule",
    "schedules",
    "hours",
    "availability",
    "available",
    "time",
    "when",
    "مواعيد",
    "المواعيد",
    "ساعات",
    "الدوام",
    "دوام",
    "متاح",
    "وقت",
    "متى",
  ],
  adults: [
    "adult",
    "adults",
    "grown-up",
    "grown ups",
    "بالغ",
    "بالغين",
    "الكبار",
    "للكبار",
    "كبار",
  ],
  kids: [
    "child",
    "children",
    "kid",
    "kids",
    "son",
    "daughter",
    "طفل",
    "أطفال",
    "الأطفال",
    "أطفالي",
    "ابني",
    "ابنتي",
    "ولد",
  ],
  ladies: [
    "lady",
    "ladies",
    "woman",
    "women",
    "female",
    "سيدة",
    "سيدات",
    "النساء",
    "نساء",
    "للسيدات",
  ],
  contact: [
    "contact",
    "whatsapp",
    "phone",
    "call",
    "human",
    "person",
    "speak",
    "team",
    "تواصل",
    "واتساب",
    "هاتف",
    "اتصال",
    "شخص",
    "إنسان",
    "الفريق",
    "أتحدث",
  ],
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectMessageLanguage(message: string, fallback: ChatbotLanguage): ChatbotLanguage {
  if (/[\u0600-\u06ff]/u.test(message)) return "ar";
  if (/[a-z]/iu.test(message)) return "en";
  return fallback;
}

export function detectChatbotIntent(message: string): ChatbotIntent | null {
  const normalized = normalize(message);
  if (!normalized) return null;
  const tokens = normalized.split(" ");

  let best: { intent: ChatbotIntent; score: number; firstMatch: number } | null = null;

  for (const intent of CHATBOT_INTENTS) {
    const matches = intentKeywords[intent]
      .map((keyword) => {
        const normalizedKeyword = normalize(keyword);
        return normalizedKeyword.includes(" ") || normalizedKeyword.includes("-")
          ? normalized.indexOf(normalizedKeyword)
          : tokens.indexOf(normalizedKeyword);
      })
      .filter((index) => index >= 0);
    if (matches.length === 0) continue;

    const candidate = {
      intent,
      score: matches.length,
      firstMatch: Math.min(...matches),
    };
    if (
      !best ||
      candidate.score > best.score ||
      (candidate.score === best.score && candidate.firstMatch < best.firstMatch)
    ) {
      best = candidate;
    }
  }

  return best?.intent ?? null;
}
