import { useEffect, useMemo, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currentUserId, useAuthUser } from "./auth-store";
import { normalizeText } from "./listings";
import { deletePhotos } from "./photo-upload";

/** An organiser's public profile, stored in the database and readable by everyone. */
export interface OrganizerProfile {
  name: string;
  /** One line under the name, e.g. "Baleto pedagogė". */
  headline: string;
  /** Empty when the organiser prefers not to say. */
  age: string;
  bio: string;
  /** Public URL of the portrait, or "" for none. */
  photo: string;
}

const EMPTY: OrganizerProfile = { name: "", headline: "", age: "", bio: "", photo: "" };

/**
 * Profiles fetched so far, by organiser id. `null` means "looked it up, there is none";
 * a missing key means "not looked up yet".
 */
const cache = new Map<string, OrganizerProfile | null>();
const inFlight = new Map<string, Promise<void>>();
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function fetchProfile(id: string): Promise<void> {
  const pending = inFlight.get(id);
  if (pending) return pending;
  const request = (async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, headline, age, bio, photo")
      .eq("id", id)
      .maybeSingle();
    inFlight.delete(id);
    if (error) {
      console.error("[profiles] could not load", error);
      return; // Not cached, so the next visit tries again.
    }
    cache.set(id, data ?? null);
    emit();
  })();
  inFlight.set(id, request);
  return request;
}

/**
 * The public profile of any organiser: undefined while loading, null when they never
 * filled one in. Sample organisers (ids that are not real accounts) have none.
 */
export function useOrganizerProfile(id: string | null): OrganizerProfile | null | undefined {
  const isAccount = id !== null && /^[0-9a-f-]{36}$/i.test(id);
  useEffect(() => {
    if (isAccount && !cache.has(id)) void fetchProfile(id);
  }, [id, isAccount]);
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  if (!isAccount) return null;
  return cache.get(id);
}

/**
 * The signed-in organiser's own profile. Until they save one, the name defaults to the
 * one they registered with (or the one Google gave), so forms start filled in.
 */
export function useProfile(): OrganizerProfile {
  const user = useAuthUser();
  const stored = useOrganizerProfile(user?.id ?? null);
  // Memoised so callers can safely use the result as an effect dependency.
  return useMemo(() => (user ? (stored ?? { ...EMPTY, name: user.name }) : EMPTY), [user, stored]);
}

/** Saves some profile fields for the signed-in organiser. */
export async function saveProfile(patch: Partial<OrganizerProfile>): Promise<{ error?: string }> {
  const id = currentUserId();
  if (!id) return { error: "Prisijunkite iš naujo ir bandykite dar kartą." };
  // Read the current profile first, so saving one field never wipes the others.
  if (!cache.has(id)) await fetchProfile(id);
  if (!cache.has(id)) {
    return { error: "Nepavyko išsaugoti. Patikrinkite interneto ryšį ir bandykite dar kartą." };
  }
  const before = cache.get(id) ?? EMPTY;
  const next = { ...before, ...patch };
  const { error } = await supabase.from("profiles").upsert({ id, ...next });
  if (error) {
    console.error("[profiles] could not save", error);
    return { error: "Nepavyko išsaugoti. Patikrinkite interneto ryšį ir bandykite dar kartą." };
  }
  cache.set(id, next);
  emit();
  if (before.photo && before.photo !== next.photo) void deletePhotos([before.photo]);
  return {};
}

/**
 * Which organiser a listing belongs to. Database listings carry the owner's account id;
 * the built-in sample listings don't, so theirs is derived from the contact name
 * ("Rūta Kazlauskienė" becomes "ruta-kazlauskiene") and one person's activities still
 * group together.
 */
export function organizerIdOf(listing: { organizerId?: string; contactName: string }): string {
  if (listing.organizerId) return listing.organizerId;
  return (
    normalizeText(listing.contactName)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "vadovas"
  );
}
