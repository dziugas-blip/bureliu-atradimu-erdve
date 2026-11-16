import { supabase } from "@/integrations/supabase/client";
import { currentUserId, signOut } from "./auth-store";
import { deleteListing } from "./listings-store";
import { saveProfile } from "./profile-store";

export interface DeleteAccountResult {
  error?: string;
  /**
   * True when the login itself was deleted on the server. False when only the organiser's
   * activities, photos and profile were removed, because the server function that deletes
   * logins is not set up yet.
   */
  loginDeleted?: boolean;
}

/**
 * Deletes the signed-in organiser's account and everything they published, then signs
 * them out. Prefers the "delete-account" server function, which can also remove the login;
 * without it, deletes what the browser is allowed to: activities, photos and profile.
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  const userId = currentUserId();
  if (!userId) return { error: "Prisijunkite iš naujo ir bandykite dar kartą." };

  const server = await supabase.functions.invoke("delete-account");
  if (!server.error) {
    await signOut();
    return { loginDeleted: true };
  }

  const failed =
    "Nepavyko ištrinti visų duomenų. Patikrinkite interneto ryšį ir bandykite dar kartą.";

  const { data: own, error: listError } = await supabase
    .from("listings")
    .select("id")
    .eq("organizer_id", userId);
  if (listError) return { error: failed };
  for (const { id } of own) {
    // Also removes each listing's photos.
    const { error } = await deleteListing(id);
    if (error) return { error: failed };
  }

  // The database does not let the browser delete a profile row, so blank it instead.
  const profile = await saveProfile({ name: "", headline: "", age: "", bio: "", photo: "" });
  if (profile.error) return { error: failed };

  // Photos uploaded but never published still sit in the organiser's folder.
  const { data: files } = await supabase.storage.from("photos").list(userId, { limit: 1000 });
  if (files && files.length > 0) {
    await supabase.storage.from("photos").remove(files.map((f) => `${userId}/${f.name}`));
  }

  await signOut();
  return { loginDeleted: false };
}
