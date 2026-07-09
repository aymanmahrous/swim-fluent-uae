import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Film, Image, Library, LoaderCircle, ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { fetchAiVideoJob, fetchAiVideoJobs } from "../platform/os-media-generation";
import { fetchMediaAssets } from "../platform/os-operations-data";

export const Route = createFileRoute("/os/media")({ component: MediaPage });

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function MediaPage() {
  const queryClient = useQueryClient();
  const handledVideoState = useRef("");
  const mediaQuery = useQuery({
    queryKey: ["os", "media-assets"],
    queryFn: fetchMediaAssets,
    retry: false,
  });
  const videoJobsQuery = useQuery({
    queryKey: ["os", "video-jobs"],
    queryFn: fetchAiVideoJobs,
    retry: false,
  });
  const assets = mediaQuery.data ?? [];
  const videoJobs = videoJobsQuery.data ?? [];
  const activeVideoJob = videoJobs.find(
    (job) => job.status === "queued" || job.status === "running",
  );
  const activeVideoJobQuery = useQuery({
    queryKey: ["os", "video-job", activeVideoJob?.jobId ?? null],
    queryFn: () => fetchAiVideoJob(activeVideoJob?.jobId as string),
    enabled: Boolean(activeVideoJob),
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      const status = query.state.data?.status;
      return status === "queued" || status === "running" ? 15_000 : false;
    },
  });

  useEffect(() => {
    const state = activeVideoJobQuery.data;
    if (!state || !activeVideoJob) return;
    const marker = `${activeVideoJob.jobId}:${state.status}`;
    if (handledVideoState.current === marker) return;
    handledVideoState.current = marker;
    void queryClient.invalidateQueries({ queryKey: ["os", "video-jobs"] });
    if (state.status === "succeeded") {
      void queryClient.invalidateQueries({ queryKey: ["os", "media-assets"] });
    }
  }, [activeVideoJob, activeVideoJobQuery.data, queryClient]);

  const incompleteVideoJobs = videoJobs.filter((job) => job.status !== "succeeded");
  const counts = {
    image: assets.filter((asset) => asset.assetType === "image").length,
    video: assets.filter((asset) => asset.assetType === "video").length,
    working: incompleteVideoJobs.filter(
      (job) => job.status === "queued" || job.status === "running",
    ).length,
    brand: assets.filter(
      (asset) => asset.assetType === "logo" || asset.assetType === "other",
    ).length,
  };

  return (
    <div>
      <h1 className="text-3xl font-black">Media Library</h1>
      <p className="mt-2 text-muted-foreground">
        Private Relax Fix assets stored in Supabase Storage. Each request receives a time-limited
        signed URL after ownership is verified on the server.
      </p>

      {mediaQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to load your media assets from
          Supabase.
        </div>
      )}
      {(videoJobsQuery.isError || activeVideoJobQuery.isError) && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to refresh AI video generation
          status.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Image, "Images", counts.image],
          [Film, "Completed videos", counts.video],
          [LoaderCircle, "Video jobs in progress", counts.working],
          [Library, "Brand / other assets", counts.brand],
        ].map(([Icon, label, count]) => {
          const AssetIcon = Icon as typeof Image;
          return (
            <div key={label as string} className="rounded-2xl border border-border bg-card p-6">
              <AssetIcon className="h-8 w-8 text-primary" />
              <div className="mt-4 text-3xl font-black">
                {mediaQuery.isLoading || videoJobsQuery.isLoading ? "—" : String(count)}
              </div>
              <div className="mt-1 font-black">{label as string}</div>
            </div>
          );
        })}
      </div>

      {incompleteVideoJobs.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border pb-5">
            <h2 className="text-xl font-black">AI video generation status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Queued and running jobs continue polling here after a page reload. Failed jobs remain
              visible with their recorded error.
            </p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {incompleteVideoJobs.map((job) => (
              <article key={job.jobId} className="rounded-2xl border border-border bg-muted/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-black">Video · {job.provider}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Created {formatDate(job.createdAt)}
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    {job.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {job.prompt}
                </p>
                {job.error && (
                  <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                    {job.error}
                  </div>
                )}
                <div className="mt-4 break-all text-[11px] text-muted-foreground">
                  Job {job.jobId}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Updated {formatDate(job.updatedAt)}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="border-b border-border pb-5">
          <h2 className="text-xl font-black">Permanent asset catalog</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="overflow-hidden rounded-2xl border border-border bg-muted/20"
            >
              <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-deep/5">
                {asset.publicUrl && asset.assetType === "image" ? (
                  <img
                    src={asset.publicUrl}
                    alt={asset.prompt ?? "Relax Fix generated media"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : asset.publicUrl && asset.assetType === "video" ? (
                  <video
                    src={asset.publicUrl}
                    controls
                    preload="metadata"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                    {asset.assetType === "video" ? (
                      <Film className="h-6 w-6" />
                    ) : asset.assetType === "image" ? (
                      <Image className="h-6 w-6" />
                    ) : (
                      <Library className="h-6 w-6" />
                    )}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">
                      {asset.assetType} · {asset.source}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {asset.provider ?? "No provider"}
                    </div>
                  </div>
                  {asset.publicUrl && (
                    <a
                      href={asset.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary"
                      aria-label="Open media asset"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {asset.prompt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {asset.prompt}
                  </p>
                )}
                <div className="mt-4 text-xs font-semibold text-muted-foreground">
                  Created {formatDate(asset.createdAt)}
                </div>
                <div className="mt-3 break-all text-[11px] text-muted-foreground">
                  {asset.storagePath ?? "No storage path recorded"}
                </div>
                <div className="mt-2 break-all text-[11px] text-muted-foreground">
                  {asset.providerJobId ?? "No provider job"}
                </div>
              </div>
            </article>
          ))}
          {!mediaQuery.isLoading && !mediaQuery.isError && assets.length === 0 && (
            <div className="col-span-full p-10 text-center text-sm text-muted-foreground">
              No media assets exist yet. Generate an image or video in AI Content Studio.
            </div>
          )}
          {mediaQuery.isLoading && (
            <div className="col-span-full p-10 text-center text-sm text-muted-foreground">
              Loading your media assets...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
