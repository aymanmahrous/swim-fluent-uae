import { createFileRoute } from "@tanstack/react-router";
import { Film, Image, Library } from "lucide-react";

export const Route = createFileRoute("/os/media")({ component: MediaPage });
function MediaPage() {
  return (
    <div>
      <h1 className="text-3xl font-black">Media Library</h1>
      <p className="mt-2 text-muted-foreground">
        Central asset catalog for uploads and future AI-generated media.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Image className="mx-auto h-10 w-10 text-primary" />
          <div className="mt-3 font-black">Images</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Coach, pools, testimonials and AI assets
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Film className="mx-auto h-10 w-10 text-primary" />
          <div className="mt-3 font-black">Videos</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Original clips and generated video jobs
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Library className="mx-auto h-10 w-10 text-primary" />
          <div className="mt-3 font-black">Brand assets</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Logos, visual references and templates
          </p>
        </div>
      </div>
    </div>
  );
}
