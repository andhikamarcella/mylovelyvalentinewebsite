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

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  if (!process.env.CLOUDINARY_URL) {
    return Response.json({ message: "CLOUDINARY_URL belum diset" }, { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const rawMax = url.searchParams.get("max");
    const max = Math.min(500, Math.max(1, Number(rawMax ?? 400)));

    const cloudinary = getCloudinary();
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
        const publicId = String(r?.public_id ?? "");
        const format = r?.format ? String(r.format) : undefined;
        const resourceType = String(r?.resource_type ?? "image");
        const kind: "image" | "video" = resourceType === "video" ? "video" : "image";
        const assetUrl = String(r?.secure_url ?? r?.url ?? "");
        if (!publicId || !assetUrl) return null;

        return {
          id: publicId,
          publicId,
          url: assetUrl,
          kind,
          folder: folderFromPublicId(publicId),
          filename: filenameFromPublicId(publicId, format),
          createdAt: r?.created_at ? String(r.created_at) : undefined,
          width: typeof r?.width === "number" ? r.width : undefined,
          height: typeof r?.height === "number" ? r.height : undefined,
        } satisfies GalleryItem;
      })
      .filter(Boolean) as GalleryItem[];

    items.sort((a, b) => {
      if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
      return a.filename.localeCompare(b.filename);
    });

    return Response.json({ items, nextCursor: null });
  } catch (e: any) {
    return Response.json(
      {
        message: e?.message ?? "Gagal memuat galeri",
        hint: "Cek CLOUDINARY_URL (Production) di Vercel dan pastikan asset ada di folder 'gallery'",
      },
      { status: 500 },
    );
  }
}
