# Cloudinary (Upload + Galeri)

## Environment Variables
- `CLOUDINARY_URL`: wajib untuk endpoint `api/gallery.ts` dan script upload.
- (opsional) `VITE_GALLERY_SOURCE=cloudinary`: memaksa frontend selalu ambil galeri dari Cloudinary (kalau tidak ada, fallback ke folder lokal saat dev).

## Upload Foto/Video dari Laptop
Script upload akan mengambil file dari folder lokal dan mengupload ke Cloudinary dengan struktur folder yang sama.

### 1) Set `CLOUDINARY_URL` di komputer kamu
Jangan taruh `CLOUDINARY_URL` di file repo publik.

PowerShell (Windows):
```powershell
$env:CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

### 2) Simulasi dulu (cek folder mapping)
```bash
npm run upload:gallery -- --root "D:\\path\\ke\\gallery" --folder gallery --dry
```

### 3) Upload beneran
```bash
npm run upload:gallery -- --root "D:\\path\\ke\\gallery" --folder gallery
```

Contoh:
```bash
npm run upload:gallery -- --root "D:\\path\\ke\\gallery" --folder gallery
```

Opsi:
- `--root`: folder sumber di laptop (default: `public/gallery`)
- `--folder`: folder target root di Cloudinary (default: `gallery`)
- `--dry`: hanya print rencana upload tanpa mengupload

## Endpoint List Galeri
- `GET /api/gallery`: mengembalikan item galeri dari Cloudinary.

Query:
- `max` (default 400, max 500)
- `cursor` untuk pagination

## Deploy ke Vercel
1) Set environment variables di Vercel:
   - `CLOUDINARY_URL`
   - `VITE_GALLERY_SOURCE=cloudinary`
2) Build command: `npm run build`
3) Output directory: `dist`

Tips: pastikan env variable tadi diset untuk environment **Production** juga (bukan cuma Preview).
