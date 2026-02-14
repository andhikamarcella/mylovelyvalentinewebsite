import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import PolaroidImage from "@/components/PolaroidImage";
import { localUrlForFilename, type Photo } from "@/utils/photos";

type Props = {
  photos: Photo[];
  startIndex?: number;
  vintage?: boolean;
  onExit: () => void;
};

function randBetween(minMs: number, maxMs: number) {
  return Math.floor(minMs + Math.random() * (maxMs - minMs));
}

function fadeAudio(a: HTMLAudioElement, to: number, ms: number, muted: boolean) {
  const from = a.volume;
  const target = muted ? 0 : Math.max(0, Math.min(1, to));
  const start = performance.now();
  let raf = 0;
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / ms);
    const v = from + (target - from) * (1 - (1 - t) * (1 - t));
    a.volume = muted ? 0 : v;
    if (t < 1) raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(raf);
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

export default function GallerySlideshow({ photos, startIndex = 0, vintage = false, onExit }: Props) {
  const list = useMemo(() => photos.filter((p) => p.kind === "image"), [photos]);
  const safeStart = Math.min(Math.max(0, startIndex), Math.max(0, list.length - 1));

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(safeStart);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "fade">("idle");

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadingRef = useRef<(() => void) | null>(null);

  const track = useMemo(
    () => encodeURI("/music/Michael Giacchino - Married Life (192kbps).mp3"),
    [],
  );

  const current = list[index];
  const nextCandidate = useCallback(
    (dir: -1 | 1) => {
      if (list.length === 0) return 0;
      return (index + dir + list.length) % list.length;
    },
    [index, list.length],
  );

  const toUrl = (p?: Photo) => {
    if (!p) return "";
    const fallback = localUrlForFilename(p.filename);
    return encodeURI(p.url || fallback || "");
  };

  const fadeTo = useCallback(
    (to: number) => {
      if (to === index || phase !== "idle") return;
      setIncoming(to);
      setPhase("fade");
      window.setTimeout(() => {
        setIndex(to);
        setIncoming(null);
        setPhase("idle");
      }, 520);
    },
    [index, phase],
  );

  const goNext = useCallback(() => fadeTo(nextCandidate(1)), [fadeTo, nextCandidate]);
  const goPrev = useCallback(() => fadeTo(nextCandidate(-1)), [fadeTo, nextCandidate]);

  useEffect(() => {
    if (!playing || list.length <= 1) return;
    const schedule = () => {
      const delay = randBetween(3000, 5200);
      timerRef.current = window.setTimeout(() => {
        goNext();
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [goNext, index, list.length, playing]);

  const exit = useCallback(() => {
    const a = audioRef.current;
    if (!a) return onExit();
    if (fadingRef.current) fadingRef.current();
    fadingRef.current = fadeAudio(a, 0, 420, muted);
    window.setTimeout(() => {
      a.pause();
      onExit();
    }, 460);
  }, [muted, onExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit, goNext, goPrev]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    if (fadingRef.current) fadingRef.current();
    fadingRef.current = null;

    if (!playing) {
      fadingRef.current = fadeAudio(a, 0, 520, muted);
      window.setTimeout(() => {
        a.pause();
      }, 560);
      return () => {
        if (fadingRef.current) fadingRef.current();
        fadingRef.current = null;
      };
    }

    const target = 0.22;
    const play = a.play();
    if (play && typeof play.catch === "function") play.catch(() => {
      return;
    });
    if (a.volume < 0.001) a.volume = 0.0001;
    fadingRef.current = fadeAudio(a, target, 900, muted);
    return () => {
      if (fadingRef.current) fadingRef.current();
      fadingRef.current = null;
    };
  }, [muted, playing]);

  if (list.length === 0 || !current) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
      <audio ref={audioRef} src={track} loop preload="metadata" />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,77,141,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(125,220,255,0.10),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{current.title || "Kenangan"}</div>
            <div className="truncate text-xs text-white/70">
              {current.folder}
              {formatDate(current.createdAt) ? ` • ${formatDate(current.createdAt)}` : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-4 text-sm font-semibold text-black transition hover:brightness-110"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={exit}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative mt-4 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          <div className="absolute inset-0">
            {vintage ? (
              <div className="absolute inset-0 grid place-items-center p-6">
                <div className="relative h-full w-full max-w-4xl">
                  <div
                    className={cn(
                      "absolute inset-0 grid place-items-center transition duration-500",
                      phase === "fade" ? "opacity-0 blur-xl" : "opacity-100 blur-0",
                    )}
                  >
                    <PolaroidImage
                      src={toUrl(current)}
                      fallbackSrc={(() => {
                        const fallback = localUrlForFilename(current.filename);
                        return fallback ? encodeURI(fallback) : undefined;
                      })()}
                      title={current.title || current.description || "Kenangan"}
                      createdAt={current.createdAt}
                      aspectClassName="aspect-[4/3]"
                      imageClassName="object-contain bg-black/5"
                      loading="eager"
                    />
                  </div>
                  {incoming !== null && list[incoming] && (
                    <div
                      className={cn(
                        "absolute inset-0 grid place-items-center transition duration-500",
                        phase === "fade" ? "opacity-100 blur-0" : "opacity-0 blur-xl",
                      )}
                    >
                      <PolaroidImage
                        src={toUrl(list[incoming])}
                        fallbackSrc={(() => {
                          const fallback = localUrlForFilename(list[incoming]?.filename ?? "");
                          return fallback ? encodeURI(fallback) : undefined;
                        })()}
                        title={list[incoming]?.title || list[incoming]?.description || "Kenangan"}
                        createdAt={list[incoming]?.createdAt}
                        aspectClassName="aspect-[4/3]"
                        imageClassName="object-contain bg-black/5"
                        loading="eager"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <img
                  src={toUrl(current)}
                  alt=""
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain transition duration-500",
                    phase === "fade" ? "opacity-0 blur-xl" : "opacity-100 blur-0",
                  )}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = localUrlForFilename(current.filename);
                    if (fallback) img.src = encodeURI(fallback);
                  }}
                />
                {incoming !== null && list[incoming] && (
                  <img
                    src={toUrl(list[incoming])}
                    alt=""
                    className={cn(
                      "absolute inset-0 h-full w-full object-contain transition duration-500",
                      phase === "fade" ? "opacity-100 blur-0" : "opacity-0 blur-xl",
                    )}
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback = localUrlForFilename(list[incoming]?.filename ?? "");
                      if (fallback) img.src = encodeURI(fallback);
                    }}
                  />
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:bg-black/50"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:bg-black/50"
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/65">
          <div>
            {index + 1} / {list.length}
          </div>
          <div className="hidden sm:block">Esc untuk keluar • Space untuk pause • ← → untuk pindah</div>
        </div>
      </div>
    </div>
  );
}
