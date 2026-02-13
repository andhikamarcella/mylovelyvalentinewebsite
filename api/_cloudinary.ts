import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!configured) {
    const url = process.env.CLOUDINARY_URL;
    if (url) {
      const u = new URL(url);
      cloudinary.config({
        cloud_name: u.hostname,
        api_key: decodeURIComponent(u.username),
        api_secret: decodeURIComponent(u.password),
        secure: true,
      });
    }
    configured = true;
  }

  return cloudinary;
}
