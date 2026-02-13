# Page Design Spec — Website Valentine (Desktop-first)

## Global Styles (Design Tokens)
- Font (wajib):
  - Display/CRT/Accent: Bitcount Grid Double
  - UI/Body: Google Sans
  - Surat (body): Playfair Display
- Scale: 14/16/20/28/40 (mobile menurunkan 1 step).
- Warna tema (Romantis): Background #0B0B12, Surface #151528, Text #F7E9EF, Accent #FF4D8D, Accent-2 #B8F2E6.
- Warna tema (Gelap): Background #08080A, Surface #121215, Text #F2F2F2, Accent #7C5CFF.
- Glow (wajib): variasi sky blue / baby blue (contoh: #7DDCFF dan #B8F2FF) untuk judul dan teks penting.
- Button: primary solid accent + hover (brightness +5–8%), focus ring 2px accent.
- Link: underline on hover, transisi 160ms.
- Motion: transisi umum 160–240ms; animasi amplop 600–900ms ease-in-out.

## Layout & Responsiveness
- Desktop-first: container max-width 1100–1200px, padding 24–32px.
- Layout: hybrid CSS Grid (struktur section) + Flexbox (alignment komponen).
- Breakpoint utama: ≤768px menumpuk (stack) dan mengurangi padding.

---

## 0) Opening — Monitor Screen
### Page Structure
- Fullscreen scene.
- Layering: stars background (behind) → CRT overlay (scanlines + vignette) → teks.

### Visual & Motion
- Teks terasa seperti “monitor/layar HP” (refresh/hertz):
  - scanline overlay (opacity rendah)
  - jitter halus (1–2px) + sedikit blur/glow biru
  - render loop memakai `window.requestAnimationFrame(draw);`
- Durasi: 2 menit 45 detik total, 125 step fade-in + 125 step fade-out.

### Typography
- Gunakan Bitcount Grid Double untuk teks opening.
- Warna teks: biru glow (sky/baby blue) + sedikit noise/grain overlay.

### Interaksi
- Opsional tombol kecil “Skip” (kanan bawah) langsung ke scene amplop.

---

## 1) Beranda
### Meta Information
- Title: “Untuk Kamu — Valentine”
- Description: “Surat kecil, hitung mundur, dan kenangan kita.”
- Open Graph: og:title, og:description, og:image (thumbnail romantis), og:type=website.

### Page Structure
- Opening → Header sticky ringan → Hero → Amplop (centerpiece) → Countdown+Typing → CTA.

### Sections & Components
1. **Top Navigation (Header)**
   - Kiri: logo/nama panggilan.
   - Kanan: tombol “Galeri”, “Rahasia”, toggle “Gelap/Romantis”.
2. **Hero Copy**
   - Judul 1 baris + subjudul 1–2 baris.
3. **Envelope Animation Block**
   - Card center (surface + shadow lembut).
   - State: Closed → Opening (animasi) → Open (surat muncul).
   - Interaksi: klik amplop untuk membuka; tombol kecil “Tutup” opsional.
4. **Letter Content (setelah terbuka)**
   - Area teks surat dengan font Playfair Display, dukung line breaks.
   - Heading/penanda stempel bisa pakai Google Sans.
5. **Countdown**
   - 4 kolom (Hari/Jam/Menit/Detik) berbentuk pill/card.
6. **CTA Row**
   - Primary: “Lihat Kenangan” → /gallery
   - Secondary: “Ada Rahasia” → /secret

---

## 2) Galeri & Timeline
### Meta Information
- Title: “Kenangan Kita”
- Description: “Galeri foto dan timeline otomatis dari metadata.”

### Page Structure
- Two-column desktop: kiri timeline, kanan grid galeri. (≤768px: timeline di atas, galeri di bawah)

### Sections & Components
1. **Header mini + Breadcrumb**
   - “Beranda / Kenangan”.
2. **Timeline Panel**
   - List vertikal berdasarkan metadata (urut tanggal / order).
   - Item: tanggal, caption singkat, thumbnail kecil.
   - Interaksi: klik item → scroll/focus ke foto terkait.
3. **Gallery Grid**
   - Grid 3 kolom desktop (gap 16–20px).
   - Card: foto (cover), caption, tanggal.
   - Interaksi: klik card → modal/lightbox.
4. **Lightbox Modal**
   - Foto besar, caption, tanggal, tombol prev/next, close.

---

## 3) Halaman Rahasia
### Meta Information
- Title: “Rahasia”
- Description: “Masukkan password untuk membuka kejutan.”

### Page Structure
- Centered card layout (single column), fokus pada input.

### Sections & Components
1. **Password Gate Card**
   - Judul “Kata Sandi” + hint singkat (tanpa bocorkan jawaban).
   - Input password + toggle show/hide.
   - Tombol “Buka” (loading state).
   - Error message inline jika salah.
   - Opsi checkbox “Ingat di perangkat ini” (simpan flag sesi).
2. **Secret Content (setelah lolos)**
   - Konten kejutan: teks romantis + satu visual (gambar/ilustrasi) + tombol kembali ke Beranda.

## Interaction States
- Tema: toggle mengubah class root (mis. `data-theme`) dan animasi transisi warna.
- Amplop: nonaktifkan klik saat animasi berjalan, tampilkan aria-live untuk typing.
- Akses rahasia: jika belum lolos, route tetap /secret namun konten terkunci (tidak render konten rahasia).
