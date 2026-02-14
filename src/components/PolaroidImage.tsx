import { cn } from "@/lib/utils";

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

export default function PolaroidImage({
  src,
  fallbackSrc,
  title,
  createdAt,
  className,
  imageClassName,
  aspectClassName = "aspect-[4/3]",
  loading,
  showMeta = true,
}: {
  src: string;
  fallbackSrc?: string;
  title?: string;
  createdAt?: string;
  className?: string;
  imageClassName?: string;
  aspectClassName?: string;
  loading?: "eager" | "lazy";
  showMeta?: boolean;
}) {
  const date = formatDate(createdAt);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white/95 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.45)]",
        "ring-1 ring-black/10",
        className,
      )}
    >
      <div className={cn("overflow-hidden rounded-xl bg-black/5", aspectClassName)}>
        <img
          src={src}
          data-fallback={fallbackSrc}
          onError={(e) => {
            const img = e.currentTarget;
            const next = img.dataset.fallback;
            if (next && img.src !== next) img.src = next;
          }}
          alt=""
          className={cn("h-full w-full object-cover", imageClassName)}
          loading={loading}
        />
      </div>
      {showMeta && (
        <div className="mt-3 min-h-[18px]">
          <div className="truncate font-[var(--font-hand)] text-[13px] text-black/80">{title || "Kenangan"}</div>
          <div className="mt-0.5 truncate font-[var(--font-hand)] text-[11px] text-black/60">{date || ""}</div>
        </div>
      )}
    </div>
  );
}

