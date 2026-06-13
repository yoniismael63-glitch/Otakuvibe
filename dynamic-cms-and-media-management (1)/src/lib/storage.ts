/**
 * Storage abstraction: Cloudinary (production/Vercel) or local disk (dev).
 *
 * When the environment variable CLOUDINARY_CLOUD_NAME is defined, all uploads
 * are streamed to Cloudinary. Otherwise files are saved in public/uploads/
 * (local development only — this does NOT work on Vercel since the filesystem
 * is read-only in production).
 */

import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
export const ALLOWED_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

export type StoredFile = {
  url: string;
  filename: string;
};

function useCloudinary(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME);
}

function detectType(mime: string): "image" | "video" {
  return ALLOWED_VIDEO.includes(mime) ? "video" : "image";
}

function guessResourceType(mime: string): "image" | "video" | "raw" {
  if (ALLOWED_VIDEO.includes(mime)) return "video";
  if (ALLOWED_IMAGE.includes(mime)) return "image";
  return "raw";
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogg",
    "video/quicktime": ".mov",
  };
  return map[mime] || "";
}

// ---------------------------------------------------------------------------
// Cloudinary upload
// ---------------------------------------------------------------------------
async function uploadToCloudinary(
  buffer: Buffer,
  mime: string,
  originalName: string
): Promise<StoredFile> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Variables Cloudinary manquantes");
  }

  const resourceType = guessResourceType(mime);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Build basic auth header
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const form = new FormData();
  const ext = path.extname(originalName) || extFromMime(mime);
  const publicId = `${randomUUID()}${ext ? ext.replace(/^\./, "") : ""}`;

  // Cloudinary expects the file either as a URL or base64 / multipart.
  // We send a multipart form using a Blob.
  const arr = new Uint8Array(buffer);
  const blob = new Blob([arr], { type: mime });
  form.append("file", blob, originalName);
  form.append("public_id", publicId);
  form.append("folder", "otaku-vibes");

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur Cloudinary: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, filename: data.public_id };
}

// ---------------------------------------------------------------------------
// Cloudinary delete
// ---------------------------------------------------------------------------
async function deleteFromCloudinary(url: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  // Determine resource type from URL
  const isVideo = /\/video\/upload\//.test(url);
  const resourceType = isVideo ? "video" : "image";

  // Extract public_id from URL: .../upload/v.../folder/id.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  if (!match) return;

  const publicId = decodeURIComponent(match[1]);
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: publicId }),
    }
  );
}

// ---------------------------------------------------------------------------
// Local upload (dev only)
// ---------------------------------------------------------------------------
async function uploadToDisk(
  buffer: Buffer,
  mime: string,
  originalName: string
): Promise<StoredFile> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(originalName) || extFromMime(mime);
  const uniqueName = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);
  return { url: `/uploads/${uniqueName}`, filename: uniqueName };
}

async function deleteFromDisk(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // already deleted — ignore
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function uploadFile(
  file: File,
  _userId?: number
): Promise<StoredFile> {
  if (file.size > MAX_SIZE) throw new Error("Fichier trop volumineux (max 50 Mo)");

  const isImage = ALLOWED_IMAGE.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);
  if (!isImage && !isVideo) throw new Error("Type de fichier non supporté");

  const buffer = Buffer.from(await file.arrayBuffer());

  if (useCloudinary()) {
    return uploadToCloudinary(buffer, file.type, file.name);
  }
  return uploadToDisk(buffer, file.type, file.name);
}

export async function deleteFile(url: string): Promise<void> {
  if (useCloudinary()) {
    if (url.startsWith("http") && url.includes("cloudinary.com")) {
      await deleteFromCloudinary(url);
    }
    return;
  }
  await deleteFromDisk(url);
}

export { detectType, MAX_SIZE };
