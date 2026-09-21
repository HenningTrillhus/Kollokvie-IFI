import "server-only";
import sharp from "sharp";
import { MAX_PIXELS, MAX_STORED_BYTES, MAX_UPLOAD_BYTES, sniffImage } from "@/lib/image-check";

export type AvatarResult =
  | { ok: true; jpeg: Buffer }
  | { ok: false; status: 400 | 413 | 415; reason: "too-large" | "type" | "corrupt" };

// The server's own check of an uploaded profile picture, whatever the browser
// did: size, real type (first bytes), pixel count, then a full re-encode to a
// 256 x 256 JPEG. Re-encoding throws away everything that is not pixels
// (metadata, embedded scripts, trailing data), so what is stored is a clean image.
export async function processAvatar(input: Buffer): Promise<AvatarResult> {
  if (input.length === 0) return { ok: false, status: 400, reason: "corrupt" };
  if (input.length > MAX_UPLOAD_BYTES) return { ok: false, status: 413, reason: "too-large" };

  const kind = sniffImage(input);
  if (!kind || kind === "gif") return { ok: false, status: 415, reason: "type" };

  try {
    const base = () =>
      sharp(input, { limitInputPixels: MAX_PIXELS, failOn: "error" })
        .rotate() // apply the camera's rotation, then forget it
        .resize(256, 256, { fit: "cover", position: "centre" })
        .flatten({ background: "#ffffff" });

    let quality = 82;
    let jpeg = await base().jpeg({ quality, mozjpeg: true }).toBuffer();
    // Squeeze further if it is still large (very detailed pictures).
    while (jpeg.length > MAX_STORED_BYTES && quality > 40) {
      quality -= 12;
      jpeg = await base().jpeg({ quality, mozjpeg: true }).toBuffer();
    }
    if (jpeg.length > MAX_STORED_BYTES) return { ok: false, status: 413, reason: "too-large" };
    return { ok: true, jpeg };
  } catch {
    // Not a picture we can decode: damaged, a disguised file, or too many pixels.
    return { ok: false, status: 415, reason: "corrupt" };
  }
}
