export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "booking_intent"
  | "booked"
  | "follow_up"
  | "lost"
  | "customer";

export type Channel = "instagram" | "facebook" | "whatsapp" | "website";
export type ConversationMode = "ai_active" | "human_takeover" | "human_required" | "paused";
export type ContentStatus =
  | "idea"
  | "draft"
  | "generated"
  | "needs_review"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";
export type ContentType = "reel" | "image" | "story" | "educational" | "offer" | "testimonial";

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  channel: Channel;
  stage: LeadStage;
  score: number;
  language: "ar" | "en";
  intent: string;
  fearOfWater?: boolean;
  lastActivityAt: string;
  nextFollowUpAt?: string;
  humanRequired?: boolean;
}

export interface Conversation {
  id: string;
  leadId: string;
  channel: Channel;
  mode: ConversationMode;
  unread: number;
  lastMessage: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  date: string;
  platform: "instagram" | "facebook" | "tiktok";
  type: ContentType;
  goal: string;
  topic: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  visualPrompt: string;
  status: ContentStatus;
}

export interface IntegrationStatus {
  id: string;
  label: string;
  category: "database" | "messaging" | "publishing" | "ai_text" | "ai_image" | "ai_video";
  configured: boolean;
  detail: string;
}

export interface PlatformSnapshot {
  leads: Lead[];
  conversations: Conversation[];
  content: ContentItem[];
  integrations: IntegrationStatus[];
}
