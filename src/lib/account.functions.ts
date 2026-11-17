import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "photos";

export type DeleteAccountResponse = { ok: true } | { ok: false; step: string };

/**
 * Deletes the signed-in caller's account: their listings, profile, every file under
 * photos/<user id>/, then the login itself. Only ever acts on the caller (the user id comes
 * from the verified session, never from the request). Stops at the first failure, so
 * nothing more is deleted once something goes wrong.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeleteAccountResponse> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const listings = await supabaseAdmin.from("listings").delete().eq("organizer_id", userId);
    if (listings.error) {
      console.error("[delete-account] listings", listings.error);
      return { ok: false, step: "listings" };
    }

    const profile = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profile.error) {
      console.error("[delete-account] profile", profile.error);
      return { ok: false, step: "profile" };
    }

    const paths = await listFilesUnder(supabaseAdmin, userId);
    if (paths === null) return { ok: false, step: "photos" };
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths.slice(i, i + 100));
      if (error) {
        console.error("[delete-account] photos", error);
        return { ok: false, step: "photos" };
      }
    }

    const user = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (user.error) {
      console.error("[delete-account] user", user.error);
      return { ok: false, step: "user" };
    }

    return { ok: true };
  });

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

/** Every file path under `folder`, including sub-folders. Null when listing fails. */
async function listFilesUnder(admin: Admin, folder: string): Promise<string[] | null> {
  const files: string[] = [];
  const pending = [folder];
  while (pending.length > 0) {
    const dir = pending.pop()!;
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await admin.storage
        .from(BUCKET)
        .list(dir, { limit: 1000, offset });
      if (error) {
        console.error("[delete-account] list photos", error);
        return null;
      }
      for (const item of data) {
        // Folders come back without an id.
        if (item.id === null) pending.push(`${dir}/${item.name}`);
        else files.push(`${dir}/${item.name}`);
      }
      if (data.length < 1000) break;
    }
  }
  return files;
}
