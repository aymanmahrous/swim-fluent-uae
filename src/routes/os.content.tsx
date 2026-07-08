import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Copy,
  Database,
  ExternalLink,
  Image,
  ShieldAlert,
  Sparkles,
  Video,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  createAiVideo,
  fetchAiVideoJob,
  generateAiImage,
  generateMatchingCopy,
} from "../platform/os-media-generation";
import { fetchOsContentItems } from "../platform/os-read-models";
import { fetchProviderStatuses } from "../platform/provider-status";

export const Route = createFileRoute("/os/content")({ component: ContentPage });

const GenerateResponseSchema = z.object({
  success: z.literal(true),
  contentItemIds: z.array(z.string().uuid()),
  count: z.number().int().positive(),
  status: z.literal("needs_review"),
});

const campaignDefaults = {
  goal: "Bookings",
  audience: "Parents and adult swimmers in Abu Dhabi",
  topic: "Water confidence and swimming progress",
  days: 30,
  language: "ar" as "ar" | "en",
};

type MediaKind = "image" | "video";
type Platform = "instagram" | "facebook" | "tiktok";
type MatchingMedia = { type: MediaKind; prompt: string };

async function generateCampaign(input: typeof campaignDefaults) {
  const response = await fetch("/api/os-content-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = z.object({ code: z.string().optional() }).safeParse(body);
    throw new Error(error.success && error.data.code ? error.data.code : "CONTENT_GENERATION_FAILED");
  }
  const parsed = GenerateResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("INVALID_GENERATION_RESPONSE");
  return parsed.data;
}

function providerReady(
  providers: Awaited<ReturnType<typeof fetchProviderStatuses>>,
  id: string,
): boolean {
  return providers.some((provider) => provider.id === id && provider.executable);
}

function errorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const messages: Record<string, string> = {
    PROVIDER_NOT_READY: "المزوّد غير مفعّل بعد. أضف مفاتيح الخادم المطلوبة في Vercel.",
    ALIBABA_MODEL_STUDIO_NOT_CONFIGURED: "Alibaba Model Studio غير مهيأ على الخادم.",
    IMAGE_GENERATION_FAILED: "تعذر توليد الصورة الآن.",
    VIDEO_GENERATION_FAILED: "تعذر إنشاء مهمة الفيديو الآن.",
    COPY_GENERATION_FAILED: "تعذر توليد النص المطابق الآن.",
    UNAUTHORIZED: "انتهت جلسة الموظف. سجّل الدخول مرة أخرى.",
  };
  return messages[code] ?? code.replaceAll("_", " ");
}

