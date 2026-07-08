import { createFileRoute } from "@tanstack/react-router";
import { Film, Image, Sparkles, WandSparkles } from "lucide-react";
import { loadPlatformSnapshot } from "../platform/data";

export const Route = createFileRoute("/os/content")({ component: ContentStudio });

function ContentStudio() {
  const snapshot = loadPlatformSnapshot();
  const providers = snapshot.integrations.filter((x) => x.category.startsWith("ai_"));
  return (
    <div>
      <h1 className="text-3xl font-black">AI Content Studio</h1>
      <p className="mt-2 text-muted-foreground">
        Text, image and video creation with provider-aware states. No fake generation success.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [WandSparkles, "Generate campaign", "30-day strategy, hooks, scripts, captions and CTAs"],
          [
            Image,
            "Analyze / generate image",
            "Understand an uploaded visual or create a new asset",
          ],
          [
            Film,
            "Analyze / generate video",
            "Create async video jobs and write context-aware copy",
          ],
        ].map(([Icon, title, detail]) => {
          const IconComponent = Icon as typeof Sparkles;
          return (
            <button
              key={title as string}
              className="rounded-2xl border border-border bg-card p-6 text-start shadow-sm transition hover:-translate-y-1 hover:border-primary"
            >
              <IconComponent className="h-8 w-8 text-primary" />
              <div className="mt-4 text-xl font-black">{title as string}</div>
              <div className="mt-2 text-sm text-muted-foreground">{detail as string}</div>
            </button>
          );
        })}
      </div>
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-black">Generation providers</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-xl bg-muted/50 p-4">
              <div className="font-bold">{provider.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{provider.detail}</div>
              <div className="mt-3 text-xs font-black text-amber-700">
                {provider.configured ? "READY" : "NOT CONFIGURED — generation is disabled"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
