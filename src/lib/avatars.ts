// A profile's `avatar` column is null (show the initial on the accent color),
// "preset:NN" (one of the built-in icons) or "upload:<version>" (own picture).

export const PRESET_COUNT = 21;

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
    return /^\d{2}$/.test(n) ? `/avatars/avatar-${n}.webp` : null;
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
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

// Turns whatever the user picked (camera roll, file, photo) into a small
// square JPEG: centre-cropped, EXIF-rotated, on white for transparent PNGs.
export async function prepareAvatarImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size > MAX_INPUT_BYTES) {
    throw new Error("unsupported");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) throw new Error("encode");
    return blob;
  } finally {
    bitmap.close();
  }
}
