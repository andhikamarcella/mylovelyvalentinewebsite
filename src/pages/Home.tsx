import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CountdownCards from "@/components/CountdownCards";
import EnvelopeLetter from "@/components/EnvelopeLetter";
import MusicPlayer from "@/components/MusicPlayer";
import OpeningScreen from "@/components/OpeningScreen";
import Reveal from "@/components/Reveal";
import RippleButton from "@/components/RippleButton";
import StarsBackdrop from "@/components/StarsBackdrop";
import TopNav from "@/components/TopNav";
import VideoCard from "@/components/VideoCard";
import { cn } from "@/lib/utils";
import { daysTogether } from "@/utils/dates";

const OPENING_LINES = [
  "Di antara jutaan manusia di dunia.",
  "Aku bersyukur semesta mempertemukanku dengan kamu.",
  "Pertemuan kita bukan hal biasa bagiku.",
  "Kamu datang di waktu yang tidak pernah aku duga.",
  "Sejak itu, hariku terasa berbeda.",
  "Kamu adalah tenang di tengah ributnya pikiranku.",
  "Kamu adalah hangat di saat hariku terasa dingin.",
  "Kamu adalah alasan aku belajar sabar.",
  "Kamu adalah tempat aku merasa paling nyaman.",
  "Bersamamu, aku merasa dimengerti.",
  "Bersamamu, aku merasa cukup.",
  "Senyummu selalu berhasil memperbaiki hariku.",
  "Tatapanmu selalu membuatku merasa pulang.",
  "Suaramu selalu jadi penenangku.",
  "Aku tidak butuh yang sempurna.",
  "Aku hanya butuh kamu yang tetap tinggal.",
  "Valentine ini bukan cuma tentang bunga atau cokelat.",
  "Valentine ini tentang perasaan yang terus tumbuh.",
  "Valentine ini tentang bagaimana aku merasa lengkap karena ada kamu.",
  "Cinta ini mungkin sederhana.",
  "Tapi perasaanku untukmu tidak pernah setengah-setengah.",
  "Aku ingin terus berjalan bersamamu.",
  "Aku ingin terus belajar mencintaimu dengan cara yang lebih baik.",
  "Aku ingin menjadi alasan kamu merasa aman.",
  "Aku ingin menjadi tempat kamu bersandar.",
  "Jika suatu hari aku lelah.",
  "Aku berharap kamu tetap menggenggam tanganku.",
  "Jika suatu hari kamu lelah.",
  "Aku akan tetap ada untukmu.",
  "Terima kasih sudah memilih bertahan.",
  "Terima kasih sudah memilih mengerti.",
  "Terima kasih sudah memilih aku.",
  "Kamu adalah bagian terindah dalam hidupku.",
  "Kamu adalah cerita yang ingin terus aku tulis.",
  "Kamu adalah doa yang akhirnya menjadi nyata.",
  "Aku tidak tahu bagaimana masa depan nanti.",
  "Tapi aku ingin kamu tetap ada di dalamnya.",
  "Selama kamu di sampingku.",
  "Aku merasa bisa menghadapi apa pun.",
  "Terima kasih sudah menjadi rumah untuk hatiku 💗",
];

type HomeStage = "opening" | "envelope" | "video";

function useTypewriter(text: string, msPerChar: number) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [msPerChar, text]);

  return shown;
}

