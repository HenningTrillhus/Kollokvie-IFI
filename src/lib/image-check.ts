// Checks on pictures that people upload. Shared by the browser (before anything
// is sent) and the server (before anything is stored). What a file *claims* to
// be (its name or type) is never trusted: the first bytes decide.

export type ImageKind = "jpeg" | "png" | "webp" | "gif";

// The largest picture we even look at (before it is shrunk). Larger is refused.
export const MAX_INPUT_BYTES = 8 * 1024 * 1024;
// What may be sent to the server: the shrunk picture is far smaller than this.
export const MAX_UPLOAD_BYTES = 256 * 1024;
// The finished avatar is a 256 x 256 JPEG well below this.
export const MAX_STORED_BYTES = 100 * 1024;
// Refuse absurd pixel counts ("decompression bombs").
export const MAX_PIXELS = 24_000_000;

// Which kind of picture the bytes really are, or null if it is not one we accept.
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "png";
  }
  // RIFF....WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "webp";
  }
  // GIF87a / GIF89a
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) {
    return "gif";
  }
  return null;
}
