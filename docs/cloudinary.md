# Cloudinary (Upload + Galeri)

## Environment Variables
- `CLOUDINARY_URL`: wajib untuk endpoint `api/gallery.ts` dan script upload.
- (opsional) `VITE_GALLERY_SOURCE=cloudinary`: memaksa frontend selalu ambil galeri dari Cloudinary (kalau tidak ada, fallback ke folder lokal saat dev).

## Upload Foto/Video dari Laptop
Script upload akan mengambil file dari folder lokal dan mengupload ke Cloudinary dengan struktur folder yang sama.

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

