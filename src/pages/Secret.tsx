import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StarsBackdrop from "@/components/StarsBackdrop";
import TopNav from "@/components/TopNav";
import { cn } from "@/lib/utils";
import { fetchPhotos, localUrlForFilename, type Photo } from "@/utils/photos";

const SECRET_KEY = "valentine_secret_authed";
const SECRET_REMEMBER = "valentine_secret_remember";

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[./-]/g, "");
}

function isValid(pass: string) {
  const n = normalize(pass);
  return n === "10062024" || n === "100624" || n === "10juni2024";
}

export default function Secret() {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(() => localStorage.getItem(SECRET_REMEMBER) === "1");

  const authed = useMemo(() => localStorage.getItem(SECRET_KEY) === "1", []);
  const [unlocked, setUnlocked] = useState(authed);
  const [surprise, setSurprise] = useState<Photo[]>([]);

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const next = img.dataset.fallback;
    if (next && img.src !== next) img.src = next;
  };

  useEffect(() => {
    if (!unlocked) return;
    let alive = true;
    fetchPhotos()
      .then((all) => {
        if (!alive) return;
        const pool = all.filter((p) => p.kind === "image" && p.folder.toLowerCase().startsWith("first date"));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setSurprise(shuffled.slice(0, 6));
      })
      .catch(() => {
        if (!alive) return;
        setSurprise([]);
      });

    return () => {
      alive = false;
    };
  }, [unlocked]);

  return (
    <div className="min-h-[100svh] bg-[color:var(--bg)] text-[var(--text)]">
      <TopNav />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <StarsBackdrop density={70} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_10%,rgba(184,242,230,0.10),transparent_55%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                <LockKeyhole className="h-5 w-5 text-[var(--accent)]" />
              </span>
              <div>
                <div className="text-sm font-semibold">Kata Sandi</div>
                <div className="text-xs text-[var(--muted)]">Hint: tanggal pertama jadian.</div>
              </div>
            </div>

            {!unlocked ? (
              <form
                className="mt-6 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isValid(password)) {
                    setUnlocked(true);
                    setError(null);
                    if (remember) {
                      localStorage.setItem(SECRET_KEY, "1");
                      localStorage.setItem(SECRET_REMEMBER, "1");
                    } else {
                      localStorage.removeItem(SECRET_KEY);
                      localStorage.setItem(SECRET_REMEMBER, "0");
                    }
                  } else {
                    setError("Password salah. Coba format 10/06/2024 atau 10062024.");
                  }
                }}
              >
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={show ? "text" : "password"}
                    className={cn(
                      "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-12 text-sm",
                      "text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                    )}
                    placeholder="Masukkan password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text)] transition hover:bg-white/10"
                    aria-label={show ? "Sembunyikan" : "Tampilkan"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/20"
                  />
                  Ingat di perangkat ini
                </label>

                {error && <div className="text-xs text-[color:var(--accent)]">{error}</div>}

                <button
                  type="submit"
                  className="rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  Buka
                </button>
                <Link to="/" className="text-center text-xs text-[var(--muted)] underline-offset-4 hover:underline">
                  Kembali ke Beranda
                </Link>
              </form>
            ) : (
              <div className="mt-6">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-semibold">Kejutan kecil</div>
                  <div className="mt-2 text-sm text-[var(--muted)]">
                    Kalau kamu baca ini, berarti kamu ingat hari spesial itu. Aku sayang kamu.
                  </div>

                  {surprise.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {surprise.map((p) => (
                        <img
                          key={p.id}
                          src={encodeURI(p.url)}
                          data-fallback={(() => {
                            const fallback = localUrlForFilename(p.filename);
                            return fallback ? encodeURI(fallback) : undefined;
                          })()}
                          onError={onImageError}
                          alt=""
                          className="aspect-square w-full rounded-xl border border-white/10 object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--muted)]">
                      Kejutan sedang disiapkan…
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to="/"
                      className="rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
                    >
                      Balik ke Beranda
                    </Link>
                    <Link
                      to="/gallery"
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--text)] transition hover:bg-white/10"
                    >
                      Lihat Galeri
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

