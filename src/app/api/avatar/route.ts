import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/get-user";
import { processAvatar } from "@/lib/avatar-server";
import { MAX_UPLOAD_BYTES } from "@/lib/image-check";
import { AVATAR_BUCKET, uploadedAvatarPath } from "@/lib/avatars";
import { limitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

// Uploads a profile picture. The browser has already shrunk it; this checks it
// again from scratch and stores a clean re-encoded copy at <your id>/avatar.jpg.
export async function POST(request: NextRequest) {
  // Only our own pages may call this (a cross-site form or script may not).
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.nextUrl.host) {
    return json({ error: "forbidden" }, 403);
  }

  const user = await getAuthUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  // A handful of uploads per minute is more than anyone needs.
  if (!limitKey(`avatar:${user.id}`, 8, 60_000)) return json({ error: "rate" }, 429);

  // Refuse big bodies before reading them, and stop reading if it lies about its size.
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_UPLOAD_BYTES) return json({ error: "too-large" }, 413);

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "empty" }, 400);
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_UPLOAD_BYTES) {
      await reader.cancel();
      return json({ error: "too-large" }, 413);
    }
    chunks.push(value);
  }

  const result = await processAvatar(Buffer.concat(chunks));
  if (!result.ok) return json({ error: result.reason }, result.status);

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(uploadedAvatarPath(user.id), result.jpeg, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) return json({ error: "storage" }, 502);

  return json({ ok: true }, 200);
}
