# Spesifikasi Desain Halaman (Desktop-first)

## Global Styles
- Layout: max-width 1200px, center container; spacing 8/12/16/24/32.
- Warna: Background #0B0B10; Surface #141423; Accent (heart) #FF4D7D; Text utama #FFFFFF; Text sekunder #B9B9C6.
- Tipografi: H1 40/48, H2 28/36, Body 16/24, Caption 12/16.
- Button: primary (accent) + hover brighten, focus ring jelas; secondary (outline) untuk aksi non-utama.
- Link: underline on hover; transisi 150–250ms.
- Motion: easing lembut; micro-interactions pakai transform+opacity (hindari animasi berat).

---

## 1) Opening + Beranda
### Meta Information
- Title: "Valentine Home"
- Description: "Opening, hero, musik, dan navigasi utama."
- OG: title/description + cover image.

### Layout
- Struktur stacked sections (vertikal) dengan hero di atas, konten di tengah, dan music player sticky di bawah.
- CSS: Flexbox untuk header/CTA, Grid untuk blok hero bila perlu.

### Page Structure & Components
1. Opening Overlay (full-screen)
   - Elemen: logo/teks pembuka, tombol “Mulai”, (opsional) “Skip”.
   - Interaksi: klik “Mulai” -> fade out + scale down; disable scroll saat overlay aktif.
2. Hero (atas)
   - Elemen: H1, subteks singkat, dua CTA: “Main Claw Machine” dan “Lihat Kenangan”.
   - Visual: background gradient/ornamen hati; CTA primary menonjol.
3. Navigasi
   - Elemen: link Beranda / Mini-game / Kenangan; state aktif.
4. Music Player (upgrade, sticky bottom)
   - Elemen: judul track, play/pause, next/prev, progress bar (seek), volume slider + mute.
   - State: mini (default) dan expanded (klik area judul/chevron) untuk lihat playlist sederhana.
   - Aksesibilitas: kontrol keyboard, aria-label, fokus terlihat.

---

## 2) Mini-game Claw Machine
### Meta Information
- Title: "Claw Machine"
- Description: "Mini-game ambil hati."
- OG: cover game.

### Layout
- Centered game stage; panel status di kanan (desktop) menggunakan CSS Grid 2 kolom.
- Stage bisa Canvas (fixed aspect ratio) atau DOM layer (absolute positioning).

### Page Structure & Components
1. Header ringkas
   - Elemen: judul, tombol kembali ke Beranda.
2. Game Stage
   - Elemen: area mesin, claw, objek “hati”, area drop.
   - Kontrol: tombol on-screen (untuk klik) + dukungan keyboard (kiri/kanan, drop).
3. Status & Result Panel
   - Elemen: status (Ready/Playing/Result), indikator “hati tertangkap” saat sukses, tombol “Main lagi”.
   - Micro: animasi hasil (fade/slide) dan highlight saat menang.

---

## 3) Kenangan (Galeri + Amplop & Surat)
### Meta Information
- Title: "Kenangan"
- Description: "Galeri momen, highlight, timeline, filter, dan surat interaktif."
- OG: collage/hightlight.

### Layout
- Top controls (filter + toggle) lalu area konten.
- CSS Grid untuk galeri; mode timeline menggunakan layout stacked (kartu per tanggal).

### Page Structure & Components
1. Highlight Section
   - Elemen: 1–3 kartu besar/slider sederhana; klik membuka item.
2. Toolbar
   - Toggle: "Grid" / "Timeline" (segmented control).
   - Filter: dropdown/tag chips; state “aktif” jelas; tombol “Reset”.
3. Gallery Grid
   - Kartu: thumbnail, judul singkat/tanggal.
   - Micro-interactions: hover lift + zoom ringan, skeleton saat loading asset, fokus keyboard.
4. Timeline View
   - Elemen: kelompok per tanggal/bulan; kartu momen berurutan.
5. Amplop + Surat (dengan sound)
   - Amplop: kartu besar dengan animasi hover (wiggle halus) dan klik untuk membuka.
   - Surat: panel/modal terpusat; animasi unfold; tombol tutup.
   - Sound: auto-play saat open (jika user gesture sudah ada), tombol mute SFX khusus, dan tombol replay sound.
