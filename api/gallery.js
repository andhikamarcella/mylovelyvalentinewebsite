const { v2: cloudinary } = require("cloudinary");

let configured = false;

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function configureCloudinary() {
  if (configured) return;

  const raw = process.env.CLOUDINARY_URL;
  if (!raw) {
    configured = true;
    return;
  }

  try {
    const u = new URL(raw);
    const cloudName = u.hostname;
    const apiKey = safeDecode(u.username);
    const apiSecret = safeDecode(u.password);

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      configured = true;
      return;
    }
  } catch {
    
  }

  cloudinary.config({ cloudinary_url: raw, secure: true });
  configured = true;
}

function filenameFromPublicId(publicId, format) {
  const last = (publicId || "").split("/").pop() || publicId;
  return format ? `${last}.${format}` : last;
}

function folderFromPublicId(publicId) {
  const parts = String(publicId || "")
    .split("/")
    .filter(Boolean);
  const galleryIndex = parts.indexOf("gallery");
  const sub = galleryIndex >= 0 ? parts.slice(galleryIndex + 1) : parts;
  const folderParts = sub.slice(0, Math.max(0, sub.length - 1));
  return folderParts.join(" / ") || "Galeri";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  if (!process.env.CLOUDINARY_URL) {
    res.status(500).json({ message: "CLOUDINARY_URL belum diset" });
    return;
  }

  try {
    configureCloudinary();

    const max = Math.min(500, Math.max(1, Number(req.query?.max ?? 400)));
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({ type: "upload", prefix: "gallery", max_results: max }),
      cloudinary.api.resources({ type: "upload", prefix: "gallery", max_results: max, resource_type: "video" }),
    ]);

    const resources = [
      ...(Array.isArray(images?.resources) ? images.resources : []),
      ...(Array.isArray(videos?.resources) ? videos.resources : []),
    ];

    const items = resources
      .map((r) => {
        const publicId = String(r?.public_id ?? "");
        const format = r?.format ? String(r.format) : undefined;
        const resourceType = String(r?.resource_type ?? "image");
        const kind = resourceType === "video" ? "video" : "image";
        const url = String(r?.secure_url ?? r?.url ?? "");

        if (!publicId || !url) return null;

        return {
          id: publicId,
          publicId,
          url,
          kind,
          folder: folderFromPublicId(publicId),
          filename: filenameFromPublicId(publicId, format),
          createdAt: r?.created_at ? String(r.created_at) : undefined,
          width: typeof r?.width === "number" ? r.width : undefined,
          height: typeof r?.height === "number" ? r.height : undefined,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
        return a.filename.localeCompare(b.filename);
      });

    res.status(200).json({ items, nextCursor: null });
  } catch (e) {
    res.status(500).json({
      message: e?.message || "Gagal memuat galeri",
      hint: "Cek CLOUDINARY_URL (Production) di Vercel dan pastikan asset ada di folder 'gallery'",
    });
  }
};

