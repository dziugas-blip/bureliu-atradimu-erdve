import { supabase } from "@/integrations/supabase/client";
import { currentUserId } from "./auth-store";
import { fileToResizedBlob } from "./image-resize";

const BUCKET = "photos";

/**
 * Shrinks a photo and uploads it to the signed-in organiser's own folder in storage.
 * Returns its public URL. The storage rules only allow writing inside a folder named
 * after the user's id, so the path must start with it.
 */
export async function uploadPhoto(file: File, maxSide = 1000, quality = 0.75): Promise<string> {
  const userId = currentUserId();
  if (!userId) throw new Error("Not signed in");
  const blob = await fileToResizedBlob(file, maxSide, quality);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The storage path inside the bucket for one of our public photo URLs, or null. */
export function photoPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0] ?? "");
  return path || null;
}

/**
 * Removes photos that are no longer used. Best effort: a photo that cannot be removed
 * (e.g. it belongs to someone else, or the network fails) is simply left in storage.
 */
export async function deletePhotos(urls: readonly string[]): Promise<void> {
  const paths = urls.map(photoPath).filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.warn("[photos] could not remove", error);
}
