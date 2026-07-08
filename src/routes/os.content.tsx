import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Film, Image, ShieldAlert, Sparkles, WandSparkles } from "lucide-react";
import { fetchProviderStatuses } from "../platform/provider-status";

export const Route = createFileRoute("/os/content")({ component: ContentStudio });

function ContentStudio() {
  const providersQuery = useQuery({
    queryKey: ["os", "integrations"],
    queryFn: fetchProviderStatuses,
    retry: false,
  });
  const providers = providersQuery.data?.filter((item) => item.category.startsWith("ai_")) ?? [];
  const textReady = providers.some((provider) => provider.category === "ai_text" && provider.executable);
  const imageReady = providers.some((provider) => provider.category === "ai_image" && provider.executable);
  const videoReady = providers.some((provider) => provider.category === "ai_video" && provider.executable);

  const actions = [
    {
      icon: WandSparkles,
      title: "Generate campaign",
      detail: "30-day strategy, hooks, scripts, captions and CTAs",
      enabled: textReady,
    },
    {
      icon: Image,
      title: "Analyze / generate image",
      detail: "Understand an uploaded visual or create a new asset",
      enabled: imageReady,
    },
    {
      icon: Film,
      title: "Analyze / generate video",
      detail: "Create async video jobs and write context-aware copy",
      enabled: videoReady,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black">AI Content Studio</h1>
      <p className="mt-2 text-muted-foreground">
        Provider-aware content creation. Generation remains disabled until server configuration and a registered adapter are both ready.
      </p>

      {providersQuery.isError && (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to verify provider readiness.
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map(({ icon: Icon, title, detail, enabled }) => (
          <button
            type="button"
            key={title}
            disabled={!enabled}
            className="rounded-2xl border border-border bg-card p-6 text-start shadow-sm transition enabled:hover:-translate-y-1 enabled:hover:border-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Icon className="h-8 w-8 text-primary" />
            <div className="mt-4 text-xl font-black">{title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
            <div className={`mt-4 text-xs font-black ${enabled ? "text-primary" : "text-amber-700"}`}>
              {enabled ? "EXECUTABLE PROVIDER READY" : "DISABLED — CONFIG OR ADAPTER NOT READY"}
            </div>
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-black">Generation providers</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="h-4 w-4 text-primary" /> {provider.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{provider.detail}</div>
              <div className={`mt-3 text-xs font-black ${provider.executable ? "text-primary" : "text-amber-700"}`}>
                {provider.executable
                  ? "READY TO EXECUTE"
                  : provider.configured
                    ? "CONFIG PRESENT — ADAPTER NOT REGISTERED"
                    : "NOT CONFIGURED — GENERATION DISABLED"}
              </div>
            </div>
          ))}
          {providersQuery.isLoading && (
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">Checking providers...</div>
          )}
        </div>
      </section>
    </div>
  );
}
