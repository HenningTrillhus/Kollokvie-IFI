import { MAX_INPUT_BYTES, MAX_PIXELS, MAX_STORED_BYTES, sniffImage } from "@/lib/image-check";

// A profile's `avatar` column is null (show the initial on the accent color),
// "preset:NN" (one of the built-in icons) or "upload:<version>" (own picture).

export const PRESET_COUNT = 100;

export const PRESET_AVATARS = Array.from(
  { length: PRESET_COUNT },
  (_, i) => `preset:${String(i + 1).padStart(2, "0")}`
);

export const AVATAR_BUCKET = "avatars";

export function uploadedAvatarPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export function avatarSrc(userId: string, avatar: string | null | undefined) {
  if (!avatar) return null;

  if (avatar.startsWith("preset:")) {
    const n = avatar.slice("preset:".length);
    return /^\d{2,3}$/.test(n) ? `/avatars/avatar-${n}.webp` : null;
  }

  if (avatar.startsWith("upload:")) {
    const version = avatar.slice("upload:".length);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base || !/^\d+$/.test(version)) return null;
    return `${base}/storage/v1/object/public/${AVATAR_BUCKET}/${uploadedAvatarPath(userId)}?v=${version}`;
  }

  return null;
}

const SIZE = 256;

// The server turned the upload down (HTTP status kept for the message).
export class AvatarUploadError extends Error {
  constructor(public status: number) {
    super(String(status));
  }
}

// Sends the finished picture to the server, which checks it again and stores
// a clean copy. Throws AvatarUploadError if it is refused.
export async function uploadAvatar(blob: Blob): Promise<void> {
  const response = await fetch("/api/avatar", {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!response.ok) throw new AvatarUploadError(response.status);
}

// Why a picture was refused (shown to the person as a plain message).
export class AvatarImageError extends Error {
  constructor(public reason: "too-large" | "type" | "corrupt" | "pixels") {
    super(reason);
  }
}

// Turns whatever the user picked (camera roll, file, photo) into a small
// square JPEG: centre-cropped, EXIF-rotated, on white for transparent PNGs.
//
// Checked before anything is sent: size, the *real* type (first bytes, not the
// file name or the type the browser reports), and pixel count. Always shrunk to
// 256 x 256 and re-encoded (which also drops camera metadata such as location),
// then squeezed below the size limit. The server checks all of it again.
export async function prepareAvatarImage(file: File): Promise<Blob> {
  if (file.size === 0) throw new AvatarImageError("corrupt");
  if (file.size > MAX_INPUT_BYTES) throw new AvatarImageError("too-large");

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const kind = sniffImage(head);
  // JPEG, PNG and WebP only: no SVG (can carry script), no animated GIF.
  if (!kind || kind === "gif") throw new AvatarImageError("type");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new AvatarImageError("corrupt");
  }

  try {
    if (bitmap.width * bitmap.height > MAX_PIXELS) throw new AvatarImageError("pixels");
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new AvatarImageError("corrupt");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);

    // Compress, and squeeze harder until it is comfortably small.
    let blob: Blob | null = null;
    for (const quality of [0.85, 0.72, 0.6, 0.45]) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (blob && blob.size <= MAX_STORED_BYTES) break;
    }
    if (!blob || blob.size > MAX_STORED_BYTES) throw new AvatarImageError("too-large");
    return blob;
  } finally {
    bitmap.close();
  }
}
