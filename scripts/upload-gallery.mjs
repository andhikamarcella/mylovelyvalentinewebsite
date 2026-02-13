import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".mp4"]);

function getArg(name, fallback) {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return fallback;
  const v = process.argv[idx + 1];
  return v ?? fallback;
}

function normalizePathForCloudinary(p) {
  return p.split(path.sep).join("/");
}

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) continue;
    out.push(full);
  }
  return out;
}

async function main() {
  const root = getArg("--root", path.join(process.cwd(), "public", "gallery"));
  const baseFolder = getArg("--folder", "gallery");
  const dryRun = process.argv.includes("--dry");

  if (!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL belum diset di environment kamu");
  }

  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

  const files = await walk(root);
  if (files.length === 0) {
    console.log("Tidak ada file .jpg/.jpeg/.png/.mp4 ditemukan di:", root);
    return;
  }

  console.log(`Menemukan ${files.length} file. Root: ${root}`);
  console.log(`Upload ke Cloudinary folder: ${baseFolder}`);
  if (dryRun) console.log("DRY RUN: tidak akan upload, hanya print rencana");

  let ok = 0;
  let fail = 0;

  for (const abs of files) {
    const rel = path.relative(root, abs);
    const relDir = path.dirname(rel);
    const fileName = path.basename(rel);
    const cloudFolder = relDir === "." ? baseFolder : `${baseFolder}/${normalizePathForCloudinary(relDir)}`;
    const publicId = path.parse(fileName).name;
    const ext = path.extname(fileName).toLowerCase();
    const resourceType = ext === ".mp4" ? "video" : "image";

    const info = `${rel} -> ${cloudFolder}/${publicId}`;
    if (dryRun) {
      console.log(info);
      continue;
    }

    try {
      await cloudinary.uploader.upload(abs, {
        folder: cloudFolder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: false,
        use_filename: true,
        image_metadata: resourceType === "image",
      });
      ok += 1;
      console.log("OK", info);
    } catch (e) {
      fail += 1;
      console.log("FAIL", info);
    }
  }

  console.log(`Selesai. OK=${ok}, FAIL=${fail}`);
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});

