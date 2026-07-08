import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const t = {
  brand: { ar: "ريلاكس فيكس الإمارات", en: "Relax Fix UAE" },
  tagline: {
    ar: "أكاديمية السباحة والعلاج المائي - أبوظبي",
    en: "Swimming & Aquatic Therapy Academy - Abu Dhabi",
  },
  slogan: { ar: "كوتش أيمن معكم.. فلا خوف عليكم!", en: "Coach Ayman is with you.. No fear ahead!" },
  offer: {
    ar: "عرض الافتتاح: 150 درهم لكل حصة 45 دقيقة بدلاً من 200 درهم! جلسة التقييم الأولى مجانية 100%",
    en: "Opening Offer: 150 AED per 45-minute session instead of 200 AED! 100% Free First Assessment Session",
  },
  book: { ar: "احجز الآن", en: "Book Now" },
  home: { ar: "الرئيسية", en: "Home" },
  admin: { ar: "لوحة التحكم", en: "Admin" },
  bookSession: { ar: "احجز حصتك", en: "Book Your Session" },
  fullName: { ar: "الاسم الكامل", en: "Full Name" },
  phone: { ar: "رقم الهاتف", en: "Phone Number" },
  gender: { ar: "الجنس", en: "Gender" },
  male: { ar: "ذكر", en: "Male" },
  female: { ar: "أنثى", en: "Female" },
  category: { ar: "الفئة العمرية", en: "Age Category" },
  boy: { ar: "طفل", en: "Boy" },
  girl: { ar: "طفلة", en: "Girl" },
  adult: { ar: "بالغ", en: "Adult" },
  pod: { ar: "أصحاب همم", en: "People of Determination" },
  neighborhood: { ar: "المنطقة", en: "Neighborhood" },
  other: { ar: "أخرى", en: "Other" },
  otherLabel: { ar: "اكتب اسم منطقتك", en: "Enter your neighborhood" },
  swamBefore: { ar: "هل سبق أن سبحت من قبل؟", en: "Have you swam before?" },
  afraid: { ar: "هل تخاف من الماء؟", en: "Afraid of water?" },
  yes: { ar: "نعم", en: "Yes" },
  no: { ar: "لا", en: "No" },
  trainingType: { ar: "نوع التدريب", en: "Training Type" },
  private: { ar: "خاص 1 على 1", en: "Private 1-on-1" },
  semi: { ar: "شبه خاص", en: "Semi-Private" },
  group: { ar: "جماعي (4 كحد أقصى، عمر 3.5-12)", en: "Group (Max 4, ages 3.5-12)" },
  slot: { ar: "اختر الموعد", en: "Choose Time Slot" },
  disclaimer: { ar: "الإقرار والالتزام", en: "Commitment & Safety Policy" },
  disclaimerText: {
    ar: "أقر بالالتزام بقواعد كابتن أيمن الصارمة: عدم نزول المسبح قبل إذن المدرب، الالتزام بالنظارة وغطاء الرأس، والصيام التام عن الأكل قبل الحصة بساعتين. كما أوافق على السياسة التشغيلية: يحق لي الاعتذار أو التعديل لمرة واحدة فقط شهرياً للأعذار الخارجة عن الإرادة، ويجب إنهاء جميع الحصص التدريبية خلال نفس الشهر الميلادي ولا تُرحّل للشهر التالي تحت أي ظرف.",
    en: "I agree to Coach Ayman's strict rules: No pool entry before coach instructions, mandatory swim cap/goggles, and absolute fasting 2 hours prior to the session. I acknowledge the operational policy: Rescheduling is allowed only once per month for unavoidable circumstances, and all sessions must be fully completed within the same calendar month with no carry-overs.",
  },
  agree: { ar: "أوافق على جميع البنود", en: "I agree to all terms" },
  submit: { ar: "تأكيد الحجز", en: "Confirm Booking" },
  success: {
    ar: "تم استلام حجزك! سيتم التواصل معك قريباً عبر واتساب.",
    en: "Booking received! You'll be contacted via WhatsApp shortly.",
  },
  why: { ar: "لماذا نحن", en: "Why Choose Us" },
  feat1: { ar: "مدرب معتمد", en: "Certified Coach" },
  feat1d: {
    ar: "خبرة أكثر من 15 عاماً في تدريب السباحة والعلاج المائي",
    en: "15+ years experience in swimming & aquatic therapy",
  },
  feat2: { ar: "بيئة آمنة", en: "Safe Environment" },
  feat2d: {
    ar: "بروتوكولات سلامة صارمة لجميع الفئات العمرية",
    en: "Strict safety protocols for all age groups",
  },
  feat3: { ar: "جميع المستويات", en: "All Levels" },
  feat3d: {
    ar: "من المبتدئين إلى المحترفين وأصحاب الهمم",
    en: "Beginners to advanced & people of determination",
  },
  contactWA: { ar: "تواصل عبر واتساب", en: "Contact via WhatsApp" },
  footer: {
    ar: "© 2026 ريلاكس فيكس الإمارات. جميع الحقوق محفوظة.",
    en: "© 2026 Relax Fix UAE. All rights reserved.",
  },
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
  fearYes: { ar: "⚠️ خوف من الماء", en: "⚠️ Fear of water" },
  noFear: { ar: "لا يوجد خوف", en: "No fear" },
  wrongPass: { ar: "كلمة مرور خاطئة", en: "Wrong password" },
  status: { ar: "الحالة", en: "Status" },
  pending: { ar: "قيد الانتظار", en: "Pending" },
  confirmed: { ar: "مؤكد", en: "Confirmed" },
  completed: { ar: "مكتمل", en: "Completed" },
} satisfies Dict;

export type TranslationKey = keyof typeof t;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
}

const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
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
