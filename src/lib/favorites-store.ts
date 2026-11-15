import { useSyncExternalStore } from "react";

const STORAGE_KEY = "veiklu-erdve:favorites";
const EMPTY: readonly string[] = [];

let ids: readonly string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) ids = parsed.filter((v): v is string => typeof v === "string");
  } catch {
    ids = EMPTY;
  }
}

function commit(next: readonly string[]) {
  ids = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage full or disabled: favourites then last for this visit only.
  }
  listeners.forEach((l) => l());
}

/** Add the listing to favourites, or remove it if it is already there. */
export function toggleFavorite(id: string) {
  load();
  commit(ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]);
}

export function clearFavorites() {
  commit(EMPTY);
}

/** Favourite listing ids, newest first. Empty during server rendering. */
export function useFavorites(): readonly string[] {
  return useSyncExternalStore(
    (listener) => {
      load();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => {
      load();
      return ids;
    },
    () => EMPTY,
  );
}
