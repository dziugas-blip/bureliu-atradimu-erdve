import { currentUserId, signOut } from "./auth-store";
import { deleteAccount } from "./account.functions";

export interface DeleteAccountResult {
  error?: string;
  /** True when the login itself was deleted on the server along with everything else. */
  loginDeleted?: boolean;
}

/**
 * Deletes the signed-in organiser's account and everything they published (activities,
 * photos, profile and the login itself) on the server, then signs them out.
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  const userId = currentUserId();
  if (!userId) return { error: "Prisijunkite iš naujo ir bandykite dar kartą." };

  const failed =
    "Nepavyko ištrinti visų duomenų. Patikrinkite interneto ryšį ir bandykite dar kartą.";

  try {
    const result = await deleteAccount();
    if (!result.ok) return { error: failed };
  } catch (error) {
    console.error("[account] delete failed", error);
    return { error: failed };
  }

  await signOut();
  return { loginDeleted: true };
}
