import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Film, Image, Library, ShieldAlert } from "lucide-react";
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
        Real `media_assets` catalog. Storage paths and provider job references are shown as recorded; no generated media is invented.
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

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-black">Asset catalog</h2>
        </div>
        <div className="divide-y divide-border">
          {assets.map((asset) => (
            <article key={asset.id} className="grid gap-3 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                {asset.assetType === "video" ? <Film className="h-5 w-5" /> : asset.assetType === "image" ? <Image className="h-5 w-5" /> : <Library className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="font-black">{asset.assetType} · {asset.source}</div>
                <div className="mt-1 break-all text-xs text-muted-foreground">
                  {asset.storagePath ?? "No storage path recorded"}
                </div>
                {asset.prompt && <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{asset.prompt}</div>}
              </div>
              <div className="text-xs text-muted-foreground md:text-end">
                <div>{asset.provider ?? "No provider"}</div>
                <div className="mt-1">{asset.providerJobId ?? "No provider job"}</div>
              </div>
            </article>
          ))}
          {!mediaQuery.isLoading && !mediaQuery.isError && assets.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No media assets exist in Supabase yet.
            </div>
          )}
          {mediaQuery.isLoading && <div className="p-10 text-center text-sm text-muted-foreground">Loading media assets...</div>}
        </div>
      </section>
    </div>
  );
}
