export type Photo = {
  id: string;
  url: string;
  kind: "image" | "video";
  title: string;
  description: string;
  folder: string;
  filename: string;
  createdAt?: string;
};

const SPECIAL_DESCRIPTIONS: Record<string, string> = {
  "peyukan.jpg":
    "omagad ini first time sekali aku memeluk kesayanganku yang paling ku sayangi paling kucintai paling kubanggakan aku merasa senang banget bisa bertemu dengan kamu aku pengen sekali berpeyukkan sama kamu pengen senantiasa aku memeyuk kamu lagi...",
  "blackcurrant milk tea.JPEG":
    "aku lupa kamu mesan milktea atau apa antara thai tea juga soalnya warnanya milktea bangget tapi kita saling mencoba satu sama lain yucukkk bangetttt pengen lagiiii",
  "breakfast bareng.JPEG": "omagad kita breakfast bareng tapi bisanya cuman di yogya gemeesss bangettt yucukkk bangett kita breakfast bareng yeayyy!!",
  "first time bbq.JPEG":
    "OMAGADDDD INI KITA FIRST TIME BBQ BERDUA aslinya bertiga sih cuman anggap aja berdua, kamu sangat amat yucuk dan menggemaskan kita gatau ya bingung sama sekali cara masaknya jadi yaudah deh sebisa kita mungkin ya kan huhu aku sangat senang sekali bisa bbq an sama kamu rasanya pengen terulang lagi rasanya heunggg",
  "makan nasi.JPEG": "asik kita sarapan yeayyy gemess banget kan",
  "review makanan.MP4": "omaggaddd yucuk banget kita mereview makanan seneng banget rasaku pengen lagi begini...",
  "yeayyy ke gacoan.JPEG": "akhirnya bisa gacoan date sama aku kan sayangkuu cintakuuu bisa berdua sama aku asikk yeayy yeayyyy yucukk kannn",
  "imupp bangett.JPEG":
    "aduh ini imupp banget pengenn aku rasanya memeyuk kamu memeyukk kamu, kamu seyucuk itu bahkan aku tidak bisa berkata apa apalagi kamu secantik itu :)))))",
  "menyender sama kamu.JPEG":
    "aku pengen rasanya kamu menyender di bahu lagi rasanya aku pengen merasakan itu lagi pengen lagi aku nyender sama kamu dan saling nyender aku melihat foto ini rasanya sedih dan masih berasa di bahu aku sama kamu :(( mau nangis..",
  "bersebelahan sama kamu lagi.mp4": "yucuk banget direkam dea aku mau lagiii sama kamuuu mau lagiii mau banget kangen gandengan lagi sama kamu",
  "gemes banget.MP4":
    "sumpah pengen aku cium pengen aku cium pengen aku cium itu yang ada di otakku gemess banget cantik banget ketemu sama aku cantik bangettt yucukk banget pengen ketemu lagi sama kamu kenapa kamu cantik banget tergoda bangget oasdfjkasdfklas",
  "ini yucuk.JPEG": "ini gemesinnn bangett kamu kalau foto gemesin banget pengen aku peyuk rasanya gemesin banget lucukkk!!!",
  "kamu kangen tidak.JPEG": "kamu kangen tidak kita berdua naik motor date ke gacoan omooo ggemes bangettt kita ngedate ke gacoan padahal mau cobain sotonya ihh",
  "ketika udah sampe.MP4": "omooo ini kita vlog kecil lucu banget kita mau ke rumah kamu udah nunggu selama ini buat bertemu denganmu pengen aku gemesinnnn rasanya",
  "mau banget bersebelahan sama kamu.jpg":
    "aku mau lagi bersebelahan lagi sama kamu pengen banget aku gandengan lagi kapan aku bisa gandengan lagi sama kamu pengen butterfly era lagi, aku tidak sabar menunggunya..",
  "pegongsoran.JPEG": "omagaddd kita sudah sampai pegongsoran yeayyy kerumah kamu dan ketemu mamah gemess bangett yucuk bangettt",
  "yucukk bangett.JPEG": "ini gemesss banget bisa kelihatan tinggi kamu sama aku seberapa gemesin banget ggemessss kayak bocil :3",
  "ganteng banget.JPEG": "lihat kan aku ganteng banget apalagi bertemu kamu pasti nanti jadi hot man and hot woman ya gasih ya gasih aku ganteng banget kan sayang",
  "ganteng.JPEG": "lihat kan aku terkena matahari seganteng ini kan sayangku cintaku muka yang tidak sabar ingin bertemu kamu secepatnya :)",
  "perjalanan di kereta menuju kamu.MP4":
    "omagad di kereta aku merasa deg deg an mau bertemu kamu dan di kereta aku tidak makan banyak karena tidak sabar ingin menemui kamu di real life bahkan sudah aku tunggukan selama itu..",
  "sudah sampai pemalang.mp4":
    "Omagaddd ini setelah tegal aku tidak sabar sudah sampai pemalang dan ini bentar lagi stasiun pemalang tidak sabar tanganku merekam segala momen ini di kereta dan bertemu kamu assdjkdsas melihat kecantikkan kamu :D",
  "couple banget.JPEG": "ini yucukkk banget gemesinn banget kita berdua lagi foto foto di lapangan gemesinn akhirnya kita bisa foto lope lope di sini sama aku",
  "couple couple.JPEG": "yucukkk banget kan akuuu yucuk banget kan!!",
  "asikk.JPEG": "asikk yeayy kita sudah sampai rumah mamah yucuk banget pengen ketemuan lagii :((",
  "foto bareng filter.JPG": "ini yucukk banggettt gemesin bangettt kannnnn",
  "di santoso.JPEG": "OMOOO KITA YUCUKKK BANGET DAPAT DI DEPAN BERDUA SAMA AKU GEMESS BANGETTT KAMU SAYANGKU CINTAKU AKHIRNYA BISA NYOBAIN DI DEPAN GEMES BANGETTT!!!!",
  "dikit lagi.JPEG": "omagad ini dikit lagi udah nyampeee kangen banget masih keingat juga di sini :((",
  "first time santoso.JPEG": "first time banget naik beginian takut dan ga berani campur aduk pls cuman di tenangin sama pacarku jadi lebih tenang yeayyy!!!",
  "gemes.JPEG": "ini gemes bangett bangettt bangettt yucukk bangetttt",
  "poto diem diem.JPEG": "ini aku diem diem foto kamu karena kamu cantik banget gemesin banget pengen aku cium rasanya tidak sabar omo omo omo",
  "bermain game mobil.MP4": "pengen lagi aku main mobil mobil disana lagi pengennya main berdua biar kamu bisa nyoba experiencenya kan!!",
  "ini kamu sama mayu.JPEG": "ihhh yucukkkk banget mayu bertemu dengan orang tua aslinya bertemu bareng dan ketemuan bareng yucukkk sekali aku mau lagi seperti ini gemesss",
  "jalan jalan lagi ke yogya.MP4": "omo aku senang banget bisa jalan jalan lagi sama kamu sayangku cintaku maniskuu pengen lagi heunggg... pengen jalan jalan lagi sama kamuuuuuuuuuu",
  "Mini vlog.MP4":
    "eungg maafin aku yaw sayang mungkin videonya cuman segini tapi ga kebayang kamu sereal life itu kita lagi membeli membeli ke yogya first time ke yogya yeayyy aku sangat menantikan akan hal ini jujur seru banget pengen aku vlog terus cuman sama kamu jadinya terlalu fokus banget huhu :((",
  "omagadadad.JPEG": "omagadddd ini foto bareng kita paling favorit kita berdua yucuk banget gemesin banget kannnn!!! aku mau lagiiii :(((",
  "omoooo.JPEG": "yucukkk bangett paha kita kan sayang ggemess banget kita berdua omoooo"
};

