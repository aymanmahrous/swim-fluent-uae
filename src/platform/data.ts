import type { ContentItem, IntegrationStatus, Lead, PlatformSnapshot } from "./types";

const SNAPSHOT_KEY = "rfx_os_snapshot_v1";
const demoDataEnabled = import.meta.env.VITE_AI_OS_DEMO_DATA === "true";

const seedLeads: Lead[] = [
  {
    id: "lead-ahmed",
    name: "Ahmed",
    phone: "+971 55 000 0001",
    channel: "instagram",
    stage: "qualified",
    score: 92,
    language: "ar",
    intent: "Kids swimming",
    fearOfWater: true,
    lastActivityAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    humanRequired: false,
  },
  {
    id: "lead-sara",
    name: "Sara",
    channel: "whatsapp",
    stage: "contacted",
    score: 76,
    language: "ar",
    intent: "Aquatic rehabilitation",
    lastActivityAt: new Date(Date.now() - 35 * 60_000).toISOString(),
    humanRequired: true,
  },
  {
    id: "lead-mohamed",
    name: "Mohamed",
    channel: "website",
    stage: "follow_up",
    score: 61,
    language: "en",
    intent: "Private lessons",
    lastActivityAt: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    nextFollowUpAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
  },
];

const integrations: IntegrationStatus[] = [
  {
    id: "supabase",
    label: "Supabase",
    category: "database",
    configured: Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
    ),
    detail: "Client configuration present; operational data access still requires staff auth/RLS",
  },
  {
    id: "meta",
    label: "Meta / Instagram",
    category: "messaging",
    configured: false,
    detail: "OAuth + Webhooks required",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    category: "messaging",
    configured: false,
    detail: "Business Platform credentials required",
  },
  {
    id: "tiktok",
    label: "TikTok Publishing",
    category: "publishing",
    configured: false,
    detail: "Developer app approval required",
  },
  {
    id: "text-ai",
    label: "AI Text Provider",
    category: "ai_text",
    configured: false,
    detail: "Server-side API credential required",
  },
  {
    id: "image-ai",
    label: "AI Image Provider",
    category: "ai_image",
    configured: false,
    detail: "Provider adapter ready for configuration",
  },
  {
    id: "video-ai",
    label: "AI Video Provider",
    category: "ai_video",
    configured: false,
    detail: "Async job provider required",
  },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildThirtyDayPlan(start = new Date()): ContentItem[] {
  const mix: Array<Pick<ContentItem, "type" | "goal" | "topic" | "hook" | "cta">> = [
    {
      type: "reel",
      goal: "Bookings",
      topic: "Fear of water",
      hook: "الخوف من الماء لا يعني أن طفلك لن يتعلم السباحة.",
      cta: "اكتب سباحة في التعليقات",
    },
    {
      type: "educational",
      goal: "Trust",
      topic: "Water confidence",
      hook: "أول مهارة في السباحة ليست حركة الذراعين، بل الأمان في الماء.",
      cta: "احفظ المنشور",
    },
    {
      type: "image",
      goal: "Authority",
      topic: "Coach method",
      hook: "كل سباح يحتاج نقطة بداية مختلفة.",
      cta: "احجز تقييمك",
    },
    {
      type: "story",
      goal: "Engagement",
      topic: "Parent question",
      hook: "هل طفلك يخاف من وضع وجهه في الماء؟",
      cta: "أجب بنعم أو لا",
    },
    {
      type: "reel",
      goal: "Education",
      topic: "Breathing",
      hook: "خطأ واحد يجعل التنفس في الماء أصعب من اللازم.",
      cta: "أرسلها لشخص يتعلم السباحة",
    },
    {
      type: "offer",
      goal: "Bookings",
      topic: "Assessment",
      hook: "لا تختَر برنامجًا قبل أن تعرف نقطة البداية الحقيقية.",
      cta: "احجز التقييم",
    },
    {
      type: "testimonial",
      goal: "Social proof",
      topic: "Progress story",
      hook: "الثقة تُبنى خطوة بخطوة، وليست وعدًا سريعًا.",
      cta: "تواصل معنا",
    },
  ];

  return Array.from({ length: 30 }, (_, index) => {
    const template = mix[index % mix.length];
    const day = new Date(start);
    day.setDate(day.getDate() + index);
    const platform = (["instagram", "facebook", "tiktok"] as const)[index % 3];
    return {
      id: `content-${dateKey(day)}-${index}`,
      date: dateKey(day),
      platform,
      type: template.type,
      goal: template.goal,
      topic: template.topic,
      hook: template.hook,
      caption: `${template.hook}\n\nفي Relax Fix نبدأ من مستوى الشخص الحقيقي ونبني المهارة والثقة بطريقة تدريجية وآمنة.`,
      cta: template.cta,
      hashtags: ["#سباحة", "#ابوظبي", "#CoachAyman", "#RelaxFix"],
      visualPrompt: `Premium aquatic coaching in Abu Dhabi, ${template.topic}, professional commercial photography, deep navy and gold brand direction, authentic human emotion, no text overlay`,
      status: index < 5 ? "needs_review" : "draft",
    };
  });
}

function demoSnapshot(): PlatformSnapshot {
  return {
    leads: seedLeads,
    conversations: seedLeads.map((lead, index) => ({
      id: `conv-${lead.id}`,
      leadId: lead.id,
      channel: lead.channel,
      mode: lead.humanRequired ? "human_required" : index === 0 ? "ai_active" : "paused",
      unread: index + 1,
      lastMessage:
        index === 0
          ? "ابني 8 سنوات ويخاف من الماء"
          : index === 1
            ? "لدي سؤال عن حالة صحية قبل التدريب"
            : "What private slots are available?",
      updatedAt: lead.lastActivityAt,
    })),
    content: buildThirtyDayPlan(),
    integrations,
  };
}

function productionSnapshot(): PlatformSnapshot {
  return {
    leads: [],
    conversations: [],
    content: buildThirtyDayPlan(),
    integrations,
  };
}

export function loadPlatformSnapshot(): PlatformSnapshot {
  if (!demoDataEnabled) return productionSnapshot();
  if (typeof window === "undefined") return demoSnapshot();

  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return demoSnapshot();
    const parsed = JSON.parse(raw) as PlatformSnapshot;
    return { ...demoSnapshot(), ...parsed, integrations };
  } catch {
    return demoSnapshot();
  }
}

export function savePlatformSnapshot(snapshot: PlatformSnapshot): void {
  if (!demoDataEnabled || typeof window === "undefined") return;
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function replaceContentPlan(snapshot: PlatformSnapshot): PlatformSnapshot {
  const next = { ...snapshot, content: buildThirtyDayPlan() };
  savePlatformSnapshot(next);
  return next;
}
