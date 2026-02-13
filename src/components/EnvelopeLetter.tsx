import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { playPaperOpenSfx } from "@/utils/sfx";

const LETTER = {
  heading: "Untuk Kamu",
  body: `Untuk sayangku cintaku manisku kesayanganku yang paling kusayangi dan yang paling berarti dalam hidupku,

Di antara semua kemungkinan di dunia ini, aku masih sering tidak percaya bahwa semesta mempertemukanku dengan kamu.
Dari sekian banyak jalan yang bisa kita pilih, kita justru berjalan di arah yang sama dan jalin bersama.

Sejak kamu hadir, ada banyak hal kecil yang berubah.
Hari-hariku terasa lebih hangat bersamamu entah dari video call, telepon, dan chat.
Tawaku terasa lebih tulus bersama kamu lucu dan manis tertawa dengan kamu.
Dan hatiku terasa lebih tenang bersama kamu cintaku sayangku cintaku maniskuu.

Kamu bukan cuma seseorang yang aku sayang.
Kamu adalah tempat aku merasa dimengerti tanpa harus menjelaskan semuanya.
Kamu adalah rumah yang selalu ingin aku tuju, bahkan saat dunia terasa melelahkan.

Valentine ini mungkin hanya satu hari dalam setahun.
Tapi perasaanku untukmu bukan sesuatu yang datang musiman seperti hanya pada valentine.
Ia tumbuh pelan-pelan, semakin dalam, semakin kuat, belajar, dan memperbaiki setiap ada masalah.

Aku tidak tahu bagaimana masa depan akan berjalan akankah kita mulus berjalan sampai dimana kita nikah.
Tapi jika aku boleh berharap, aku ingin kamu tetap ada di dalam setiap rencana, doa-doaku, dan aku pengen kita nikah dan aku bisa bawa kamu kemana mana bersama atau berdua.

Terima kasih sudah bertahan.
Terima kasih sudah mengerti.
Terima kasih sudah memilih aku.
Terima kasih sudah selalu ada dalam diriku.
Terima kasih sudah melewati berbagai tantangan selama kita berdua.
Terima kasih sudah menjadi versi terbaik untuk aku.
Terima kasih sudah mau menjadi istriku.
Terima kasih sudah mau menerimaku seadanya.

Aku mencintaimu, lebih dari yang bisa dirangkai oleh kata-kata tertulis ini.
Dan aku ingin terus memilih kamu, detik ini, hari ini, besok, dan seterusnya. Dan aku selalu berkomitmen dengan kamu penampilan kamu yang berubah aku tetap dan selalu menerima kamu selalu dan pastinya! Apa yang kamu inginkan nanti akan tercapai bersamaku, menonton konser, liburan bersama aku, membawa kamu ke luar negeri yang kita impikan, membawa kamu ke tempat yang belum kita kunjungi berdua, membawa kamu ke tempat yang belum pernah kamu kunjungi, kemanapun ke tempat apapun yang penting bersama kamu selalu bersama kamu!! aku tidak akan selingkuh atau kemana mana yang aku inginkan adalah pergi bersama kamu membawa kamu kemanapun tujuannya yang penting sama kamu!

Happy Valentine’s Day my Babyyy my Sweetiepieeee 💗

Dengan penuh cinta,

Pacar kamu yang paling ganteng tentunya siapalagi-!`,
};

function paginateParagraphs(paragraphs: string[], maxChars: number) {
  const pages: string[][] = [];
  let current: string[] = [];
  let count = 0;

  const push = () => {
    if (current.length === 0) return;
    pages.push(current);
    current = [];
    count = 0;
  };

  paragraphs.forEach((p) => {
    const chunk = p.trim();
    const next = chunk.length + 2;
    if (current.length > 0 && count + next > maxChars) push();
    current.push(chunk);
    count += next;
  });

  push();
  return pages.length ? pages : [[]];
}

