import { ArrowDown, ArrowLeft, ArrowRight, Award, Heart, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { playClawDropSfx, playClawLoseSfx, playClawWinSfx } from "@/utils/sfx";

type GameStatus = "ready" | "dropping" | "result";
type Result = "win" | "lose";

type StoredStats = {
  totalWins: number;
  highScore: number;
  unlocked5: boolean;
};

type HeartBurst = {
  id: string;
  left: string;
  delayMs: number;
  size: number;
};

const STATS_KEY = "valentine_claw_stats_v1";
const SFX_MUTED_KEY = "valentine_sfx_muted";
const SECRET_UNLOCK_KEY = "valentine_secret_game_unlocked";

function readStats(): StoredStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { totalWins: 0, highScore: 0, unlocked5: false };
    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    const totalWins = typeof parsed.totalWins === "number" ? parsed.totalWins : 0;
    const highScore = typeof parsed.highScore === "number" ? parsed.highScore : 0;
    const unlocked5 = typeof parsed.unlocked5 === "boolean" ? parsed.unlocked5 : totalWins >= 5;
    return { totalWins: Math.max(0, totalWins), highScore: Math.max(0, highScore), unlocked5 };
  } catch {
    return { totalWins: 0, highScore: 0, unlocked5: false };
  }
}

function writeStats(s: StoredStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

function pickGift() {
  const gifts = [
    "Kamu dapet 1 pelukan gratis 💞",
    "Kamu dapet 1 cium pipi (redeem kapan aja)",
    "Kamu dapet 10 detik dipuji tanpa henti",
    "Kamu dapet 1 'aku sayang kamu' versi premium",
    "Kamu dapet 1 kencan mini: jalan berdua + jajan",
    "Kamu dapet 1 hak minta apa aja (yang manis ya)",
  ];
  return gifts[Math.floor(Math.random() * gifts.length)] ?? "Kamu dapet pelukan gratis 💞";
}

function makeBurst(count: number): HeartBurst[] {
  const out: HeartBurst[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `${Date.now()}-${i}-${Math.random().toString(16).slice(2)}`,
      left: `${8 + Math.random() * 84}%`,
      delayMs: Math.floor(Math.random() * 220),
      size: 14 + Math.floor(Math.random() * 12),
    });
  }
  return out;
}

