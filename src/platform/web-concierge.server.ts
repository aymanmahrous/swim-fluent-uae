import { randomUUID } from "node:crypto";
import { supabaseSecretRpc } from "./supabase-secret.server";

export type WebConciergeTurnResult =
  | { ok: true; code: "REPLY"; draftReply: string; language: "ar" | "en" }
  | { ok: true; code: "NO_REPLY"; language: "ar" | "en" }
  | { ok: false; code: "INVALID_SESSION" | "UPSTREAM_ERROR" };

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
): Promise<WebConciergeTurnResult> {
  const clientMessageId = randomUUID();

  const ingressResponse = await supabaseSecretRpc("process_web_widget_ingress", {
    p_session_id: sessionId,
    p_client_message_id: clientMessageId,
    p_message: message,
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

  if (!draftReply) {
    return { ok: true, code: "NO_REPLY", language };
  }

  return { ok: true, code: "REPLY", draftReply, language };
}
