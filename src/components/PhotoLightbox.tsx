import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import PolaroidImage from "@/components/PolaroidImage";
import { localUrlForFilename, type Photo } from "@/utils/photos";

export default function PhotoLightbox({
  photos,
  vintage = false,
  index,
  onClose,
  onIndex,
}: {
  photos: Photo[];
  vintage?: boolean;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const length = photos.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (length <= 0) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndex((index - 1 + length) % length);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndex((index + 1) % length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, length, onClose, onIndex]);

  const p = photos[index];
  if (!p) return null;

  const fallback = localUrlForFilename(p.filename);

  const prev = () => onIndex((index - 1 + length) % length);
  const next = () => onIndex((index + 1) % length);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--bg)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute right-3 top-3 z-10",
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            "border border-white/10 bg-black/45 text-white",
            "transition hover:bg-black/60",
          )}
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--text)]">{p.title || "Kenangan"}</div>
            <div className="text-xs text-[var(--muted)]">{p.folder}</div>
          </div>
          <div className="h-9 w-9" aria-hidden="true" />
        </div>

        <div className="relative">
          {p.kind === "video" ? (
            <video
              controls
              playsInline
              src={encodeURI(p.url)}
              className="max-h-[72vh] w-full bg-black/30 object-contain"
            />
          ) : vintage ? (
            <div className="mx-auto max-w-3xl p-5">
              <PolaroidImage
                src={encodeURI(p.url)}
                fallbackSrc={fallback ? encodeURI(fallback) : undefined}
                title={p.title || p.description || "Kenangan"}
                createdAt={p.createdAt}
                aspectClassName="aspect-[4/3]"
                imageClassName="object-contain bg-black/10"
                loading="eager"
              />
            </div>
          ) : (
            <img
              src={encodeURI(p.url)}
              data-fallback={fallback ? encodeURI(fallback) : undefined}
              onError={(e) => {
                const img = e.currentTarget;
                const next = img.dataset.fallback;
                if (next && img.src !== next) img.src = next;
              }}
              alt=""
              className="max-h-[72vh] w-full object-contain"
            />
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

