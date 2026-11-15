import { useSyncExternalStore } from "react";
import { SAMPLE_LISTINGS, type Listing } from "./listings";

const STORAGE_KEY = "bureliu-erdve:listings";

let userListings: Listing[] = [];
let combined: Listing[] = SAMPLE_LISTINGS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Listing[]) : [];
    if (Array.isArray(parsed)) {
      userListings = parsed;
      combined = [...userListings, ...SAMPLE_LISTINGS];
    }
  } catch {
    userListings = [];
  }
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return combined;
}

function getServerSnapshot() {
  return SAMPLE_LISTINGS;
}

export function useListings(): Listing[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Adds a listing. `saved` is false when the browser could not store it (storage full or
 * disabled); the listing then lasts only until the page is reloaded.
 */
export function addListing(listing: Omit<Listing, "id" | "userSubmitted">): {
  listing: Listing;
  saved: boolean;
} {
  load();
  const created: Listing = {
    ...listing,
    id: `burelis-${Date.now().toString(36)}`,
    userSubmitted: true,
  };
  return { listing: created, saved: commit([created, ...userListings]) };
}

/** Replace the organiser's own listings and persist them. False if the browser refused. */
function commit(next: Listing[]): boolean {
  userListings = next;
  combined = [...userListings, ...SAMPLE_LISTINGS];
  let saved = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
  } catch {
    // Storage full or disabled: the change lasts for this session only.
    saved = false;
  }
  listeners.forEach((l) => l());
  return saved;
}

/**
 * Replace the content of a listing added from this browser. The built-in sample listings
 * are not editable. Returns null when there is no such listing.
 */
export function updateListing(
  id: string,
  data: Omit<Listing, "id" | "userSubmitted">,
): { listing: Listing; saved: boolean } | null {
  load();
  if (!userListings.some((l) => l.id === id)) return null;
  const updated: Listing = { ...data, id, userSubmitted: true };
  return {
    listing: updated,
    saved: commit(userListings.map((l) => (l.id === id ? updated : l))),
  };
}

/** Remove a listing added from this browser. Sample listings cannot be removed. */
export function deleteListing(id: string) {
  load();
  commit(userListings.filter((l) => l.id !== id));
}

const noopSubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
