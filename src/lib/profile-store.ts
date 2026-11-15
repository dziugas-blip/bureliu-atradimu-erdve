import { useSyncExternalStore } from "react";
import { normalizeText } from "./listings";

/**
 * The signed-in organiser's public profile. Like the sign-in itself this lives only in this
 * browser for now, so there is exactly one editable profile: the local one.
 */
export interface OrganizerProfile {
  name: string;
  /** One line under the name, e.g. "Baleto pedagogė". */
  headline: string;
  /** Empty when the organiser prefers not to say. */
  age: string;
  bio: string;
  /** Portrait as a data URL, or "" for none. */
  photo: string;
}

/** `organizerId` given to every listing added from this browser. */
export const LOCAL_ORGANIZER_ID = "mano-profilis";

const STORAGE_KEY = "veiklu-erdve:profile";
const EMPTY: OrganizerProfile = { name: "", headline: "", age: "", bio: "", photo: "" };

let profile: OrganizerProfile = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (parsed && typeof parsed === "object") {
      const p = parsed as Record<string, unknown>;
      const text = (key: keyof OrganizerProfile) =>
        typeof p[key] === "string" ? (p[key] as string) : "";
      profile = {
        name: text("name"),
        headline: text("headline"),
        age: text("age"),
        bio: text("bio"),
        photo: text("photo"),
      };
    }
  } catch {
    profile = EMPTY;
  }
}

/** Update some profile fields. Returns false if the browser could not store the change. */
export function saveProfile(patch: Partial<OrganizerProfile>): boolean {
  load();
  profile = { ...profile, ...patch };
  let saved = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    saved = false;
  }
  listeners.forEach((l) => l());
  return saved;
}

export function useProfile(): OrganizerProfile {
  return useSyncExternalStore(
    (listener) => {
      load();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => {
      load();
      return profile;
    },
    () => EMPTY,
  );
}

/**
 * Which organiser a listing belongs to. Listings added here carry an id; the built-in
 * sample listings don't, so theirs is derived from the contact name ("Rūta Kazlauskienė"
 * becomes "ruta-kazlauskiene") and one person's activities still group together.
 */
export function organizerIdOf(listing: { organizerId?: string; contactName: string }): string {
  if (listing.organizerId) return listing.organizerId;
  return (
    normalizeText(listing.contactName)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "vadovas"
  );
}
