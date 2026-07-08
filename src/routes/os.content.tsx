import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Film, Image, ShieldAlert, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { fetchProviderStatuses } from "../platform/provider-status";

export const Route = createFileRoute("/os/content")({ component: ContentStudio });

const GenerationResultSchema = z.object({
  success: z.literal(true),
  contentItemIds: z.array(z.string().uuid()),
  count: z.number().int().positive(),
  status: z.literal("needs_review"),
});

const GenerationErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: z.string(),
  message: z.string().optional(),
});

async function generateCampaign(input: {
  goal: string;
  audience: string;
  topic: string;
  days: number;
  language: "ar" | "en";
}) {
  const response = await fetch("/api/os-content-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = GenerationErrorSchema.safeParse(body);
    throw new Error(parsedError.success ? parsedError.data.code : `GENERATION_HTTP_${response.status}`);
  }

  const parsed = GenerationResultSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_GENERATION_RESPONSE");
  return parsed.data;
}

function ContentStudio() {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [goal, setGoal] = useState("Bookings");
  const [audience, setAudience] = useState("Adults and parents in Abu Dhabi seeking swimming or water-confidence coaching");
  const [topic, setTopic] = useState("Swimming confidence and Coach Ayman's safe progressive coaching method");
  const [days, setDays] = useState(7);
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  const providersQuery = useQuery({
    queryKey: ["os", "integrations"],
    queryFn: fetchProviderStatuses,
    retry: false,
  });
  const providers = providersQuery.data?.filter((item) => item.category.startsWith("ai_")) ?? [];
  const textReady = providers.some((provider) => provider.category === "ai_text" && provider.executable);
  const imageReady = providers.some((provider) => provider.category === "ai_image" && provider.executable);
  const videoReady = providers.some((provider) => provider.category === "ai_video" && provider.executable);

  const generationMutation = useMutation({
    mutationFn: generateCampaign,
    onSuccess: (result) => {
      toast.success(`${result.count} content items saved as needs_review.`);
      setShowCampaignForm(false);
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "GENERATION_FAILED";
      if (code === "PROVIDER_NOT_READY") {
        toast.error("Text generation provider adapter is not ready. No content was created.");
        return;
      }
      if (code === "INVALID_PROVIDER_OUTPUT") {
        toast.error("Provider output failed structured validation. Nothing was saved.");
        return;
      }
      toast.error(`Content generation failed: ${code}`);
    },
  });

  const actions = [
    {
      icon: WandSparkles,
      title: "Generate campaign",
      detail: "Strategy, hooks, scripts, captions and CTAs saved for human review",
      enabled: textReady,
      onClick: () => setShowCampaignForm(true),
    },
    {
      icon: Image,
      title: "Analyze / generate image",
      detail: "Understand an uploaded visual or create a new asset",
      enabled: imageReady,
      onClick: () => undefined,
    },
    {
      icon: Film,
      title: "Analyze / generate video",
      detail: "Create async video jobs and write context-aware copy",
      enabled: videoReady,
      onClick: () => undefined,
    },
  ];

  function submitCampaign(event: React.FormEvent) {
    event.preventDefault();
    if (!textReady || generationMutation.isPending) return;
    generationMutation.mutate({ goal, audience, topic, days, language });
  }

  return (
    <div>
      <h1 className="text-3xl font-black">AI Content Studio</h1>
      <p className="mt-2 text-muted-foreground">
        Provider-aware content creation. Generated items are validated and saved atomically as needs_review before any publishing step.
      </p>

      {providersQuery.isError && (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to verify provider readiness.
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {actions.map(({ icon: Icon, title, detail, enabled, onClick }) => (
          <button
            type="button"
            key={title}
            disabled={!enabled}
            onClick={onClick}
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

      {showCampaignForm && (
        <section className="mt-8 rounded-2xl border border-primary/25 bg-card p-6 shadow-elegant">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Generate a content batch</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Provider output must match the structured schema. The full batch is saved in one database transaction or not saved at all.
              </p>
            </div>
            <button type="button" onClick={() => setShowCampaignForm(false)} className="text-sm font-bold text-muted-foreground">
              Close
            </button>
          </div>

          <form onSubmit={submitCampaign} className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-black">Goal</span>
              <input value={goal} onChange={(event) => setGoal(event.target.value)} minLength={2} maxLength={200} required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black">Language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as "ar" | "en")} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary">
                <option value="ar">Arabic</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-black">Audience</span>
              <textarea value={audience} onChange={(event) => setAudience(event.target.value)} minLength={2} maxLength={300} required rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-black">Topic / campaign direction</span>
              <textarea value={topic} onChange={(event) => setTopic(event.target.value)} minLength={2} maxLength={300} required rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-black">Number of days</span>
              <input type="number" min={1} max={30} value={days} onChange={(event) => setDays(Number(event.target.value))} required className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={!textReady || generationMutation.isPending} className="w-full rounded-xl bg-deep px-5 py-3 font-black text-white disabled:opacity-45">
                {generationMutation.isPending ? "Generating and validating..." : "Generate and save for review"}
              </button>
            </div>
          </form>
        </section>
      )}

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
