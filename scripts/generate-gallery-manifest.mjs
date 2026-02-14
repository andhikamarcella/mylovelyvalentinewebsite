import fs from "node:fs/promises";
import path from "node:path";

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCloudinaryUrl(raw) {
  try {
    const u = new URL(raw);
    const cloudName = u.hostname;
    const apiKey = safeDecode(u.username);
    const apiSecret = safeDecode(u.password);
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

function filenameFromResource(resource) {
  const publicId = String(resource?.public_id ?? "");
  const format = resource?.format ? String(resource.format) : undefined;
  const original = resource?.original_filename ? String(resource.original_filename) : "";

  const base = original || ((publicId || "").split("/").pop() || publicId);
  const decodedBase = safeDecode(base);
  const raw = format ? `${decodedBase}.${format}` : decodedBase;
  const m = raw.match(/^(img)_([0-9]+)(\.[a-z0-9]+)?$/i);
  if (!m) return raw;
  const ext = m[3] ?? "";
  return `IMG_${m[2]}${ext}`;
}

function folderFromPublicId(publicId) {
  const parts = String(publicId || "")
    .split("/")
    .filter(Boolean)
    .map((p) => safeDecode(p));
  const galleryIndex = parts.indexOf("gallery");
  const sub = galleryIndex >= 0 ? parts.slice(galleryIndex + 1) : parts;
  const folderParts = sub.slice(0, Math.max(0, sub.length - 1));

  const normalizeSeg = (seg) => {
    const s = String(seg || "").toLowerCase();
    const map = {
      "(spesial) peyukkan": "(SPESIAL) PEYUKKAN",
      "(spesial)-peyukkan": "(SPESIAL) PEYUKKAN",
      "(spesial)-peyukan": "(SPESIAL) PEYUKKAN",
      "(spesial)_peyukkan": "(SPESIAL) PEYUKKAN",
      "(spesial)_peyukan": "(SPESIAL) PEYUKKAN",
      "spesial peyukkan": "(SPESIAL) PEYUKKAN",
      "spesial_peyukan": "(SPESIAL) PEYUKKAN",
      "spesial-peyukan": "(SPESIAL) PEYUKKAN",
      "first-date": "First date",
      foodies: "Foodies",
      gacoan: "Gacoan",
      galeri: "Galeri",
      hotel: "Hotel",
      "jalan-berdua": "Jalan Berdua",
      "kereta-berangkat": "Kereta berangkat",
      "kereta-pulang": "Kereta pulang",
      lapangan: "Lapangan",
      "pasar-malam": "Pasar malam",
      rumah: "Rumah",
      santoso: "Santoso",
      "wonderland-pemalang": "wonderland pemalang",
      yogya: "yogya",
    };
    if (map[s]) return map[s];
    const words = s
      .replace(/[-_]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return String(seg || "");
    return words.map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(" ");
  };

  return folderParts.map(normalizeSeg).join(" / ") || "Galeri";
}

function encodePublicId(publicId) {
  const encodeSegment = (seg) =>
    encodeURIComponent(seg).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  return String(publicId).split("/").filter(Boolean).map(encodeSegment).join("/");
}

function rewriteFolderSegment(seg) {
  const decoded = safeDecode(String(seg || ""));
  const norm = decoded
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (norm === "(spesial) peyukkan" || norm === "spesial peyukkan") return "(spesial)-peyukkan";
  return decoded;
}

function rewritePublicId(publicId) {
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

function buildDeliveryUrl({ cloudName, resource }) {
  const publicId = String(resource?.public_id ?? "");
  const resourceType = String(resource?.resource_type ?? "image");
  const version = resource?.version;
  const format = resource?.format ? String(resource.format) : "";

  if (!cloudName || !publicId) return "";

  let path = encodePublicId(publicId);
  if (format && !path.toLowerCase().endsWith(`.${format.toLowerCase()}`)) path += `.${format}`;

  const v = typeof version === "number" ? `/v${version}` : "";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload${v}/${path}`;
}

async function listResources({ cloudName, apiKey, apiSecret, resourceType }) {
  const out = [];
  let nextCursor = null;
  let guard = 0;

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  while (guard < 20) {
    guard += 1;
    const u = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload`);
    u.searchParams.set("prefix", "gallery");
    u.searchParams.set("max_results", "500");
    if (nextCursor) u.searchParams.set("next_cursor", nextCursor);

    const r = await fetch(u, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      throw new Error(`Cloudinary list failed (${resourceType}) HTTP ${r.status} ${text}`);
    }

    const json = await r.json();
    const resources = Array.isArray(json?.resources) ? json.resources : [];
    out.push(...resources);
    nextCursor = typeof json?.next_cursor === "string" ? json.next_cursor : null;
    if (!nextCursor) break;
  }

  return out;
}

async function main() {
  const outPath = path.join(process.cwd(), "public", "gallery-manifest.json");
  const raw = process.env.CLOUDINARY_URL;
  const parsed = raw ? parseCloudinaryUrl(raw) : null;

  if (!parsed) {
    const payload = {
      generatedAt: new Date().toISOString(),
      items: [],
      error: "CLOUDINARY_URL belum diset atau formatnya salah",
    };
    await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
    return;
  }

  try {
    const [images, videos] = await Promise.all([
      listResources({ ...parsed, resourceType: "image" }),
      listResources({ ...parsed, resourceType: "video" }),
    ]);

    const resources = [...images, ...videos];
    const items = resources
      .map((r) => {
        const sourcePublicId = String(r?.public_id ?? "");
        const publicId = rewritePublicId(sourcePublicId);
        const resourceType = String(r?.resource_type ?? "image");
        const kind = resourceType === "video" ? "video" : "image";
        const url = buildDeliveryUrl({ cloudName: parsed.cloudName, resource: r });
        if (!sourcePublicId || !publicId || !url) return null;
        return {
          id: publicId,
          publicId,
          url,
          kind,
          folder: folderFromPublicId(publicId),
          filename: filenameFromResource(r),
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

    const payload = {
      generatedAt: new Date().toISOString(),
      items,
    };

    await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  } catch (e) {
    const payload = {
      generatedAt: new Date().toISOString(),
      items: [],
      error: e?.message ?? String(e),
    };
    await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  }
}

await main();
