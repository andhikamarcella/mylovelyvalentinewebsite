import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AnniversaryOverlay from "@/components/AnniversaryOverlay";
import { RELATIONSHIP_START_ISO } from "@/utils/dates";

function fadeAudio(a: HTMLAudioElement, to: number, ms: number) {
  const from = a.volume;
  const target = Math.max(0, Math.min(1, to));
  const start = performance.now();
  let raf = 0;
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / ms);
    const v = from + (target - from) * (1 - (1 - t) * (1 - t));
    a.volume = v;
    if (t < 1) raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(raf);
}

export default function AnniversaryController() {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadingRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const base = useMemo(() => new Date(RELATIONSHIP_START_ISO), []);
  const month = base.getMonth();
  const date = base.getDate();

  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);

  const track = useMemo(
    () => encodeURI("/music/Taylor Swift - Opalite (192kbps).mp3"),
    [],
  );

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
  }, [muted]);

  useEffect(() => {
    const keyFor = (year: number) => `valentine_anniversary_celebrated_${year}`;
    const shouldTrigger = (now: Date) => {
      if (now.getMonth() !== month || now.getDate() !== date) return false;
      if (now.getHours() !== 0 || now.getMinutes() !== 0) return false;
      return now.getSeconds() <= 8;
    };

    const id = window.setInterval(() => {
      if (active) return;
      const now = new Date();
      if (!shouldTrigger(now)) return;
      const key = keyFor(now.getFullYear());
      if (localStorage.getItem(key) === "1") return;
      localStorage.setItem(key, "1");
      setActive(true);
    }, 1000);

    return () => window.clearInterval(id);
  }, [active, date, month]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (fadingRef.current) fadingRef.current();
    fadingRef.current = null;

    if (!active) {
      fadingRef.current = fadeAudio(a, 0, 420);
      window.setTimeout(() => a.pause(), 460);
      return () => {
        if (fadingRef.current) fadingRef.current();
        fadingRef.current = null;
      };
    }

    a.volume = 0.0001;
    const play = a.play();
    if (play && typeof play.catch === "function") play.catch(() => {
      return;
    });
    fadingRef.current = fadeAudio(a, 0.26, 900);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      navigate("/secret", { replace: true });
      setActive(false);
    }, 7200);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      if (fadingRef.current) fadingRef.current();
      fadingRef.current = null;
    };
  }, [active, navigate]);

  useEffect(() => {
    if (!active) return;
    if (location.pathname === "/secret") setActive(false);
  }, [active, location.pathname]);

  return (
    <>
      <audio ref={audioRef} src={track} loop preload="metadata" />
      <AnniversaryOverlay
        active={active}
        onSkip={() => {
          navigate("/secret", { replace: true });
          setActive(false);
        }}
      />
      {active && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="fixed bottom-4 right-4 z-[80] rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white/80 backdrop-blur transition hover:bg-black/55"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      )}
    </>
  );
}

