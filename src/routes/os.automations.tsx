import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  Bot,
  Clock3,
  MessageCircle,
  Split,
  Tag,
  UserRoundCheck,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/os/automations")({ component: AutomationPage });

const nodes = [
  [Zap, "Trigger", "Instagram comment contains: سباحة"],
  [MessageCircle, "Message", "Send a private welcome message"],
  [Split, "Condition", "Child or adult training?"],
  [Tag, "Tag & score", "fear_of_water +10 when relevant"],
  [Bot, "AI reply", "Answer only from Brand Brain + Knowledge Base"],
  [UserRoundCheck, "Human handoff", "Pause for medical/safety questions"],
  [Clock3, "Follow-up", "Maximum 3 attempts; stop on reply/book/opt-out"],
] as const;

function AutomationPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Automations</h1>
      <p className="mt-2 text-muted-foreground">
        Manychat-style flow foundation, specialized for your sales and booking journey.
      </p>
      <div className="mt-8 mx-auto max-w-2xl">
        {nodes.map(([Icon, title, detail], index) => (
          <div key={title}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-black">{title}</div>
                  <div className="text-sm text-muted-foreground">{detail}</div>
                </div>
              </div>
            </div>
            {index < nodes.length - 1 && (
              <div className="grid h-10 place-items-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
