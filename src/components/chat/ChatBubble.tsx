import { useLang } from "../lib/i18n";
import type { ChatMessage } from "../hooks/useChatMode";

export interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * عرض فقاعة رسالة واحدة
 * 
 * RTL handling: للرسائل الصادرة (outbound)، 
 * نستخدم justify-end في RTL وjustify-start في LTR (معكوس الطبيعي)
 * 
 * الألوان:
 * - Inbound (user): bg-muted / text-foreground
 * - Outbound (assistant): bg-primary / text-primary-foreground
 */
export function ChatBubble({ message }: ChatBubbleProps) {
  const { dir } = useLang();
  const isOutbound = message.direction === "outbound";
  const isRTL = dir === "rtl";

  /**
   * للـ RTL:
   * - outbound (assistant) يجب يكون على اليمين (start)
   * - inbound (user) يجب يكون على اليسار (end)
   * 
   * للـ LTR (معكوس):
   * - outbound (assistant) يجب يكون على اليمين (end)
   * - inbound (user) يجب يكون على اليسار (start)
   */
  const containerClass = isRTL
    ? isOutbound
      ? "flex justify-start"
      : "flex justify-end"
    : isOutbound
      ? "flex justify-end"
      : "flex justify-start";

  const bubbleClass = isOutbound
    ? "rounded-2xl rounded-tr-none bg-deep text-white px-4 py-3 max-w-xs shadow-sm"
    : "rounded-2xl rounded-tl-none bg-muted text-foreground px-4 py-3 max-w-xs shadow-sm";

  const timeClass = isOutbound
    ? "text-white/70 text-xs mt-1"
    : "text-muted-foreground text-xs mt-1";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={containerClass}>
      <div className="flex flex-col">
        <div className={bubbleClass}>
          <p className="text-sm leading-relaxed">{message.body}</p>
        </div>
        <div className={timeClass}>{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}

/**
 * Loading indicator أثناء معالجة الرد
 */
export function ChatLoadingBubble() {
  const { dir } = useLang();

  return (
    <div className={dir === "rtl" ? "flex justify-start" : "flex justify-end"}>
      <div className="rounded-2xl rounded-tr-none bg-deep text-white px-4 py-3 max-w-xs shadow-sm">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  );
}
