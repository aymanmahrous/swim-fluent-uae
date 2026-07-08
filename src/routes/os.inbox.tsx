import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Hand, PauseCircle, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/os/inbox")({ component: InboxPage });

const ConversationSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  leadName: z.string(),
  channel: z.enum(["instagram", "facebook", "whatsapp", "website"]),
  mode: z.enum(["ai_active", "human_takeover", "human_required", "paused"]),
  unread: z.number().int().nonnegative(),
  lastMessage: z.string(),
  updatedAt: z.string(),
  leadScore: z.number().int(),
  intent: z.string(),
  humanRequired: z.boolean(),
});

const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  direction: z.string(),
  authorType: z.string(),
  body: z.string(),
  safetyClassification: z.string().nullable().optional(),
  createdAt: z.string(),
});

type Conversation = z.infer<typeof ConversationSchema>;
type ConversationMode = Conversation["mode"];

async function fetchInbox() {
  const response = await fetch("/api/os-inbox", { headers: { Accept: "application/json" } });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("INBOX_UNAVAILABLE");
  const parsed = z.array(ConversationSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_INBOX_RESPONSE");
  return parsed.data;
}

async function fetchMessages(conversationId: string) {
  const response = await fetch(`/api/os-inbox?conversationId=${encodeURIComponent(conversationId)}`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("MESSAGES_UNAVAILABLE");
  const parsed = z.array(MessageSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_MESSAGES_RESPONSE");
  return parsed.data;
}

async function setConversationMode(conversationId: string, mode: ConversationMode) {
  const response = await fetch("/api/os-inbox", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ conversationId, mode }),
  });
  if (!response.ok) throw new Error("MODE_UPDATE_FAILED");
  return response.json() as Promise<{ success: boolean; mode?: ConversationMode }>;
}

function InboxPage() {
  const queryClient = useQueryClient();
  const inboxQuery = useQuery({ queryKey: ["os", "inbox"], queryFn: fetchInbox, retry: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && inboxQuery.data?.[0]) setSelectedId(inboxQuery.data[0].id);
    if (selectedId && inboxQuery.data && !inboxQuery.data.some((item) => item.id === selectedId)) {
      setSelectedId(inboxQuery.data[0]?.id ?? null);
    }
  }, [inboxQuery.data, selectedId]);

  const selected = inboxQuery.data?.find((item) => item.id === selectedId) ?? null;
  const messagesQuery = useQuery({
    queryKey: ["os", "inbox", "messages", selectedId],
    queryFn: () => fetchMessages(selectedId as string),
    enabled: Boolean(selectedId),
    retry: false,
  });

  const modeMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: ConversationMode }) => setConversationMode(id, mode),
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error("Conversation mode was not updated.");
        return;
      }
      toast.success("Conversation mode updated.");
      await queryClient.invalidateQueries({ queryKey: ["os", "inbox"] });
    },
    onError: () => toast.error("Unable to update conversation mode."),
  });

  function updateMode(mode: ConversationMode) {
    if (!selected || modeMutation.isPending) return;
    modeMutation.mutate({ id: selected.id, mode });
  }

  return (
    <div>
      <h1 className="text-3xl font-black">AI Inbox</h1>
      <p className="mt-2 text-muted-foreground">
        Real Supabase conversations and messages with explicit AI/human control.
      </p>

      {inboxQuery.isError && (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" />
          {inboxQuery.error.message === "UNAUTHORIZED"
            ? "Staff session required. Sign in at /staff."
            : "Unable to load inbox data from Supabase."}
        </div>
      )}

      <div className="mt-6 grid min-h-[620px] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[330px_1fr]">
        <div className="border-b border-border lg:border-b-0 lg:border-e">
          {inboxQuery.isLoading && (
            <div className="p-6 text-sm text-muted-foreground">Loading conversations...</div>
          )}
          {inboxQuery.data?.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`block w-full border-b border-border p-4 text-start transition hover:bg-muted/40 ${
                conversation.id === selectedId ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{conversation.leadName}</span>
                {conversation.unread > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {conversation.unread}
                  </span>
                )}
              </div>
              <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {conversation.lastMessage || "No messages yet"}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-wide text-primary">
                {conversation.channel} · {conversation.mode}
              </div>
            </button>
          ))}
          {!inboxQuery.isLoading && !inboxQuery.isError && inboxQuery.data?.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">No conversations in Supabase.</div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="border-b border-border p-5">
            <div className="text-xl font-black">{selected?.leadName ?? "Select a conversation"}</div>
            {selected && (
              <div className="text-sm text-muted-foreground">
                Lead score {selected.leadScore}/100 · {selected.intent} · {selected.mode}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 bg-muted/20 p-6">
            {messagesQuery.isLoading && <div className="text-sm text-muted-foreground">Loading messages...</div>}
            {messagesQuery.isError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                Unable to load messages.
              </div>
            )}
            {messagesQuery.data?.map((message) => {
              const outbound = message.direction === "outbound";
              return (
                <div
                  key={message.id}
                  className={`max-w-md rounded-2xl p-4 shadow-sm ${
                    outbound
                      ? "me-auto rounded-bl-sm bg-primary text-primary-foreground"
                      : "ms-auto rounded-br-sm bg-card"
                  }`}
                >
                  <div>{message.body}</div>
                  <div className={`mt-2 text-[10px] ${outbound ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {message.authorType}
                    {message.safetyClassification ? ` · ${message.safetyClassification}` : ""}
                  </div>
                </div>
              );
            })}
            {selected?.humanRequired && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                <ShieldAlert className="me-2 inline h-4 w-4" /> Human review is currently required for this lead.
              </div>
            )}
            {selected && !messagesQuery.isLoading && messagesQuery.data?.length === 0 && (
              <div className="text-sm text-muted-foreground">No messages in this conversation.</div>
            )}
          </div>

          <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => updateMode("human_takeover")}
              disabled={!selected || modeMutation.isPending}
              className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-40"
            >
              <Hand className="me-2 inline h-4 w-4" /> Take over
            </button>
            <button
              type="button"
              onClick={() => updateMode("ai_active")}
              disabled={!selected || modeMutation.isPending}
              className="rounded-xl border border-border px-4 py-3 font-bold disabled:opacity-40"
            >
              <Bot className="me-2 inline h-4 w-4" /> Return to AI
            </button>
            <button
              type="button"
              onClick={() => updateMode("paused")}
              disabled={!selected || modeMutation.isPending}
              className="rounded-xl border border-border px-4 py-3 font-bold disabled:opacity-40"
            >
              <PauseCircle className="me-2 inline h-4 w-4" /> Pause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
