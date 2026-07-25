import { useEffect, useRef } from "react";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { useLang } from "../lib/i18n";
import { useChatMode } from "../hooks/useChatMode";
import { ChatBubble, ChatLoadingBubble } from "./ChatBubble";
import {
  businessWhatsAppUrl,
  fallbackBusinessSettings,
  useBusinessSettings,
} from "../platform/business-settings";

export interface ChatModeContainerProps {
  onClose: () => void;
  onExit: () => void;
}

/**
 * مكوّن Chat Mode المنعزل تماماً
 * 
 * لا يعدّل أي شيء في SalesAssistant.tsx
 * يستقبل callbacks فقط للإغلاق والخروج
 * 
 * الميزات:
 * - سجل محادثة كامل
 * - فقاعات User/Assistant صحيحة
 * - RTL support
 * - Auto-scroll لآخر رسالة
 * - Fallback responses واضحة
 * - Loading indicator
 * - Clear history و Exit buttons
 */
export function ChatModeContainer({ onClose, onExit }: ChatModeContainerProps) {
  const { lang, dir } = useLang();
  const settingsQuery = useBusinessSettings();
  const settings = settingsQuery.data ?? fallbackBusinessSettings;
  const [chatState, chatActions] = useChatMode(lang as "ar" | "en");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  // Copy strings
  const copy = lang === "ar"
    ? {
        title: "وضع المحادثة",
        placeholder: "اكتب سؤالك هنا...",
        send: "إرسال",
        clear: "مسح السجل",
        exit: "خروج",
        back: "رجوع",
        empty: "ابدأ المحادثة بسؤال",
        whatsapp: "التواصل عبر واتساب",
      }
    : {
        title: "Chat Mode",
        placeholder: "Type your question here...",
        send: "Send",
        clear: "Clear history",
        exit: "Exit",
        back: "Back",
        empty: "Start by asking a question",
        whatsapp: "Contact on WhatsApp",
      };

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatState.messages]);

  // Keyboard handling
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = inputRef.current?.value ?? "";
    if (!message.trim()) return;

    chatActions.sendMessage(message);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center"
      dir={dir}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-mode-title"
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-elegant sm:max-h-[88vh] flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-border p-5 sm:p-7 flex items-center justify-between gap-4">
          <div>
            <h2 id="chat-mode-title" className="text-xl font-black">
              {copy.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "ar" ? "محادثة طبيعية مع الرد الفوري" : "Natural conversation with instant replies"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.back}
            className="rounded-full border border-border p-2 hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-5 sm:p-7 space-y-4">
          {chatState.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <MessageCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{copy.empty}</p>
              </div>
            </div>
          ) : (
            <>
              {chatState.messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {chatState.isLoading && <ChatLoadingBubble />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-5 sm:p-7 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={copy.placeholder}
              disabled={chatState.isLoading}
              maxLength={240}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatState.isLoading}
              aria-label={copy.send}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-deep text-white disabled:cursor-not-allowed disabled:opacity-40 transition hover:bg-deep/90"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => chatActions.clearHistory()}
              disabled={chatState.messages.length === 0 || chatState.isLoading}
              className="rounded-xl border border-border px-4 py-2 font-bold text-sm disabled:opacity-40 hover:bg-muted transition flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.clear}</span>
            </button>

            <a
              href={businessWhatsAppUrl(settings)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-deep px-4 py-2 font-bold text-sm text-white transition hover:bg-deep/90 flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.whatsapp}</span>
            </a>

            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-border px-4 py-2 font-bold text-sm hover:bg-muted transition"
            >
              {copy.exit}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
