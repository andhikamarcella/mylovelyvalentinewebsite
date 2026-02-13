import { Film, LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PhotoLightbox from "@/components/PhotoLightbox";
import StarsBackdrop from "@/components/StarsBackdrop";
import TopNav from "@/components/TopNav";
import { cn } from "@/lib/utils";
import { fetchPhotos, type Photo } from "@/utils/photos";

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [folder, setFolder] = useState<string>("Semua");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [month, setMonth] = useState<string>("Semua");
  const pageSize = 15;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPhotos()
      .then((p) => {
        if (!alive) return;
        setPhotos(p);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Gagal memuat galeri");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const folders = useMemo(() => {
    const map = new Map<string, { count: number; thumb?: string }>();
    photos.forEach((p) => {
      const current = map.get(p.folder) ?? { count: 0 };
      current.count += 1;
      if (!current.thumb && p.kind === "image") current.thumb = p.url;
      map.set(p.folder, current);
    });

    return Array.from(map.entries())
      .map(([name, v]) => ({ name, count: v.count, thumb: v.thumb }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [photos]);

  const filtered = useMemo(() => {
    let out = photos;
    if (folder !== "Semua") out = out.filter((p) => p.folder === folder);
    if (month !== "Semua") out = out.filter((p) => inferMonthKey(p.folder) === month);
    return out;
  }, [folder, month, photos]);

  const months = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      const k = inferMonthKey(p.folder);
      if (k !== "Tidak diketahui") set.add(k);
    });
    return Array.from(set).sort();
  }, [photos]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length]);
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const highlights = useMemo(() => {
    const want = new Set(["peyukan.jpg", "img_2503.jpeg", "menyender sama kamu.jpeg"].map((s) => s.toLowerCase()));
    const byName = photos.filter((p) => p.kind === "image" && want.has(p.filename.toLowerCase()));
    const byCaption = photos.filter((p) => p.kind === "image" && p.description.trim().length > 0);

    const out: Photo[] = [];
    const seen = new Set<string>();
    [...byName, ...byCaption].forEach((p) => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      out.push(p);
    });

    return out.slice(0, 6);
  }, [photos]);

  const timelineGroups = useMemo(() => {
    const map = new Map<string, Photo[]>();
    filtered.forEach((p) => {
      const key = folder === "Semua" ? inferMonthKey(p.folder) : p.folder;
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    });

    const groups = Array.from(map.entries())
      .map(([k, items]) => ({
        key: k,
        items: [...items].sort((a, b) => a.filename.localeCompare(b.filename)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

    return groups;
  }, [filtered, folder]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    photos.forEach((p, idx) => map.set(p.id, idx));
    return map;
  }, [photos]);

  return (
    <div className="min-h-[100svh] bg-[color:var(--bg)] text-[var(--text)]">
      <TopNav />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <StarsBackdrop density={70} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_10%,rgba(255,77,141,0.10),transparent_55%)]" />
          <div className="aurora-bg" aria-hidden="true" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <div className="mb-6">
            <div className="text-xs text-[var(--muted)]">
              <Link to="/" className="underline-offset-4 hover:underline">
                Beranda
              </Link>{" "}
              / Kenangan
            </div>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Kenangan Kita</h1>
            <div className="mt-2 text-sm text-[var(--muted)]">Setiap foto di sini adalah potongan kecil dari perjalanan kita.</div>
            {!loading && !error && (
              <div className="mt-1 text-xs text-[var(--muted)]">{photos.length} kenangan tersimpan. Dan aku ingin menambahkannya bersamamu.</div>
            )}
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-[320px_1fr]">
              <div className="h-64 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
              <div className="h-96 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[var(--muted)]">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-[320px_1fr]">
              <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-[var(--text)]">Folder</div>
                <div className="mt-3 max-h-[70vh] space-y-2 overflow-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFolder("Semua");
                      setPage(1);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-left",
                      "transition hover:bg-black/25 hover:-translate-y-0.5 active:translate-y-0",
                      folder === "Semua" && "ring-2 ring-[color:var(--accent)]",
                    )}
                  >
                    <div className="text-sm text-[var(--text)]">Semua</div>
                    <div className="text-xs text-[var(--muted)]">{photos.length}</div>
                  </button>

                  {folders.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => {
                        setFolder(f.name);
                        setPage(1);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-left",
                        "transition hover:bg-black/25 hover:-translate-y-0.5 active:translate-y-0",
                        folder === f.name && "ring-2 ring-[color:var(--accent)]",
                      )}
                    >
                      {f.thumb ? (
                        <img
                          src={encodeURI(f.thumb)}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-white/10 bg-black/20" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-[var(--text)]">{f.name}</div>
                        <div className="truncate text-xs text-[var(--muted)]">{f.count} item</div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {highlights.length > 0 && (
                  <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-[var(--text)]">⭐ Kenangan Favorit</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {highlights.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setLightboxIndex(indexById.get(p.id) ?? 0)}
                          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                          aria-label={`Buka highlight ${p.title}`}
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={encodeURI(p.url)}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                              loading="lazy"
                            />
                          </div>
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" />
                          <div className="pointer-events-none absolute bottom-3 left-3 right-3 text-xs text-white/90 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            {p.description || p.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setView("grid");
                        setPage(1);
                      }}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs text-[var(--text)]",
                        "transition hover:bg-white/10",
                        view === "grid" && "ring-2 ring-[color:var(--accent)]",
                      )}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView("timeline");
                        setPage(1);
                      }}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs text-[var(--text)]",
                        "transition hover:bg-white/10",
                        view === "timeline" && "ring-2 ring-[color:var(--accent)]",
                      )}
                    >
                      <List className="h-4 w-4" />
                      Timeline
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {months.length > 0 && (
                      <select
                        className="h-9 rounded-full border border-white/10 bg-black/20 px-4 text-xs text-[var(--text)]"
                        value={month}
                        onChange={(e) => {
                          setMonth(e.target.value);
                          setPage(1);
                        }}
                        aria-label="Filter bulan"
                      >
                        <option value="Semua">Semua bulan</option>
                        {months.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="text-xs text-[var(--muted)]">
                      {folder === "Semua" ? "Semua" : folder} • {filtered.length} item
                    </div>
                  </div>
                </div>

                {view === "grid" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {paged.map((p) => {
                        const idx = indexById.get(p.id) ?? 0;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setLightboxIndex(idx)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(0,0,0,0.60)]"
                            aria-label={`Buka ${p.title}`}
                          >
                            {p.kind === "video" && (
                              <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[10px] text-white/90">
                                <Film className="h-3.5 w-3.5" />
                                VIDEO
                              </div>
                            )}

                            <div className="aspect-[4/3] overflow-hidden">
                              {p.kind === "video" ? (
                                <video
                                  playsInline
                                  muted
                                  preload="metadata"
                                  src={encodeURI(p.url)}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                                />
                              ) : (
                                <img
                                  src={encodeURI(p.url)}
                                  alt=""
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                                  loading="lazy"
                                />
                              )}
                            </div>

                            <div className="border-t border-white/10 p-3">
                              <div className="truncate text-sm font-semibold text-white">{p.title || "Kenangan"}</div>
                              <div className="mt-1 line-clamp-2 text-xs text-white/80">{p.description || p.folder}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className={cn(
                            "h-10 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-[var(--text)] transition hover:bg-white/10 active:scale-[0.98]",
                            page <= 1 && "opacity-50 hover:bg-white/5 active:scale-100",
                          )}
                        >
                          Sebelumnya
                        </button>
                        <div className="text-xs text-[var(--muted)]">{page} / {totalPages}</div>
                        <button
                          type="button"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className={cn(
                            "h-10 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]",
                            page >= totalPages && "opacity-70 hover:brightness-100 active:scale-100",
                          )}
                        >
                          Lanjut
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-8">
                    {timelineGroups.map((g) => (
                      <div key={g.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-lg font-semibold text-[var(--text)] sm:text-xl">{g.key}</div>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {g.items.slice(0, 30).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setLightboxIndex(indexById.get(p.id) ?? 0)}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left transition hover:-translate-y-0.5"
                              aria-label={`Buka ${p.title}`}
                            >
                              {p.kind === "video" && (
                                <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[10px] text-white/90">
                                  <Film className="h-3.5 w-3.5" />
                                  VIDEO
                                </div>
                              )}
                              <div className="aspect-[4/3] overflow-hidden">
                                {p.kind === "video" ? (
                                  <video
                                    playsInline
                                    muted
                                    preload="metadata"
                                    src={encodeURI(p.url)}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                                  />
                                ) : (
                                  <img
                                    src={encodeURI(p.url)}
                                    alt=""
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
                                    loading="lazy"
                                  />
                                )}
                              </div>

                              <div className="border-t border-white/10 p-3">
                                <div className="truncate text-sm font-semibold text-white">{p.title}</div>
                                <div className="mt-1 line-clamp-2 text-xs text-white/80">{p.description || p.folder}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={photos}
            index={lightboxIndex}
            onIndex={setLightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </main>
    </div>
  );
}

function inferMonthKey(folderName: string) {
  const s = folderName.toLowerCase();
  const m = s.match(/(20\d{2})[-/._ ](0[1-9]|1[0-2])/);
  if (m) return `${m[1]}-${m[2]}`;

  const map: Array<[string, string]> = [
    ["januari", "01"],
    ["februari", "02"],
    ["maret", "03"],
    ["april", "04"],
    ["mei", "05"],
    ["juni", "06"],
    ["juli", "07"],
    ["agustus", "08"],
    ["september", "09"],
    ["oktober", "10"],
    ["november", "11"],
    ["desember", "12"],
  ];

  const y = s.match(/(20\d{2})/);
  if (y) {
    for (const [name, mm] of map) {
      if (s.includes(name)) return `${y[1]}-${mm}`;
    }
  }

  return "Tidak diketahui";
}

