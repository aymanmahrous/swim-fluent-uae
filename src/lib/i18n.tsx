import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const t = {
  brand: { ar: "ريلاكس فيكس الإمارات", en: "Relax Fix UAE" },
  tagline: { ar: "تدريب سباحة وثقة مائية في أبوظبي", en: "Swimming & Water Confidence Coaching in Abu Dhabi" },
  slogan: { ar: "كوتش أيمن معكم.. فلا خوف عليكم!", en: "Coach Ayman is with you — fear stays behind." },
  offer: { ar: "طلب تقييم أولي", en: "Request an initial assessment" },
  book: { ar: "ابدأ رحلة السباحة", en: "Start Your Swim Journey" },
  home: { ar: "الرئيسية", en: "Home" },
  admin: { ar: "لوحة التحكم", en: "Admin" },
  bookSession: { ar: "احجز تقييمك أو حصتك", en: "Book Your Assessment or Session" },
  fullName: { ar: "الاسم الكامل", en: "Full Name" },
  phone: { ar: "رقم الهاتف", en: "Phone Number" },
  gender: { ar: "الجنس", en: "Gender" },
  male: { ar: "ذكر", en: "Male" },
  female: { ar: "أنثى", en: "Female" },
  category: { ar: "الفئة", en: "Category" },
  boy: { ar: "طفل", en: "Boy" },
  girl: { ar: "طفلة", en: "Girl" },
  adult: { ar: "بالغ", en: "Adult" },
  neighborhood: { ar: "المنطقة", en: "Location" },
  other: { ar: "منطقة أخرى", en: "Other Location" },
  otherLabel: { ar: "اكتب اسم منطقتك", en: "Enter your location" },
  swamBefore: { ar: "هل سبق أن سبحت من قبل؟", en: "Have you swum before?" },
  afraid: { ar: "هل يوجد خوف أو توتر من الماء؟", en: "Is there fear or anxiety around water?" },
  yes: { ar: "نعم", en: "Yes" },
  no: { ar: "لا", en: "No" },
  trainingType: { ar: "نوع التدريب", en: "Training Type" },
  private: { ar: "خاص 1 على 1", en: "Private 1-on-1" },
  semi: { ar: "شبه خاص", en: "Semi-Private" },
  group: { ar: "جماعي صغير", en: "Small Group" },
  slot: { ar: "الوقت المبدئي المفضل", en: "Preferred Preliminary Time" },
  disclaimer: { ar: "السلامة والالتزام", en: "Safety & Commitment" },
  disclaimerText: { ar: "أوافق على تعليمات السلامة والتنظيم الخاصة بالتدريب، وعدم دخول المسبح قبل توجيه المدرب، والالتزام بتعليمات التجهيز والمواعيد وسياسة إعادة الجدولة.", en: "I agree to the coaching safety and operating rules, including no pool entry before coach instruction, required preparation, attendance rules, and the rescheduling policy." },
  agree: { ar: "أوافق على سياسة السلامة والتنظيم", en: "I agree to the safety and operating policy" },
  submit: { ar: "تأكيد طلب الحجز", en: "Confirm Booking Request" },
  success: { ar: "تم حفظ طلبك بنجاح. سنراجع الموعد ونتواصل معك عبر واتساب.", en: "Your request has been saved. We will review the slot and contact you on WhatsApp." },
  why: { ar: "لماذا Relax Fix UAE؟", en: "Why Relax Fix UAE?" },
  feat1: { ar: "تدريب شخصي", en: "Personal Coaching" },
  feat1d: { ar: "تدريب منظم يراعي المستوى ونقطة البداية والهدف داخل الماء.", en: "Structured coaching shaped around each learner’s level, starting point, and goal in the water." },
  feat2: { ar: "سلامة أولاً", en: "Safety First" },
  feat2d: { ar: "التقدم يبدأ من الأمان والسيطرة والتنفس الصحيح قبل السرعة أو المسافة.", en: "Progress starts with safety, control, and breathing before speed or distance." },
  feat3: { ar: "خطة تناسب الحالة", en: "Coaching Built Around You" },
  feat3d: { ar: "تقييم واضح ثم أسلوب تدريب مناسب للهدف والخوف والخبرة السابقة.", en: "A clear assessment followed by coaching matched to your goals, confidence, and experience." },
  contactWA: { ar: "تواصل عبر واتساب", en: "Continue on WhatsApp" },
  footer: { ar: "© 2026 ريلاكس فيكس الإمارات. جميع الحقوق محفوظة.", en: "© 2026 Relax Fix UAE. All rights reserved." },
  adminLogin: { ar: "دخول المسؤول", en: "Admin Login" },
  password: { ar: "كلمة المرور", en: "Password" },
  login: { ar: "دخول", en: "Login" },
  logout: { ar: "خروج", en: "Logout" },
  bookings: { ar: "الحجوزات", en: "Bookings" },
  locations: { ar: "المناطق", en: "Locations" },
  pricing: { ar: "التسعير والمدة", en: "Pricing & Duration" },
  addLocation: { ar: "إضافة منطقة", en: "Add Location" },
  delete: { ar: "حذف", en: "Delete" },
  price: { ar: "السعر (درهم)", en: "Price (AED)" },
  duration: { ar: "المدة (دقيقة)", en: "Duration (min)" },
  save: { ar: "حفظ", en: "Save" },
  fearYes: { ar: "خوف من الماء", en: "Fear of water" },
  noFear: { ar: "لا يوجد خوف", en: "No fear" },
  wrongPass: { ar: "كلمة مرور خاطئة", en: "Wrong password" },
  status: { ar: "الحالة", en: "Status" },
  pending: { ar: "قيد الانتظار", en: "Pending" },
  confirmed: { ar: "مؤكد", en: "Confirmed" },
  completed: { ar: "مكتمل", en: "Completed" },
  heroEyebrow: { ar: "تدريب شخصي • ثقة مائية • أبوظبي", en: "Personal Coaching • Water Confidence • Abu Dhabi" },
  heroTitle: { ar: "لا تتعلم السباحة فقط. تعلم كيف تثق بنفسك داخل الماء.", en: "Don't just learn to swim. Learn to trust yourself in the water." },
  heroBody: { ar: "من أول خوف من الماء إلى تحسين التقنية والأداء، تبدأ الخطة بتقييم واضح وتدريب مناسب لحالتك مع كوتش أيمن.", en: "From first-time water fear to stronger technique and performance, your plan starts with a clear assessment and coaching built around you." },
  viewPrograms: { ar: "استكشف البرامج", en: "Explore Programs" },
  assessment: { ar: "تقييم أولي", en: "Initial Assessment" },
  assessmentValue: { ar: "مناقشة أولية لمعرفة نقطة البداية", en: "Initial conversation to understand your starting point" },
  session: { ar: "مدة الحصة", en: "Session Duration" },
  abuDhabi: { ar: "أبوظبي", en: "Abu Dhabi" },
  coverage: { ar: "مناطق متعددة", en: "Multiple Locations" },
  programsTitle: { ar: "برامج تبدأ من احتياجك الحقيقي", en: "Programs Built Around Your Real Need" },
  programsBody: { ar: "اختيار البرنامج النهائي يتم بعد فهم الهدف والخبرة السابقة ومستوى الراحة داخل الماء.", en: "The final coaching path is chosen after understanding your goal, previous experience, and comfort in the water." },
  programLearn: { ar: "تعلم السباحة", en: "Learn to Swim" },
  programLearnD: { ar: "تأسيس منظم للتنفس والطفو والحركة والثقة.", en: "Structured foundations for breathing, floating, movement, and confidence." },
  programConfidence: { ar: "التغلب على خوف الماء", en: "Water Confidence" },
  programConfidenceD: { ar: "تدرج هادئ وآمن لبناء السيطرة وتقليل التوتر داخل الماء.", en: "A calm, safe progression to build control and reduce anxiety in water." },
  programPerformance: { ar: "تطوير الأداء", en: "Technique & Performance" },
  programPerformanceD: { ar: "تحسين التقنية والكفاءة والتحمل حسب المستوى والهدف.", en: "Improve technique, efficiency, and endurance based on your level and goal." },
  coachTitle: { ar: "كوتش أيمن", en: "Coach Ayman" },
  coachBody: { ar: "أسلوب التدريب يجمع بين الوضوح والانضباط والهدوء. الهدف ليس تنفيذ حركة فقط، بل فهم الماء والسيطرة على الجسم وبناء ثقة يمكن الحفاظ عليها.", en: "The coaching approach combines clarity, discipline, and calm. The goal is not just to copy a movement, but to understand the water, control the body, and build lasting confidence." },
  coachQuote: { ar: "الخوف لا يُكسر بالقوة. يُفهم أولاً، ثم نتحرك خطوة صحيحة بعد خطوة.", en: "Fear is not beaten by force. We understand it first, then take one correct step at a time." },
  wizardIntro: { ar: "خمس خطوات قصيرة تساعدنا على فهمك قبل التواصل.", en: "Five short steps help us understand you before we contact you." },
  stepAbout: { ar: "بياناتك", en: "About You" },
  stepProfile: { ar: "الحالة", en: "Profile" },
  stepGoal: { ar: "التدريب", en: "Coaching" },
  stepTime: { ar: "الموعد", en: "Time" },
  stepConfirm: { ar: "التأكيد", en: "Confirm" },
  next: { ar: "التالي", en: "Next" },
  back: { ar: "السابق", en: "Back" },
  selectDate: { ar: "اختر اليوم", en: "Choose a Day" },
  selectedSummary: { ar: "ملخص الطلب", en: "Request Summary" },
  settingsUnavailable: { ar: "الحجز متوقف مؤقتًا حتى يتم تحميل إعدادات النشاط من الخادم.", en: "Booking is temporarily unavailable until business settings load from the server." },
  requestSaved: { ar: "تم حفظ الطلب في النظام", en: "Request saved in the system" },
  whatsappOptional: { ar: "يمكنك الآن متابعة التواصل عبر واتساب.", en: "You can now continue the conversation on WhatsApp." },
} satisfies Dict;

export type TranslationKey = keyof typeof t;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
}

interface LangProviderProps {
  children: ReactNode;
  initialLang?: Lang;
  persistPreference?: boolean;
}

const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({
  children,
  initialLang = "ar",
  persistPreference = true,
}: LangProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    if (!persistPreference) {
      setLangState(initialLang);
      return;
    }
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, [initialLang, persistPreference]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (persistPreference && typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const tr = (key: TranslationKey) => t[key]?.[lang] ?? String(key);
  return (
    <LangCtx.Provider value={{ lang, setLang, tr, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang outside provider");
  return ctx;
}
