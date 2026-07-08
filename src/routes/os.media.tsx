import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Film, Image, Library, ShieldAlert } from "lucide-react";
import { fetchMediaAssets } from "../platform/os-operations-data";

export const Route = createFileRoute("/os/media")({ component: MediaPage });

function MediaPage() {
  const mediaQuery = useQuery({
    queryKey: ["os", "media-assets"],
    queryFn: fetchMediaAssets,
    retry: false,
  });
  const assets = mediaQuery.data ?? [];
  const counts = {
    image: assets.filter((asset) => asset.assetType === "image").length,
    video: assets.filter((asset) => asset.assetType === "video").length,
    brand: assets.filter((asset) => asset.assetType === "logo" || asset.assetType === "other").length,
  };

  return (
    <div>
      <h1 className="text-3xl font-black">Media Library</h1>
      <p className="mt-2 text-muted-foreground">
        Permanent Relax Fix assets stored in Supabase Storage. Alibaba provider result URLs are copied here before the temporary links expire.
      </p>

      {mediaQuery.isError && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" /> Unable to load media assets from Supabase.
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          [Image, "Images", counts.image],
          [Film, "Videos", counts.video],
          [Library, "Brand / other assets", counts.brand],
        ].map(([Icon, label, count]) => {
          const AssetIcon = Icon as typeof Image;
          return (
            <div key={label as string} className="rounded-2xl border border-border bg-card p-6">
              <AssetIcon className="h-8 w-8 text-primary" />
              <div className="mt-4 text-3xl font-black">{mediaQuery.isLoading ? "—" : String(count)}</div>
              <div className="mt-1 font-black">{label as string}</div>
            </div>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="border-b border-border pb-5">
          <h2 className="text-xl font-black">Permanent asset catalog</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-deep/5">
                {asset.publicUrl && asset.assetType === "image" ? (
                  <img src={asset.publicUrl} alt={asset.prompt ?? "Relax Fix generated media"} className="h-full w-full object-cover" loading="lazy" />
                ) : asset.publicUrl && asset.assetType === "video" ? (
                  <video src={asset.publicUrl} controls preload="metadata" className="h-full w-full object-contain" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                    {asset.assetType === "video" ? <Film className="h-6 w-6" /> : asset.assetType === "image" ? <Image className="h-6 w-6" /> : <Library className="h-6 w-6" />}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{asset.assetType} · {asset.source}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{asset.provider ?? "No provider"}</div>
                  </div>
                  {asset.publicUrl && (
                    <a href={asset.publicUrl} target="_blank" rel="noreferrer" className="text-primary" aria-label="Open media asset">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {asset.prompt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{asset.prompt}</p>}
                <div className="mt-4 break-all text-[11px] text-muted-foreground">{asset.storagePath ?? "No storage path recorded"}</div>
                <div className="mt-2 break-all text-[11px] text-muted-foreground">{asset.providerJobId ?? "No provider job"}</div>
              </div>
            </article>
          ))}
          {!mediaQuery.isLoading && !mediaQuery.isError && assets.length === 0 && (
            <div className="col-span-full p-10 text-center text-sm text-muted-foreground">
              No media assets exist yet. Generate an image or video in AI Content Studio.
            </div>
          )}
          {mediaQuery.isLoading && <div className="col-span-full p-10 text-center text-sm text-muted-foreground">Loading media assets...</div>}
        </div>
      </section>
    </div>
  );
}
