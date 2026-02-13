import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { fetchPhotos, type Photo } from "@/utils/photos";

function pickRandom<T>(items: T[]) {
  if (items.length === 0) return null;
  const i = Math.floor(Math.random() * items.length);
  return items[i] ?? null;
}

export default function VideoCard({ className }: { className?: string }) {
  const [videos, setVideos] = useState<Photo[]>([]);

  useEffect(() => {
    let alive = true;
    fetchPhotos()
      .then((all) => {
        if (!alive) return;
        setVideos(all.filter((p) => p.kind === "video"));
      })
      .catch(() => {
        if (!alive) return;
        setVideos([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const picked = useMemo(() => pickRandom(videos), [videos]);

  return (
    <section className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6", className)}>
      <div className="text-sm font-semibold text-[var(--text)]">Video</div>
      <div className="mt-2 text-xs text-[var(--muted)]">Muncul setelah opening dan surat selesai</div>

      <div className="mt-4">
        {picked ? (
          <video
            controls
            playsInline
            className="aspect-video w-full rounded-xl border border-white/10 bg-black/30"
            src={encodeURI(picked.url)}
          />
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--muted)]">
            Belum ada file .mp4 di folder galeri.
          </div>
        )}
      </div>
    </section>
  );
}