export default function Home() {
  const [stage, setStage] = useState<HomeStage>("opening");
  const [letterFinished, setLetterFinished] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const together = useMemo(() => daysTogether(), []);
  const goEnvelope = useCallback(() => setStage("envelope"), []);

  const titleFull = "Untuk Kamu, dari aku yang selalu memilih kamu.";
  const titleTyped = useTypewriter(titleFull, 26);
  const heroFull = "Karena dari sekian banyak kemungkinan, aku tetap memilih kamu.";
  const heroTyped = useTypewriter(heroFull, 28);
  const reasons = useMemo(
    () => [
      "kamu cantik banget",
      "kamu gemesin banget",
      "kamu perhatian banget sama aku",
      "kamu sangat amat menggemaskan sekali bahkan pengen aku cium terus",
      "kamu sangat indah sekali sayangku",
    ],
    [],
  );
  const pickReason = () => {
    const next = reasons[Math.floor(Math.random() * reasons.length)] ?? reasons[0];
    setReason(next ?? null);
  };

  return (
    <div className="min-h-[100svh] bg-[color:var(--bg)] text-[var(--text)]">
      {stage === "opening" ? (
        <OpeningScreen onDone={goEnvelope} lines={OPENING_LINES} totalDurationMs={165_000} />
      ) : (
        <>
          <TopNav />
          <main className="relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <StarsBackdrop density={80} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(125,220,255,0.12),transparent_55%)]" />
              <div className="aurora-bg" aria-hidden="true" />
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
              <section className="grid gap-6 sm:gap-8">
                <Reveal>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
                  <div className="text-xs text-[var(--muted)]">Surat kecil, hitung mundur, dan kenangan kita.</div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {(() => {
                      const glow = "selalu memilih kamu";
                      const idx = titleTyped.indexOf(glow);
                      if (idx < 0) {
                        return (
                          <>
                            {titleTyped}
                            <span className="ml-1 inline-block align-middle text-[color:var(--accent)]">▍</span>
                          </>
                        );
                      }
                      const a = titleTyped.slice(0, idx);
                      const b = titleTyped.slice(idx, idx + glow.length);
                      const c = titleTyped.slice(idx + glow.length);
                      return (
                        <>
                          <span>{a}</span>
                          <span className="text-[color:var(--text)] [text-shadow:0_0_22px_rgba(255,77,141,0.28)]">{b}</span>
                          <span>{c}</span>
                          <span className="ml-1 inline-block align-middle text-[color:var(--accent)]">▍</span>
                        </>
                      );
                    })()}
                  </h1>
                  <div className="mt-3 font-[var(--font-letter)] text-lg leading-relaxed text-[color:var(--glow)] [text-shadow:0_0_18px_rgba(125,220,255,0.55)] sm:text-xl">
                    {heroTyped}
                  </div>
                  <div className="mt-3 text-sm text-[var(--muted)]">
                    Sudah bersama selama <span className="font-semibold text-[var(--text)]">{together} hari</span> sejak 10 Juni 2024.
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/kenangan"
                      className="rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                    >
                      Lihat Kenangan
                    </Link>
                    <Link
                      to="/game"
                      className={cn(
                        "rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--text)]",
                        "transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]",
                      )}
                    >
                      Main Claw
                    </Link>
                    <Link
                      to="/secret"
                      className={cn(
                        "rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--text)]",
                        "transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]",
                      )}
                    >
                      Ada Rahasia
                    </Link>
                  </div>
                </div>
                </Reveal>

                <Reveal delayMs={80}>
                  <EnvelopeLetter
                    onFinished={() => {
                      setLetterFinished(true);
                      setStage("video");
                    }}
                  />
                </Reveal>

                <Reveal delayMs={120}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                    <div className="text-sm font-semibold text-[var(--text)]">Countdown Anniversary</div>
                    <div className="mt-4">
                      <CountdownCards />
                    </div>
                  </div>
                  <MusicPlayer />
                </div>
                </Reveal>

                <Reveal delayMs={160}>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
                    <div className="text-xs text-[var(--muted)]">Klik untuk alasan</div>
                    <div className="mt-2 text-xl font-semibold sm:text-2xl">Kenapa Aku Sayang Kamu 💕</div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <RippleButton
                        type="button"
                        onClick={pickReason}
                        className="bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
                      >
                        Klik untuk alasan
                      </RippleButton>
                      <div className="text-sm text-[var(--muted)]">{reason ? `“${reason}”` : "Klik tombolnya ya…"}</div>
                    </div>
                  </div>
                </Reveal>

                <Reveal delayMs={200}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs text-[var(--muted)]">Sudah tertawa bersama</div>
                      <div className="mt-2 text-xl font-semibold text-[var(--text)]">23,238,320,913 kali</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">(kayaknya sih, tapi terasa segitu)</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs text-[var(--muted)]">Total video call</div>
                      <div className="mt-2 text-xl font-semibold text-[var(--text)]">5,000+ jam</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">dan tetap kurang</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs text-[var(--muted)]">Total chat</div>
                      <div className="mt-2 text-xl font-semibold text-[var(--text)]">50,000 pesan</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">plus stiker yang nggak habis-habis</div>
                    </div>
                  </div>
                </Reveal>

                {stage === "video" && letterFinished && <VideoCard />}
              </section>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
