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

export function addListing(listing: Omit<Listing, "id" | "userSubmitted">): Listing {
  load();
  const created: Listing = {
    ...listing,
    id: `burelis-${Date.now().toString(36)}`,
    userSubmitted: true,
  };
  userListings = [created, ...userListings];
  combined = [...userListings, ...SAMPLE_LISTINGS];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userListings));
  } catch {
    // Storage full or disabled: keep the listing for this session only.
  }
  listeners.forEach((l) => l());
  return created;
}

const noopSubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
