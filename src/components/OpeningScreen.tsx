import { useEffect, useMemo, useRef, useState } from "react";
import StarsBackdrop from "@/components/StarsBackdrop";

const DEFAULT_TOTAL_MS = 165_000;

export default function OpeningScreen({
  onDone,
  lines,
  totalDurationMs = DEFAULT_TOTAL_MS,
}: {
  onDone: () => void;
  lines: string[];
  totalDurationMs?: number;
}) {
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const perLineMs = useMemo(() => {
    const safeLines = Math.max(1, lines.length);
    return totalDurationMs / safeLines;
  }, [lines.length, totalDurationMs]);

  const currentIndex = useMemo(() => Math.min(lines.length - 1, Math.floor(elapsed / perLineMs)), [elapsed, lines.length, perLineMs]);
  const currentLine = lines[currentIndex] ?? "";

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const e = t - startRef.current;
      setElapsed(e);

      if (e >= totalDurationMs) {
        onDone();
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [onDone, totalDurationMs]);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[color:var(--bg)]">
      <StarsBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col px-4 py-8">
        <div className="ml-auto">
          <button
            type="button"
            onClick={onDone}
            className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--text)] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Skip
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full text-center">
            <div
              className="mx-auto max-w-3xl px-2 font-[var(--font-letter)] text-[22px] leading-relaxed text-[color:var(--glow)] sm:text-3xl"
              style={{ textShadow: "0 0 16px rgba(125,220,255,0.6), 0 0 42px rgba(125,220,255,0.22)" }}
            >
              {currentLine}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