function ContentPage() {
  const queryClient = useQueryClient();
  const [campaign, setCampaign] = useState(campaignDefaults);
  const [mediaMode, setMediaMode] = useState<MediaKind>("image");
  const [contentItemId, setContentItemId] = useState("");
  const [imagePrompt, setImagePrompt] = useState(
    "Premium cinematic swimming lesson in Abu Dhabi, Coach Ayman guiding a nervous adult swimmer with calm confidence, deep navy water, aqua highlights, realistic photography, no text, no logo",
  );
  const [imageRatio, setImageRatio] = useState<"1:1" | "4:5" | "5:4" | "9:16" | "16:9" | "3:4" | "4:3">("4:5");
  const [videoPrompt, setVideoPrompt] = useState(
    "Cinematic vertical social video of a calm professional swimming coach helping an adult gain water confidence in a premium Abu Dhabi pool, natural movement, realistic water, confident emotional progression, no text",
  );
  const [videoSourceUrl, setVideoSourceUrl] = useState("");
  const [videoRatio, setVideoRatio] = useState<"16:9" | "9:16" | "1:1" | "4:3" | "3:4">("9:16");
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [notifiedVideoState, setNotifiedVideoState] = useState("");
  const [matchingMedia, setMatchingMedia] = useState<MatchingMedia | null>(null);
  const [copyPlatform, setCopyPlatform] = useState<Platform>("instagram");
  const [copyLanguage, setCopyLanguage] = useState<"ar" | "en">("ar");
  const [copyGoal, setCopyGoal] = useState("Bookings and qualified conversations");

  const providersQuery = useQuery({
    queryKey: ["os", "provider-statuses"],
    queryFn: fetchProviderStatuses,
    retry: false,
  });
  const contentItemsQuery = useQuery({
    queryKey: ["os", "content-items"],
    queryFn: fetchOsContentItems,
    retry: false,
  });

  const providers = providersQuery.data ?? [];
  const textReady = providerReady(providers, "text-ai");
  const imageReady = providerReady(providers, "image-ai");
  const videoReady = providerReady(providers, "video-ai");
  const contentItems = contentItemsQuery.data ?? [];

  const generation = useMutation({
    mutationFn: generateCampaign,
    onSuccess: async (data) => {
      toast.success(`${data.count} content items saved for human review.`);
      await queryClient.invalidateQueries({ queryKey: ["os", "content-items"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const imageGeneration = useMutation({
    mutationFn: generateAiImage,
    onSuccess: async () => {
      setMatchingMedia({ type: "image", prompt: imagePrompt });
      toast.success("تم توليد الصورة وحفظها دائمًا في Media Library.");
      await queryClient.invalidateQueries({ queryKey: ["os", "media-assets"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const videoCreation = useMutation({
    mutationFn: createAiVideo,
    onSuccess: (data) => {
      setVideoJobId(data.jobId);
      setMatchingMedia({ type: "video", prompt: videoPrompt });
      setNotifiedVideoState("");
      toast.success("بدأت مهمة الفيديو. ستتم المتابعة والحفظ تلقائيًا عند اكتمالها.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const videoJobQuery = useQuery({
    queryKey: ["os", "video-job", videoJobId],
    queryFn: () => fetchAiVideoJob(videoJobId as string),
    enabled: Boolean(videoJobId),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "succeeded" || status === "failed" ? false : 15_000;
    },
  });

  useEffect(() => {
    const state = videoJobQuery.data;
    if (!state || !videoJobId) return;
    const marker = `${videoJobId}:${state.status}`;
    if (marker === notifiedVideoState) return;
    if (state.status === "succeeded") {
      setNotifiedVideoState(marker);
      toast.success("اكتمل الفيديو وتم حفظه دائمًا في Media Library.");
      void queryClient.invalidateQueries({ queryKey: ["os", "media-assets"] });
    } else if (state.status === "failed") {
      setNotifiedVideoState(marker);
      toast.error(state.error ?? "فشلت مهمة الفيديو.");
    }
  }, [notifiedVideoState, queryClient, videoJobId, videoJobQuery.data]);

  const matchingCopy = useMutation({
    mutationFn: generateMatchingCopy,
    onSuccess: () => toast.success("تم توليد نص مطابق لفكرة الصورة أو الفيديو."),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const latestMediaUrl = useMemo(() => {
    if (imageGeneration.data?.publicUrl && matchingMedia?.type === "image") {
      return imageGeneration.data.publicUrl;
    }
    if (videoJobQuery.data?.publicUrl && matchingMedia?.type === "video") {
      return videoJobQuery.data.publicUrl;
    }
    return null;
  }, [imageGeneration.data?.publicUrl, matchingMedia?.type, videoJobQuery.data?.publicUrl]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black">AI Content Studio</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Real Qwen/Wan provider adapters, permanent media storage and human review. No provider is represented as executable until its server credentials are configured.
          </p>
        </div>
        <Link to="/os/media" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-black">
          <Database className="h-4 w-4" /> Open Media Library
        </Link>
      </div>

      {providersQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to verify provider readiness. Generation remains closed.
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          ["text-ai", WandSparkles, "Campaign text engine", "Creates structured hooks, captions, CTAs, hashtags and visual prompts, then saves them as needs_review.", textReady],
          ["image-ai", Image, "AI image generation", "Generates one Wan image and immediately copies temporary provider output into permanent Supabase Storage.", imageReady],
          ["video-ai", Video, "AI video generation", "Creates a Wan async text-to-video or image-to-video task, polls it and persists successful output to Media Library.", videoReady],
        ].map(([id, Icon, title, detail, ready]) => {
          const ProviderIcon = Icon as typeof Image;
          return (
            <article key={id as string} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><ProviderIcon className="h-6 w-6" /></div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${ready ? "bg-success/10 text-success" : "bg-gold/15 text-gold-foreground"}`}>
                  {ready ? "READY" : "NOT CONFIGURED"}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black">{title as string}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail as string}</p>
            </article>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">Visual generation workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">Generate, persist and catalog the asset before using it in publishing workflows.</p>
          </div>
          <div className="flex rounded-xl border border-border bg-muted p-1">
            <button onClick={() => setMediaMode("image")} className={`rounded-lg px-4 py-2 text-sm font-black ${mediaMode === "image" ? "bg-card text-primary shadow" : "text-muted-foreground"}`}><Image className="me-2 inline h-4 w-4" /> Image</button>
            <button onClick={() => setMediaMode("video")} className={`rounded-lg px-4 py-2 text-sm font-black ${mediaMode === "video" ? "bg-card text-primary shadow" : "text-muted-foreground"}`}><Video className="me-2 inline h-4 w-4" /> Video</button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-sm font-black">
              Attach to content item (optional)
              <select value={contentItemId} onChange={(event) => setContentItemId(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal">
                <option value="">Standalone media asset</option>
                {contentItems.map((item) => <option key={item.id} value={item.id}>{item.platform} · {item.topic || item.contentType} · {item.status}</option>)}
              </select>
            </label>

            {mediaMode === "image" ? (
              <>
                <label className="block text-sm font-black">Image prompt<textarea value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
                <label className="block text-sm font-black">Aspect ratio<select value={imageRatio} onChange={(event) => setImageRatio(event.target.value as typeof imageRatio)} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal">{(["1:1", "4:5", "5:4", "9:16", "16:9", "3:4", "4:3"] as const).map((ratio) => <option key={ratio}>{ratio}</option>)}</select></label>
                <button disabled={!imageReady || imageGeneration.isPending || imagePrompt.trim().length < 2} onClick={() => imageGeneration.mutate({ prompt: imagePrompt, aspectRatio: imageRatio, contentItemId: contentItemId || null })} className="w-full rounded-xl gradient-aqua px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{imageGeneration.isPending ? "Generating and saving..." : "Generate image & save permanently"}</button>
              </>
            ) : (
              <>
                <label className="block text-sm font-black">Video prompt<textarea value={videoPrompt} onChange={(event) => setVideoPrompt(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
                <label className="block text-sm font-black">Source image URL (optional — enables image-to-video)<input type="url" value={videoSourceUrl} onChange={(event) => setVideoSourceUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-black">Aspect ratio<select value={videoRatio} onChange={(event) => setVideoRatio(event.target.value as typeof videoRatio)} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal">{(["9:16", "16:9", "1:1", "4:3", "3:4"] as const).map((ratio) => <option key={ratio}>{ratio}</option>)}</select></label>
                  <label className="block text-sm font-black">Duration<select value={videoDuration} onChange={(event) => setVideoDuration(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal">{[5, 8, 10, 12, 15].map((duration) => <option key={duration} value={duration}>{duration} seconds</option>)}</select></label>
                </div>
                <button disabled={!videoReady || videoCreation.isPending || videoPrompt.trim().length < 2} onClick={() => videoCreation.mutate({ prompt: videoPrompt, sourceAssetUrl: videoSourceUrl.trim() || null, aspectRatio: videoRatio, durationSeconds: videoDuration, contentItemId: contentItemId || null })} className="w-full rounded-xl gradient-aqua px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{videoCreation.isPending ? "Creating video task..." : "Generate video & track job"}</button>
                {videoJobId && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><div className="font-black">Video job: {videoJobQuery.data?.status ?? "checking"}</div><div className="mt-1 break-all text-xs text-muted-foreground">{videoJobId}</div>{videoJobQuery.isError && <div className="mt-2 text-destructive">{errorMessage(videoJobQuery.error)}</div>}</div>}
              </>
            )}
          </div>

          <div className="min-h-[360px] overflow-hidden rounded-2xl border border-border bg-muted/40">
            {latestMediaUrl ? (matchingMedia?.type === "video" ? <video src={latestMediaUrl} controls className="h-full min-h-[360px] w-full object-contain" /> : <img src={latestMediaUrl} alt="Generated Relax Fix media" className="h-full min-h-[360px] w-full object-contain" />) : <div className="grid min-h-[360px] place-items-center p-8 text-center text-sm text-muted-foreground"><div>{mediaMode === "image" ? <Image className="mx-auto h-10 w-10 text-primary" /> : <Video className="mx-auto h-10 w-10 text-primary" />}<p className="mt-4">The permanent generated asset will appear here after provider execution and Supabase Storage persistence.</p></div></div>}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><h2 className="text-xl font-black">Generate matching copy for the visual</h2><p className="mt-1 text-sm text-muted-foreground">Qwen receives the exact media-generation prompt and creates copy aligned to that visual concept without pretending to inspect pixels or frames.</p></div>
          <div className="flex flex-wrap gap-2"><select value={copyPlatform} onChange={(event) => setCopyPlatform(event.target.value as Platform)} className="rounded-xl border border-border bg-input px-3 py-2 text-sm"><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option></select><select value={copyLanguage} onChange={(event) => setCopyLanguage(event.target.value as "ar" | "en")} className="rounded-xl border border-border bg-input px-3 py-2 text-sm"><option value="ar">Arabic</option><option value="en">English</option></select></div>
        </div>
        <input value={copyGoal} onChange={(event) => setCopyGoal(event.target.value)} className="mt-4 w-full rounded-xl border border-border bg-input px-4 py-3 text-sm" placeholder="Content goal" />
        <button disabled={!textReady || !matchingMedia || matchingCopy.isPending} onClick={() => matchingMedia && matchingCopy.mutate({ assetType: matchingMedia.type, mediaPrompt: matchingMedia.prompt, platform: copyPlatform, language: copyLanguage, goal: copyGoal })} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-deep px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" /> {matchingCopy.isPending ? "Writing..." : "Generate matching hook, caption & CTA"}</button>
        {matchingCopy.data && <div className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-border bg-muted/30 p-5"><div className="text-xs font-black uppercase text-primary">Hook</div><p className="mt-2 font-black">{matchingCopy.data.copy.hook}</p><div className="mt-5 text-xs font-black uppercase text-primary">CTA</div><p className="mt-2">{matchingCopy.data.copy.cta}</p><div className="mt-5 text-xs font-black uppercase text-primary">Hashtags</div><p className="mt-2 text-sm text-muted-foreground">{matchingCopy.data.copy.hashtags.join(" ")}</p></div><div className="rounded-xl border border-border bg-muted/30 p-5"><div className="flex items-center justify-between gap-3"><div className="text-xs font-black uppercase text-primary">Caption</div><button onClick={() => void navigator.clipboard.writeText(`${matchingCopy.data.copy.hook}\n\n${matchingCopy.data.copy.caption}\n\n${matchingCopy.data.copy.cta}\n\n${matchingCopy.data.copy.hashtags.join(" ")}`)} className="inline-flex items-center gap-1 text-xs font-black text-primary"><Copy className="h-3.5 w-3.5" /> Copy all</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{matchingCopy.data.copy.caption}</p></div></div>}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><h2 className="text-xl font-black">Generate a real 30-day campaign</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">The text provider must return validated structured JSON. The server persists the full batch atomically as <code>needs_review</code>; publishing is not implied.</p></div><Link to="/os/planner" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-black"><CalendarDays className="h-4 w-4" /> Review planner</Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">Campaign goal<input value={campaign.goal} onChange={(event) => setCampaign((current) => ({ ...current, goal: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
          <label className="text-sm font-black">Audience<input value={campaign.audience} onChange={(event) => setCampaign((current) => ({ ...current, audience: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
          <label className="text-sm font-black md:col-span-2">Strategic topic<input value={campaign.topic} onChange={(event) => setCampaign((current) => ({ ...current, topic: event.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
          <label className="text-sm font-black">Calendar days<input type="number" min={1} max={30} value={campaign.days} onChange={(event) => setCampaign((current) => ({ ...current, days: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal" /></label>
          <label className="text-sm font-black">Output language<select value={campaign.language} onChange={(event) => setCampaign((current) => ({ ...current, language: event.target.value as "ar" | "en" }))} className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 font-normal"><option value="ar">Arabic</option><option value="en">English</option></select></label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3"><button disabled={!textReady || generation.isPending} onClick={() => generation.mutate(campaign)} className="inline-flex items-center gap-2 rounded-xl gradient-aqua px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><WandSparkles className="h-4 w-4" /> {generation.isPending ? "Generating and validating..." : `Generate ${campaign.days}-day campaign`}</button><Link to="/os/integrations" className="inline-flex items-center gap-2 text-sm font-black text-primary">Provider readiness <ExternalLink className="h-4 w-4" /></Link></div>
      </section>
    </div>
  );
}