type World = {
  clawX: number;
  clawY: number;
  clawState: "idle" | "down" | "up";
  heartX: number;
  heartY: number;
  grabbed: boolean;
  status: GameStatus;
  result: Result | null;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function draw(ctx: CanvasRenderingContext2D, w: World, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  const pad = 18;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  const floorY = height - 60;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.moveTo(pad + 10, floorY);
  ctx.lineTo(width - pad - 10, floorY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w.clawX, pad + 8);
  ctx.lineTo(w.clawX, w.clawY);
  ctx.stroke();

  const headR = 16;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.arc(w.clawX, w.clawY, headR + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(w.clawX, w.clawY, headR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,77,141,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w.clawX, w.clawY, headR - 6, 0, Math.PI * 2);
  ctx.stroke();

  const hx = w.grabbed ? w.clawX : w.heartX;
  const hy = w.grabbed ? w.clawY + 34 : w.heartY;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.fillStyle = "rgba(255,77,141,0.95)";
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.bezierCurveTo(18, -6, 28, 6, 0, 28);
  ctx.bezierCurveTo(-28, 6, -18, -6, 0, 12);
  ctx.fill();
  ctx.restore();
}

function PillButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full",
        "border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--text)]",
        "transition active:scale-[0.98] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]",
        props.disabled && "opacity-50 hover:bg-white/5 active:scale-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function ClawMachineGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const worldRef = useRef<World | null>(null);

  const [status, setStatus] = useState<GameStatus>("ready");
  const [result, setResult] = useState<Result | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [wins, setWins] = useState(0);
  const [totalWins, setTotalWins] = useState(() => readStats().totalWins);
  const [highScore, setHighScore] = useState(() => readStats().highScore);
  const [unlocked5, setUnlocked5] = useState(() => readStats().unlocked5);
  const [gift, setGift] = useState<string | null>(null);
  const [bursts, setBursts] = useState<HeartBurst[]>([]);
  const [sfxMuted, setSfxMuted] = useState(() => localStorage.getItem(SFX_MUTED_KEY) === "1");
  const sfxMutedRef = useRef(sfxMuted);

  const dims = useMemo(() => ({ width: 820, height: 460 }), []);
  const bounds = useMemo(() => ({ minX: 80, maxX: 740 }), []);
  const floorY = useMemo(() => dims.height - 60, [dims.height]);

  const init = useMemo(() => {
    const heartX = rand(bounds.minX + 40, bounds.maxX - 40);
    return {
      clawX: dims.width / 2,
      clawY: 70,
      clawState: "idle" as const,
      heartX,
      heartY: floorY - 14,
      grabbed: false,
      status: "ready" as const,
      result: null as Result | null,
    };
  }, [bounds.maxX, bounds.minX, dims.width, floorY]);

  useEffect(() => {
    sfxMutedRef.current = sfxMuted;
  }, [sfxMuted]);

  const reset = useCallback(() => {
    worldRef.current = { ...init, heartX: rand(bounds.minX + 40, bounds.maxX - 40) };
    setStatus("ready");
    setResult(null);
    setGift(null);
  }, [bounds.maxX, bounds.minX, init]);

  const move = useCallback((dir: -1 | 1) => {
    const w = worldRef.current;
    if (!w) return;
    if (w.status !== "ready") return;
    w.clawX = clamp(w.clawX + dir * 18, bounds.minX, bounds.maxX);
  }, [bounds.maxX, bounds.minX]);

  const drop = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    if (w.status !== "ready") return;
    w.status = "dropping";
    w.clawState = "down";
    setStatus("dropping");
    setAttempts((a) => a + 1);
    if (!sfxMutedRef.current) playClawDropSfx();
  }, []);

  useEffect(() => {
    writeStats({ totalWins, highScore, unlocked5 });
    if (unlocked5) localStorage.setItem(SECRET_UNLOCK_KEY, "1");
  }, [highScore, totalWins, unlocked5]);

  useEffect(() => {
    localStorage.setItem(SFX_MUTED_KEY, sfxMuted ? "1" : "0");
  }, [sfxMuted]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        move(1);
      }
      if (e.key === " " || e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        drop();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop, move, reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = (t: number) => {
      const w = worldRef.current;
      if (!w) return;

      const dt = lastRef.current ? Math.min(32, t - lastRef.current) : 16;
      lastRef.current = t;

      const downSpeed = 0.42;
      const upSpeed = 0.62;
      const maxY = dims.height - 90;

      if (w.status === "dropping") {
        if (w.clawState === "down") {
          w.clawY = Math.min(maxY, w.clawY + dt * downSpeed);
          if (w.clawY >= maxY) {
            const caught = Math.abs(w.clawX - w.heartX) < 34;
            w.grabbed = caught;
            w.clawState = "up";
            w.result = caught ? "win" : "lose";
            if (caught) {
              const nextGift = pickGift();
              setGift(nextGift);
              setBursts(makeBurst(14));
              window.setTimeout(() => setBursts([]), 1200);
              if (!sfxMutedRef.current) playClawWinSfx();
              setWins((x) => {
                const next = x + 1;
                setHighScore((hs) => Math.max(hs, next));
                return next;
              });
              setTotalWins((x) => {
                const next = x + 1;
                if (next >= 5) setUnlocked5(true);
                return next;
              });
            } else {
              setGift(null);
              if (!sfxMutedRef.current) playClawLoseSfx();
            }
          }
        } else {
          w.clawY = Math.max(70, w.clawY - dt * upSpeed);
          if (w.clawY <= 70) {
            w.status = "result";
            setStatus("result");
            setResult(w.result);
          }
        }
      }

      draw(ctx, w, dims.width, dims.height);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [dims.height, dims.width]);

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <canvas ref={canvasRef} width={dims.width} height={dims.height} className="h-auto w-full" />
          <div className="pointer-events-none absolute inset-0">
            {bursts.map((b) => (
              <div
                key={b.id}
                className="absolute bottom-10 text-[color:var(--accent)] heart-float"
                style={{ left: b.left, animationDelay: `${b.delayMs}ms` }}
              >
                <Heart className="opacity-90" style={{ width: b.size, height: b.size }} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[var(--muted)]">
            Keyboard: ← → untuk gerak • Space/↓/Enter untuk drop • R untuk reset
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PillButton onClick={() => move(-1)} disabled={status !== "ready"} aria-label="Kiri">
              <ArrowLeft className="h-4 w-4" />
              Kiri
            </PillButton>
            <PillButton
              onClick={drop}
              disabled={status !== "ready"}
              className="bg-[color:var(--accent)] text-black hover:brightness-110"
              aria-label="Drop"
            >
              <ArrowDown className="h-4 w-4" />
              Drop
            </PillButton>
            <PillButton onClick={() => move(1)} disabled={status !== "ready"} aria-label="Kanan">
              <ArrowRight className="h-4 w-4" />
              Kanan
            </PillButton>
            <PillButton onClick={reset} aria-label="Reset">
              <RefreshCw className="h-4 w-4" />
              Reset
            </PillButton>
          </div>
        </div>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Status</div>
            <div className="mt-2 text-sm text-[var(--muted)]">
              {status === "ready" && "Atur posisi claw, lalu drop untuk ambil hati."}
              {status === "dropping" && "Claw sedang turun…"}
              {status === "result" && (result === "win" ? "YES! Hatimu ketangkep." : "Hampir… coba lagi ya.")}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSfxMuted((m) => !m)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10"
            aria-label={sfxMuted ? "Unmute SFX" : "Mute SFX"}
          >
            {sfxMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Percobaan</div>
            <div className="mt-1 text-xl font-semibold text-[var(--text)]">{attempts}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Menang</div>
            <div className="mt-1 text-xl font-semibold text-[color:var(--accent)]">{wins}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Total menang</div>
            <div className="mt-1 text-xl font-semibold text-[var(--text)]">{totalWins}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">High score</div>
            <div className="mt-1 text-xl font-semibold text-[var(--text)]">{highScore}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--muted)]">
          {result === "win" && gift ? (
            <div className="text-[var(--text)]">🎁 {gift}</div>
          ) : (
            <div>Tip: drop pas claw tepat di atas hati.</div>
          )}
        </div>

        <div className={cn("mt-4 rounded-2xl border border-white/10 bg-black/20 p-4", unlocked5 && "ring-1 ring-[color:var(--accent)]")}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Award className="h-4 w-4 text-[color:var(--accent)]" />
                Badge 5x Menang
              </div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {unlocked5 ? "Unlocked! Kamu bisa buka halaman Rahasia." : "Menang total 5x untuk unlock."}
              </div>
            </div>
            <div className={cn("text-xs", unlocked5 ? "text-[color:var(--accent)]" : "text-[var(--muted)]")}>
              {Math.min(5, totalWins)} / 5
            </div>
          </div>
          {unlocked5 && (
            <Link
              to="/secret"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Buka Rahasia
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