const SPECIAL_DESCRIPTIONS_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(SPECIAL_DESCRIPTIONS).map(([k, v]) => [k.toLowerCase(), v]),
);

const SPECIAL_DESCRIPTIONS_BASE_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(SPECIAL_DESCRIPTIONS).map(([k, v]) => [stripExtension(k).toLowerCase(), v]),
);

function descriptionForFilename(filename: string) {
  const lower = filename.toLowerCase();
  return SPECIAL_DESCRIPTIONS_NORM[lower] ?? SPECIAL_DESCRIPTIONS_BASE_NORM[stripExtension(lower)] ?? "";
}

function stripExtension(filename: string) {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(0, idx) : filename;
}

function defaultCaption(filename: string) {
  const name = stripExtension(filename);
  return name;
}

function normalizeDescription(s: string) {
  return s.trim();
}

function inferKind(filename: string): Photo["kind"] {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video";
  return "image";
}

function folderFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const galleryIndex = parts.indexOf("gallery");
  const sub = galleryIndex >= 0 ? parts.slice(galleryIndex + 1) : parts;
  const folderParts = sub.slice(0, Math.max(0, sub.length - 1));
  return decodeURIComponent(folderParts.join(" / ")) || "Galeri";
}

export async function fetchPhotos() {
  const source = String(import.meta.env.VITE_GALLERY_SOURCE ?? "").toLowerCase();

  if (source === "cloudinary" || import.meta.env.PROD) {
    try {
      return await fetchFromCloudinaryStaticFirst();
    } catch {
      if (source === "cloudinary") throw new Error("Gagal memuat galeri dari Cloudinary");
    }
  }

  return fetchFromLocal();
}

async function fetchFromLocal() {
  const modules = import.meta.glob("/gallery/**/*.{jpg,jpeg,JPEG,JPG,png,PNG,mp4,MP4}", {
    eager: true,
    as: "url",
  }) as Record<string, string>;

  const entries = Object.entries(modules);

  return entries
    .map(([path, url]) => toPhotoFromLocal(path, url))
    .sort((a, b) => {
      if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
      return a.filename.localeCompare(b.filename);
    });
}

