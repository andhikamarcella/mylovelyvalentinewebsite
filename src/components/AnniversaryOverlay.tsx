import { PartyPopper, SkipForward } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Piece = {
  id: string;
  left: string;
  delayMs: number;
  durationMs: number;
  rotate: number;
  size: number;
  color: string;
};

function makePieces(count: number): Piece[] {
  const colors = ["#FF4D8D", "#7DDCFF", "#B8F2E6", "#F7E9EF", "#FFD6E5"];
  const out: Piece[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
      left: `${Math.random() * 100}%`,
      delayMs: Math.floor(Math.random() * 550),
      durationMs: 1900 + Math.floor(Math.random() * 1400),
      rotate: Math.floor(Math.random() * 360),
      size: 6 + Math.floor(Math.random() * 8),
      color: colors[Math.floor(Math.random() * colors.length)] ?? "#FF4D8D",
    });
  }
  return out;
}

export default function AnniversaryOverlay({
  active,
  onSkip,
}: {
  active: boolean;
  onSkip: () => void;
}) {
  const pieces = useMemo(() => makePieces(46), []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70]",
        "bg-black/90 backdrop-blur-sm",
        "transition duration-500",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: p.left,
              width: p.size,
              height: p.size * 1.6,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animationDelay: `${p.delayMs}ms`,
              animationDuration: `${p.durationMs}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <PartyPopper className="h-7 w-7 text-[color:var(--accent)]" />
        </div>
        <div className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Happy Anniversary</div>
        <div className="mt-2 max-w-xl text-sm text-white/75">
          Jam 00:00… aku mau rayain momen ini bareng kamu.
        </div>

        <button
          type="button"
          onClick={onSkip}
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5",
            "text-sm font-semibold text-white transition hover:bg-white/10",
          )}
        >
          <SkipForward className="h-4 w-4" />
          Ke Surprise
        </button>
      </div>
    </div>
  );
}

