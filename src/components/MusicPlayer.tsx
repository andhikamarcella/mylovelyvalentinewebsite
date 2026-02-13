import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

const FALLBACK_TRACKS: Track[] = [
  {
    id: "married-life",
    title: "Married Life",
    artist: "Michael Giacchino",
    src: "/music/Michael Giacchino - Married Life (192kbps).mp3",
    cover: "/album/love.png",
  },
];

export default function MusicPlayer({ className }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>(FALLBACK_TRACKS);
  const [trackId, setTrackId] = useState(FALLBACK_TRACKS[0].id);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.6);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [coverSrc, setCoverSrc] = useState<string>(FALLBACK_TRACKS[0].cover ?? "/album/love.png");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const volumeRef = useRef(volume);

  const trackIndex = useMemo(() => Math.max(0, tracks.findIndex((t) => t.id === trackId)), [trackId, tracks]);
  const track = useMemo(() => tracks[trackIndex] ?? tracks[0], [trackIndex, tracks]);

  useEffect(() => {
    setCoverSrc(track.cover ?? "/album/love.png");
  }, [track.cover, track.id]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const goIndex = useCallback(
    (nextIndex: number) => {
      const safe = (nextIndex + tracks.length) % tracks.length;
      setTrackId(tracks[safe]?.id ?? tracks[0].id);
    },
    [tracks],
  );

  useEffect(() => {
    fetch("/data/music.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: unknown) => {
        if (!Array.isArray(json)) return;
        const parsed = json
          .map((t) => t as Partial<Track>)
          .filter((t) => !!t?.id && !!t?.src)
          .map((t) => ({
            id: String(t.id),
            title: String(t.title ?? t.id),
            artist: String(t.artist ?? ""),
            src: String(t.src),
            cover: t.cover ? String(t.cover) : undefined,
          }));
        if (parsed.length === 0) return;
        setTracks(parsed);
        setTrackId((prev) => parsed.find((p) => p.id === prev)?.id ?? parsed[0].id);
      })
      .catch(() => {
        return;
      });
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  const fadeIn = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const target = clampVolume(volumeRef.current);
    a.volume = 0;
    const start = performance.now();
    const ms = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      a.volume = target * (0.2 + 0.8 * p);
      if (p < 1 && !a.paused) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }, []);

  function clampVolume(v: number) {
    return Math.min(1, Math.max(0, v));
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = encodeURI(track.src);
    a.load();
    if (!playing) return;
    a.play()
      .then(() => {
        setAutoplayBlocked(false);
        fadeIn();
      })
      .catch(() => {
        setPlaying(false);
        setAutoplayBlocked(true);
      });
  }, [track.src, playing, fadeIn]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
    };
  }, [track.id]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onEnded = () => {
      if (tracks.length <= 1) return;
      goIndex(trackIndex + 1);
      setPlaying(true);
    };

    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [goIndex, trackIndex, tracks.length]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4", className)}>
      <div
        className={cn("pointer-events-none absolute inset-0 opacity-40")}
        style={{ backgroundImage: `url(${encodeURI(coverSrc)})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(28px)" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden="true" />

      <div className="relative flex items-center gap-4">
        <div className={cn("relative h-14 w-14 rounded-full border border-white/10 bg-black/30", playing && "animate-spin-slow")}>
          <img
            key={track.id}
            src={encodeURI(coverSrc)}
            alt="Cover"
            className="h-full w-full rounded-full object-cover"
            loading="lazy"
            onError={() => setCoverSrc("/album/love.png")}
          />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[var(--text)]">{track.title}</div>
          <div className="truncate text-xs text-[var(--muted)]">{track.artist}</div>

          <div className="mt-2 flex items-center gap-2">
            <div className="text-[10px] tabular-nums text-[var(--muted)]">{formatTime(currentTime)}</div>
            <input
              aria-label="Seek"
              type="range"
              min={0}
              max={Math.max(0, Math.floor(duration))}
              step={1}
              value={Math.min(Math.floor(currentTime), Math.floor(duration || 0))}
              onChange={(e) => {
                const a = audioRef.current;
                if (!a) return;
                a.currentTime = Number(e.target.value);
                setCurrentTime(a.currentTime || 0);
              }}
              className="range h-2 w-full"
            />
            <div className="text-[10px] tabular-nums text-[var(--muted)]">{formatTime(duration)}</div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goIndex(trackIndex - 1)}
              disabled={tracks.length <= 1}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                tracks.length <= 1 && "opacity-50 hover:bg-white/5",
              )}
              aria-label="Sebelumnya"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;
                if (playing) {
                  a.pause();
                  setPlaying(false);
                } else {
                  a.play()
                    .then(() => {
                      setPlaying(true);
                      setAutoplayBlocked(false);
                      fadeIn();
                    })
                    .catch(() => {
                      setPlaying(false);
                      setAutoplayBlocked(true);
                    });
                }
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => goIndex(trackIndex + 1)}
              disabled={tracks.length <= 1}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                tracks.length <= 1 && "opacity-50 hover:bg-white/5",
              )}
              aria-label="Berikutnya"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="flex min-w-[140px] flex-1 items-center gap-2">
              <Volume2 className="h-4 w-4 text-[var(--muted)]" />
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="range w-full"
              />
              <div className="w-10 text-right text-[10px] tabular-nums text-[var(--muted)]">{Math.round(volume * 100)}%</div>
            </div>

          </div>
        </div>
      </div>

      {autoplayBlocked && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-[var(--muted)]">
          Autoplay diblokir browser. Tap tombol play untuk mulai.
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