type CloudinaryGalleryResponse = {
  items?: Array<{
    id: string;
    publicId: string;
    url: string;
    kind: "image" | "video";
    folder: string;
    filename: string;
    createdAt?: string;
  }>;
  nextCursor?: string | null;
  error?: string;
};

type CloudinaryManifest = {
  generatedAt?: string;
  items?: CloudinaryGalleryResponse["items"];
  error?: string;
};

async function fetchFromCloudinaryStaticFirst() {
  try {
    const r = await fetch(`/gallery-manifest.json?t=${Date.now()}`, { cache: "no-cache" });
    const contentType = r.headers.get("content-type") ?? "";
    if (r.ok && contentType.includes("application/json")) {
      const json = (await r.json()) as CloudinaryManifest;
      const items = Array.isArray(json.items) ? json.items : [];
      if (items.length > 0) return sortPhotos(toPhotosFromCloudinaryItems(items));
      if (typeof json.error === "string" && json.error) {
        throw new Error(json.error);
      }
    }
  } catch {
    
  }

  return fetchFromCloudinaryApi();
}

function toPhotosFromCloudinaryItems(items: NonNullable<CloudinaryGalleryResponse["items"]>) {
  const all: Photo[] = [];
  items.forEach((it) => {
    const filename = it.filename;
    const description = descriptionForFilename(filename);
    const title = defaultCaption(filename);
    all.push({
      id: it.id,
      url: normalizeCloudinaryUrl(it.url),
      kind: it.kind,
      title,
      description: normalizeDescription(description),
      folder: it.folder,
      filename,
      createdAt: it.createdAt,
    });
  });

  return all;
}

function safeDecodeURIComponent(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function normalizeCloudinaryUrl(raw: string) {
  if (!raw) return raw;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw;
  }

  if (!u.hostname.endsWith("res.cloudinary.com")) return raw;

  const parts = u.pathname.split("/").filter(Boolean);
  const uploadIdx = parts.indexOf("upload");
  if (uploadIdx < 0) return raw;

  const afterUploadIdx = uploadIdx + 1;
  const hasVersion = /^v\d+$/.test(parts[afterUploadIdx] ?? "");
  const publicStartIdx = hasVersion ? afterUploadIdx + 1 : afterUploadIdx;
  if (publicStartIdx >= parts.length) return raw;

  const encodeSegment = (seg: string) =>
    encodeURIComponent(seg).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  const encoded = parts.slice(0, publicStartIdx).concat(
    parts.slice(publicStartIdx).map((seg) => encodeSegment(safeDecodeURIComponent(seg))),
  );

  u.pathname = `/${encoded.join("/")}`;
  return u.toString();
}

function sortPhotos(items: Photo[]) {
  return items.sort((a, b) => {
    if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
    return a.filename.localeCompare(b.filename);
  });
}

async function fetchFromCloudinaryApi() {
  const all: Photo[] = [];
  let cursor: string | null | undefined = undefined;
  let guard = 0;

  while (guard < 10) {
    guard += 1;
    const qs = new URLSearchParams();
    qs.set("max", "400");
    if (cursor) qs.set("cursor", cursor);

    const r = await fetch(`/api/gallery?${qs.toString()}`, { cache: "no-cache" });
    const contentType = r.headers.get("content-type") ?? "";

    if (!r.ok) {
      let serverMsg = "";
      if (contentType.includes("application/json")) {
        try {
          const err = (await r.json()) as any;
          serverMsg = typeof err?.message === "string" ? err.message : "";
        } catch {
          serverMsg = "";
        }
      }

      if (r.status === 404) throw new Error("API /api/gallery tidak ditemukan (cek deploy Vercel)");
      if (r.status === 500) throw new Error(serverMsg || "Server galeri error (cek CLOUDINARY_URL di Vercel)");
      throw new Error(serverMsg || `Gagal memuat galeri (HTTP ${r.status})`);
    }

    if (!contentType.includes("application/json")) {
      throw new Error("/api/gallery tidak mengembalikan JSON (kemungkinan /api ter-rewrite ke index.html)");
    }

    const json = (await r.json()) as CloudinaryGalleryResponse;
    const items = Array.isArray(json.items) ? json.items : [];
    all.push(...toPhotosFromCloudinaryItems(items));

    cursor = typeof json.nextCursor === "string" ? json.nextCursor : null;
    if (!cursor) break;
  }

  return sortPhotos(all);
}

function toPhotoFromLocal(path: string, url: string): Photo {
  const filename = decodeURIComponent(path.split("/").pop() ?? "");
  const description = descriptionForFilename(filename);
  const title = defaultCaption(filename);
  return {
    id: path,
    url,
    kind: inferKind(filename),
    title,
    description: normalizeDescription(description),
    folder: folderFromPath(path),
    filename,
  };
}

