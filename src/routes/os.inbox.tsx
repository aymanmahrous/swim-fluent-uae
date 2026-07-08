import { createFileRoute } from "@tanstack/react-router";
import { Bot, Hand, PauseCircle, ShieldAlert } from "lucide-react";
import { loadPlatformSnapshot } from "../platform/data";

export const Route = createFileRoute("/os/inbox")({ component: InboxPage });

function InboxPage() {
  const snapshot = loadPlatformSnapshot();
  const first = snapshot.conversations[0];
  const lead = snapshot.leads.find((item) => item.id === first?.leadId);
  return (
    <div>
      <h1 className="text-3xl font-black">AI Inbox</h1>
      <p className="mt-2 text-muted-foreground">
        Unified conversation workspace with explicit AI/human modes.
      </p>
      <div className="mt-6 grid min-h-[620px] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[330px_1fr]">
        <div className="border-b border-border lg:border-b-0 lg:border-e">
          {snapshot.conversations.map((conversation) => {
            const item = snapshot.leads.find((candidate) => candidate.id === conversation.leadId);
            return (
              <div key={conversation.id} className="border-b border-border p-4 hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{item?.name}</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {conversation.unread}
                  </span>
                </div>
                <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {conversation.lastMessage}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-wide text-primary">
                  {conversation.channel} · {conversation.mode}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col">
          <div className="border-b border-border p-5">
            <div className="text-xl font-black">{lead?.name}</div>
            <div className="text-sm text-muted-foreground">
              Lead score {lead?.score}/100 · {lead?.intent}
            </div>
          </div>
          <div className="flex-1 space-y-4 bg-muted/20 p-6">
            <div className="ms-auto max-w-md rounded-2xl rounded-br-sm bg-card p-4 shadow-sm">
              ابني 8 سنوات ويخاف من الماء
            </div>
            <div className="max-w-md rounded-2xl rounded-bl-sm bg-primary p-4 text-primary-foreground">
              ولا يهمك. نبدأ أولًا ببناء الأمان والثقة مع الماء خطوة بخطوة. هل سبق له السباحة من
              قبل؟
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <ShieldAlert className="me-2 inline h-4 w-4" /> Safety rules are designed to pause AI
              and request Coach Ayman for medical or high-risk questions.
            </div>
          </div>
          <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-3">
            <button className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">
              <Hand className="me-2 inline h-4 w-4" /> Take over
            </button>
            <button className="rounded-xl border border-border px-4 py-3 font-bold">
              <Bot className="me-2 inline h-4 w-4" /> Return to AI
            </button>
            <button className="rounded-xl border border-border px-4 py-3 font-bold">
              <PauseCircle className="me-2 inline h-4 w-4" /> Pause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
