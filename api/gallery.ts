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

type CloudinaryResource = Record<string, unknown>;

function normalizeDisplayFilename(name: string) {
  const base = String(name || "");
  const m = base.match(/^(img)_([0-9]+)(\.[a-z0-9]+)?$/i);
  if (!m) return base;
  const ext = m[3] ?? "";
  return `IMG_${m[2]}${ext}`;
}

function filenameFromPublicId(publicId: string, format?: string) {
  const last = publicId.split("/").pop() ?? publicId;
  const raw = format ? `${last}.${format}` : last;
  return normalizeDisplayFilename(raw);
}

function normalizeFolderSegment(seg: string) {
  const s = String(seg || "").toLowerCase();
  const map: Record<string, string> = {
    "(spesial) peyukkan": "(SPESIAL) PEYUKKAN",
    "(spesial)-peyukkan": "(SPESIAL) PEYUKKAN",
    "(spesial)-peyukan": "(SPESIAL) PEYUKKAN",
    "(spesial)_peyukkan": "(SPESIAL) PEYUKKAN",
    "(spesial)_peyukan": "(SPESIAL) PEYUKKAN",
    "spesial peyukkan": "(SPESIAL) PEYUKKAN",
    "spesial_peyukan": "(SPESIAL) PEYUKKAN",
    "spesial-peyukan": "(SPESIAL) PEYUKKAN",
    "first-date": "First date",
    "foodies": "Foodies",
    "gacoan": "Gacoan",
    "galeri": "Galeri",
    "hotel": "Hotel",
    "jalan-berdua": "Jalan Berdua",
    "kereta-berangkat": "Kereta berangkat",
    "kereta-pulang": "Kereta pulang",
    "lapangan": "Lapangan",
    "pasar-malam": "Pasar malam",
    "rumah": "Rumah",
    "santoso": "Santoso",
    "wonderland-pemalang": "wonderland pemalang",
    "yogya": "yogya",
  };

  if (map[s]) return map[s];

  const words = s.replace(/[-_]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return String(seg || "");
  return words.map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(" ");
}

function folderFromPublicId(publicId: string) {
  const parts = publicId.split("/").filter(Boolean);
  const galleryIndex = parts.indexOf("gallery");
  const sub = galleryIndex >= 0 ? parts.slice(galleryIndex + 1) : parts;
  const folderParts = sub.slice(0, Math.max(0, sub.length - 1));
  return folderParts.map(normalizeFolderSegment).join(" / ") || "Galeri";
}

function normalizeAssetUrl(resource: CloudinaryResource) {
  const rawCloudinaryUrl = process.env.CLOUDINARY_URL;
  let cloudName = "";
  if (rawCloudinaryUrl) {
    try {
      cloudName = new URL(rawCloudinaryUrl).hostname;
    } catch {
      cloudName = "";
    }
  }

  const publicId = String(resource.public_id ?? "");
  const resourceType = String(resource.resource_type ?? "image");
  const version = resource.version;
  const format = resource.format ? String(resource.format) : "";

  if (!cloudName || !publicId) return String(resource.secure_url ?? resource.url ?? "");

  const encodeSegment = (seg: string) =>
    encodeURIComponent(seg).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  const encodedPublicId = publicId.split("/").filter(Boolean).map(encodeSegment).join("/");

  let path = encodedPublicId;
  if (format && !path.toLowerCase().endsWith(`.${format.toLowerCase()}`)) path += `.${format}`;
  const v = typeof version === "number" ? `/v${version}` : "";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload${v}/${path}`;
}

function rewriteFolderSegment(seg: string) {
  const decoded = String(seg || "");
  const norm = decoded
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (norm === "(spesial) peyukkan" || norm === "spesial peyukkan") return "(spesial)-peyukkan";
  return decoded;
}

function rewritePublicId(publicId: string) {
  const parts = String(publicId || "").split("/").filter(Boolean);
  const galleryIndex = parts.indexOf("gallery");
  if (galleryIndex < 0) return publicId;

  const head = parts.slice(0, galleryIndex + 1);
  const rest = parts.slice(galleryIndex + 1);
  if (rest.length === 0) return publicId;

  const leaf = rest[rest.length - 1];
  const folders = rest.slice(0, -1).map(rewriteFolderSegment);
  return [...head, ...folders, leaf].filter(Boolean).join("/");
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
      .map((r: unknown) => {
        if (!r || typeof r !== "object") return null;
        const res = r as CloudinaryResource;
        const sourcePublicId = String(res.public_id ?? "");
        const publicId = rewritePublicId(sourcePublicId);
        const format = res.format ? String(res.format) : undefined;
        const resourceType = String(res.resource_type ?? "image");
        const kind: "image" | "video" = resourceType === "video" ? "video" : "image";
        const assetUrl = normalizeAssetUrl(res);
        if (!sourcePublicId || !publicId || !assetUrl) return null;

        return {
          id: publicId,
          publicId,
          url: assetUrl,
          kind,
          folder: folderFromPublicId(publicId),
          filename: filenameFromPublicId(publicId, format),
          createdAt: res.created_at ? String(res.created_at) : undefined,
          width: typeof res.width === "number" ? (res.width as number) : undefined,
          height: typeof res.height === "number" ? (res.height as number) : undefined,
        } satisfies GalleryItem;
      })
      .filter(Boolean) as GalleryItem[];

    items.sort((a, b) => {
      if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
      return a.filename.localeCompare(b.filename);
    });

    return Response.json({ items, nextCursor: null });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gagal memuat galeri";
    return Response.json(
      {
        message,
        hint: "Cek CLOUDINARY_URL (Production) di Vercel dan pastikan asset ada di folder 'gallery'",
      },
      { status: 500 },
    );
  }
}
