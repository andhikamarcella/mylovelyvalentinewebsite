import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!configured) {
    const url = process.env.CLOUDINARY_URL;
    if (url) {
      cloudinary.config({
        cloudinary_url: url,
      });
    }
    configured = true;
  }

  return cloudinary;
}

