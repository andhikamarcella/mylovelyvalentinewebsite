import { getCloudinary } from "./_cloudinary";

type GalleryItem = {
  id: string;
  publicId: string;
  url: string;
  kind: "image" | "video";
  folder: string;
  filename: string;
  createdAt?: string;
  width?: number;
  height?: number;
};

function filenameFromPublicId(publicId: string, format?: string) {
  const last = publicId.split("/").pop() ?? publicId;
  return format ? `${last}.${format}` : last;
}

function folderFromPublicId(publicId: string) {
  const parts = publicId.split("/").filter(Boolean);
  const galleryIndex = parts.indexOf("gallery");
  const sub = galleryIndex >= 0 ? parts.slice(galleryIndex + 1) : parts;
  const folderParts = sub.slice(0, Math.max(0, sub.length - 1));
  return folderParts.join(" / ") || "Galeri";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const cloudinary = getCloudinary();
  if (!process.env.CLOUDINARY_URL) {
    res.status(500).json({ message: "CLOUDINARY_URL belum diset" });
    return;
  }

  try {
    const max = Math.min(500, Math.max(1, Number(req.query.max ?? 400)));

    const [images, videos] = await Promise.all([
      cloudinary.api.resources({ type: "upload", prefix: "gallery", max_results: max }),
      cloudinary.api.resources({ type: "upload", prefix: "gallery", max_results: max, resource_type: "video" }),
    ]);

    const resources = [
      ...(Array.isArray(images?.resources) ? images.resources : []),
      ...(Array.isArray(videos?.resources) ? videos.resources : []),
    ];

    const items: GalleryItem[] = resources
      .map((r: any) => {
        const publicId = String(r.public_id ?? "");
        const format = r.format ? String(r.format) : undefined;
        const resourceType = String(r.resource_type ?? "image");
        const kind: "image" | "video" = resourceType === "video" ? "video" : "image";
        const url = String(r.secure_url ?? r.url ?? "");

        if (!publicId || !url) return null;

        return {
          id: publicId,
          publicId,
          url,
          kind,
          folder: folderFromPublicId(publicId),
          filename: filenameFromPublicId(publicId, format),
          createdAt: r.created_at ? String(r.created_at) : undefined,
          width: typeof r.width === "number" ? r.width : undefined,
          height: typeof r.height === "number" ? r.height : undefined,
        } satisfies GalleryItem;
      })
      .filter(Boolean) as GalleryItem[];

    res.status(200).json({
      items,
      nextCursor: null,
    });
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Gagal memuat galeri" });
  }
}
