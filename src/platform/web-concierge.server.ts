import { randomUUID } from "node:crypto";
import { supabaseSecretRpc } from "./supabase-secret.server";

export type WebConciergeTurnResult =
  | { ok: true; code: "REPLY"; draftReply: string; language: "ar" | "en"; bookingId: string | null }
  | { ok: true; code: "NO_REPLY"; language: "ar" | "en" }
  | { ok: false; code: "INVALID_SESSION" | "UPSTREAM_ERROR" };

export type WebConciergeHistoryTurn = {
  direction: "inbound" | "outbound";
  authorType: string;
  body: string;
  createdAt: string;
};

export type WebConciergeHistoryResult = {
  ok: boolean;
  conversationMode: string | null;
  messages: WebConciergeHistoryTurn[];
};

function safeLanguage(value: unknown): "ar" | "en" {
  return value === "ar" ? "ar" : "en";
}

/**
 * Ingests one web-widget customer message and drafts a reply using the
 * SAME deterministic concierge RPC used by WhatsApp/Messenger/Instagram.
 * Runs server-side only — the Supabase secret key never reaches the browser.
 */
export async function runWebConciergeTurn(
  sessionId: string,
  message: string,
  attribution: Record<string, string> | null,
): Promise<WebConciergeTurnResult> {
  const clientMessageId = randomUUID();

  const ingressResponse = await supabaseSecretRpc("process_web_widget_ingress", {
    p_session_id: sessionId,
    p_client_message_id: clientMessageId,
    p_message: message,
    p_attribution: attribution,
  });

  if (!ingressResponse.ok) {
    return { ok: false, code: "UPSTREAM_ERROR" };
  }

  const ingress: unknown = await ingressResponse.json().catch(() => null);
  if (!ingress || typeof ingress !== "object") {
    return { ok: false, code: "UPSTREAM_ERROR" };
  }
  const ingressData = ingress as Record<string, unknown>;

  if (ingressData.code === "INVALID_SESSION") {
    return { ok: false, code: "INVALID_SESSION" };
  }

  const conversationId = ingressData.conversationId;
  const messageId = ingressData.messageId;
  if (typeof conversationId !== "string" || typeof messageId !== "string") {
    // Duplicate/empty/etc — nothing new to draft a reply for.
    return { ok: true, code: "NO_REPLY", language: safeLanguage(ingressData.language) };
  }

  const turnResponse = await supabaseSecretRpc("process_ai_sales_concierge_turn", {
    p_conversation_id: conversationId,
    p_message_id: messageId,
  });

  if (!turnResponse.ok) {
    return { ok: false, code: "UPSTREAM_ERROR" };
  }

  const turn: unknown = await turnResponse.json().catch(() => null);
  if (!turn || typeof turn !== "object") {
    return { ok: false, code: "UPSTREAM_ERROR" };
  }
  const turnData = turn as Record<string, unknown>;

  const language = safeLanguage(turnData.language);
  const draftReply = typeof turnData.draftReply === "string" ? turnData.draftReply.trim() : "";
  const bookingId = typeof turnData.bookingId === "string" ? turnData.bookingId : null;

  if (!draftReply) {
    return { ok: true, code: "NO_REPLY", language };
  }

  return { ok: true, code: "REPLY", draftReply, language, bookingId };
}

/**
 * Replays the last turns of an existing web session's conversation, reusing
 * the same conversations/messages rows every other channel already uses.
 * Server-side only.
 */
export async function getWebConciergeHistory(sessionId: string): Promise<WebConciergeHistoryResult> {
  const response = await supabaseSecretRpc("get_web_widget_history", { p_session_id: sessionId });
  if (!response.ok) {
    return { ok: false, conversationMode: null, messages: [] };
  }

  const data: unknown = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return { ok: false, conversationMode: null, messages: [] };
  }
  const record = data as Record<string, unknown>;
  const messages = Array.isArray(record.messages) ? (record.messages as WebConciergeHistoryTurn[]) : [];
  const conversationMode = typeof record.conversationMode === "string" ? record.conversationMode : null;

  return { ok: true, conversationMode, messages };
}
