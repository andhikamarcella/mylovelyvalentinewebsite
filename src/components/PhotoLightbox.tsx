import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/utils/photos";

export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const p = photos[index];
  if (!p) return null;

  const prev = () => onIndex((index - 1 + photos.length) % photos.length);
  const next = () => onIndex((index + 1) % photos.length);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--bg)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--text)]">{p.title || "Kenangan"}</div>
            <div className="text-xs text-[var(--muted)]">{p.folder}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          {p.kind === "video" ? (
            <video
              controls
              playsInline
              src={encodeURI(p.url)}
              className="max-h-[72vh] w-full bg-black/30 object-contain"
            />
          ) : (
            <img src={encodeURI(p.url)} alt={p.description || p.title} className="max-h-[72vh] w-full object-contain" />
          )}

          <button
            type="button"
            onClick={prev}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[var(--text)]",
              "transition hover:bg-black/40",
            )}
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[var(--text)]",
              "transition hover:bg-black/40",
            )}
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {p.description && (
          <div className="border-t border-white/10 p-4 text-sm text-[var(--muted)]">{p.description}</div>
        )}
      </div>
    </div>
  );
}

