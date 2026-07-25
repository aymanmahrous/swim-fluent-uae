import { useCallback, useRef, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import {
  detectChatbotIntent,
  detectMessageLanguage,
  type ChatbotIntent,
  type ChatbotLanguage,
} from "../platform/chatbot-engine";
import { chatbotKnowledgeFor } from "../platform/chatbot-knowledge";

export type ChatMessage = {
  id: string;
  direction: "inbound" | "outbound"; // inbound = user, outbound = assistant
  body: string;
  intent?: ChatbotIntent | null; // intent detected for outbound messages
  timestamp: Date;
};

export type ChatModeState = {
  messages: ChatMessage[];
  isLoading: boolean;
  lastDetectedLanguage: ChatbotLanguage;
};

type ChatModeActions = {
  sendMessage: (text: string) => void;
  clearHistory: () => void;
  reset: () => void;
};

const INITIAL_STATE: ChatModeState = {
  messages: [],
  isLoading: false,
  lastDetectedLanguage: "ar",
};

/**
 * Hook untuk mengelola Chat Mode state dan logic.
 * Sepenuhnya terisolasi dari Answers/Guided mode.
 * 
 * Intent detection menggunakan engine yang sama, tapi response flow
 * berbeda: setiap pesan ditambah ke history sebagai bubble.
 * 
 * Fallback handling: jika intent null, ada smart quick-reply suggestions.
 */
export function useChatMode(defaultLanguage: ChatbotLanguage = "ar"): [ChatModeState, ChatModeActions] {
  const [state, setState] = useState<ChatModeState>({
    ...INITIAL_STATE,
    lastDetectedLanguage: defaultLanguage,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ChatModeState>(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Auto-scroll ke pesan terakhir
   * Ini penting untuk UX chat yang wajar
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  /**
   * Kirim pesan user dan generate respons assistant
   */
  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Detect language dari pesan user
      const messageLanguage = detectMessageLanguage(trimmed, state.lastDetectedLanguage);

      // 1. Tambahkan pesan user ke history
      const userMessage: ChatMessage = {
        id: nanoid(),
        direction: "inbound",
        body: trimmed,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        lastDetectedLanguage: messageLanguage,
      }));

      // 2. Detect intent dari pesan
      const detectedIntent = detectChatbotIntent(trimmed);

      // 3. Generate respons assistant
      // Simulasi delay kecil (realistik untuk chat UX)
      setTimeout(() => {
        let assistantBody: string;

        if (detectedIntent) {
          // Intent ditemukan → ambil approved answer
          try {
            const knowledge = chatbotKnowledgeFor(detectedIntent);
            assistantBody = knowledge.answer[messageLanguage];
          } catch {
            // Fallback jika knowledge entry hilang (error handling)
            assistantBody =
              messageLanguage === "ar"
                ? "عذرًا، حدث خطأ في معالجة السؤال. جرّب مرة أخرى."
                : "Sorry, there was an error processing your question. Please try again.";
          }
        } else {
          // Intent tidak ditemukan → fallback response dengan suggestions
          assistantBody =
            messageLanguage === "ar"
              ? "لم أتمكن من فهم السؤال بوضوح. اختر من الخيارات الموجودة في وضع الإجابات السريعة أو أعد صياغة السؤال."
              : "I couldn't understand your question clearly. Choose from the options in Quick Answers mode or rephrase your question.";
        }

        const assistantMessage: ChatMessage = {
          id: nanoid(),
          direction: "outbound",
          body: assistantBody,
          intent: detectedIntent,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      }, 300);
    },
    [state.lastDetectedLanguage]
  );

  /**
   * Clear pesan tapi tetap di Chat Mode
   */
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
    }));
  }, []);

  /**
   * Reset sepenuhnya (keluar dari Chat Mode)
   */
  const reset = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      lastDetectedLanguage: state.lastDetectedLanguage,
    });
  }, [state.lastDetectedLanguage]);

  const actions: ChatModeActions = {
    sendMessage,
    clearHistory,
    reset,
  };

  return [state, actions];
}

/**
 * Helper untuk auto-scroll ref
 */
export function useAutoScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  return ref;
}
