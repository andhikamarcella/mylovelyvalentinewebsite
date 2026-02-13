import { v2 as cloudinary } from "cloudinary";

let configured = false;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCloudinaryUrl(raw: string) {
  try {
    const u = new URL(raw);
    const cloudName = u.hostname;
    const apiKey = safeDecode(u.username);
    const apiSecret = safeDecode(u.password);
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
  } catch {
    return null;
  }
}

export function getCloudinary() {
  if (!configured) {
    const raw = process.env.CLOUDINARY_URL;
    if (raw) {
      const parsed = parseCloudinaryUrl(raw);
      if (parsed) {
        cloudinary.config({ ...parsed, secure: true });
      } else {
        cloudinary.config({ cloudinary_url: raw, secure: true });
      }
    }
    configured = true;
  }

  return cloudinary;
}