export default function EnvelopeLetter({
  className,
  onFinished,
}: {
  className?: string;
  onFinished: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [page, setPage] = useState(0);
  const [opening, setOpening] = useState(false);

  const paragraphs = useMemo(
    () =>
      LETTER.body
        .split("\n")
        .map((l) => l.trimEnd())
        .join("\n")
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean),
    [],
  );

  const pages = useMemo(() => paginateParagraphs(paragraphs, 780), [paragraphs]);
  const totalPages = pages.length;
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className={cn("grid gap-4", className)}>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-[var(--muted)]">Klik amplop untuk membuka</div>
            <div className="mt-1 text-lg font-semibold text-[var(--text)]">Untuk Kamu — Valentine</div>
          </div>
        </div>

        <div className="mt-5 grid place-items-center">
          <button
            type="button"
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4",
              "transition hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
              !open && !opening && "wiggle-hover",
            )}
            onClick={() => {
              if (open) return;
              setOpening(true);
              playPaperOpenSfx();
              window.setTimeout(() => setOpen(true), 320);
              window.setTimeout(() => {
                setShowLetter(true);
                setOpening(false);
              }, 720);
            }}
            disabled={open || opening}
            aria-label="Buka amplop"
          >
            <img
              src={encodeURI(open ? "/stamp/envelopeopen.png" : "/stamp/envelope.png")}
              alt="Envelope"
              className={cn(
                "relative z-10 h-44 w-auto transition duration-700",
                open ? "scale-[1.03]" : "group-hover:scale-[1.02]",
                opening && "rotate-[-1.5deg] scale-[1.03]",
              )}
              loading="lazy"
            />

            <img
              src={encodeURI("/stamp/tallstamp.png")}
              alt="Stamp"
              className={cn(
                "pointer-events-none absolute bottom-6 left-6 z-30 h-16 w-auto -rotate-[8deg] drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]",
                open && "opacity-80",
              )}
              loading="lazy"
            />
            <img
              src={encodeURI("/stamp/basicstamp.png")}
              alt="Stamp"
              className={cn(
                "pointer-events-none absolute right-6 top-6 z-30 h-12 w-12 rotate-[6deg] opacity-95 drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]",
                open && "opacity-85",
              )}
              loading="lazy"
            />

            {!open && (
              <div className="mt-3 text-center text-sm text-[var(--muted)]">Tap untuk buka</div>
            )}
          </button>
        </div>
      </div>

      {showLetter && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="mx-auto grid h-full max-w-3xl place-items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--bg)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--text)]">{LETTER.heading}</div>
                  <div className="text-xs text-[var(--muted)]">Halaman {page + 1} / {totalPages}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLetter(false)}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-[var(--text)] transition hover:bg-white/10"
                >
                  Tutup
                </button>
              </div>

              <div className="relative p-4 sm:p-6">
                <div
                  className={cn(
                    "relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 bg-white/90",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                  )}
                  style={{ backgroundImage: `url(${encodeURI("/stamp/letter.jpg")})`, backgroundSize: "cover", backgroundPosition: "center" }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-white/60" />

                  <img
                    src={encodeURI("/stamp/tallstamp.png")}
                    alt="Stamp"
                    className="pointer-events-none absolute -bottom-2 -left-2 z-0 h-24 w-auto -rotate-[10deg] opacity-75"
                    loading="lazy"
                  />
                  <img
                    src={encodeURI("/stamp/basicstamp.png")}
                    alt="Stamp"
                    className="pointer-events-none absolute -right-2 -top-2 z-0 h-14 w-14 rotate-[6deg] opacity-85"
                    loading="lazy"
                  />

                  <div className="relative z-10 max-h-[72vh] overflow-auto px-6 py-8 sm:px-12 sm:py-12">
                    <div className="space-y-4 font-[var(--font-letter)] text-[15px] leading-relaxed text-[#111] sm:text-base">
                      {pages[page]?.map((p, i) => (
                        <p key={`${page}-${i}-${p}`}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={!canPrev}
                    className={cn(
                      "h-10 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-[var(--text)] transition hover:bg-white/10",
                      !canPrev && "opacity-50 hover:bg-white/5",
                    )}
                  >
                    Sebelumnya
                  </button>

                  {canNext ? (
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="h-10 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-black transition hover:brightness-110"
                    >
                      Lanjut
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowLetter(false);
                        onFinished();
                      }}
                      className="h-10 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-black transition hover:brightness-110"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

