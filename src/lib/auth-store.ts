import { useSyncExternalStore } from "react";

/**
 * Simulated sign-in. There is no real account or Google OAuth behind this yet: it only
 * remembers, in this browser, that the visitor pressed "sign in". Replace with real auth
 * before relying on it for anything private.
 *
 * Accounts exist only for organisers (people who add activities). Visitors who just browse
 * and save favourites need no account.
 */
const STORAGE_KEY = "veiklu-erdve:role";

let signedIn = false;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    signedIn = window.localStorage.getItem(STORAGE_KEY) === "vadovas";
  } catch {
    signedIn = false;
  }
}

/** True for a signed-in organiser. Always false during server rendering. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(
    (listener) => {
      load();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => {
      load();
      return signedIn;
    },
    () => false,
  );
}

export function signIn() {
  signedIn = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, "vadovas");
  } catch {
    // Storage disabled: stay signed in until the page is reloaded.
  }
  emit();
}

export function signOut() {
  signedIn = false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to remove.
  }
  emit();
}
