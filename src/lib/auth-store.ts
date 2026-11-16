import { useSyncExternalStore } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

/**
 * Organiser sign-in, backed by Lovable Cloud auth (Google or email + password).
 *
 * Accounts exist only for organisers (people who add activities). Visitors who just browse
 * and save favourites need no account.
 */

/** Key the earlier simulated sign-in used; removed so it can't linger in browsers. */
const LEGACY_STORAGE_KEY = "veiklu-erdve:role";

let signedIn = false;
let ready = false;
/** The signed-in organiser, or null. Kept as one object so hooks get a stable snapshot. */
let user: AuthUser | null = null;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage disabled: nothing to clean up.
  }
  // Fires once with the stored session (INITIAL_SESSION), then on every sign-in/out.
  supabase.auth.onAuthStateChange((_event, session) => {
    const next = toAuthUser(session?.user);
    if (ready && next?.id === user?.id && next?.name === user?.name) return;
    user = next;
    signedIn = next !== null;
    ready = true;
    emit();
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface AuthUser {
  id: string;
  /** Name given at registration or by Google; "" when unknown. */
  name: string;
}

function toAuthUser(
  raw: { id?: string; user_metadata?: Record<string, unknown> } | null | undefined,
): AuthUser | null {
  if (!raw?.id) return null;
  const meta = raw.user_metadata ?? {};
  const name = [meta["full_name"], meta["name"]].find((v) => typeof v === "string") as
    string | undefined;
  return { id: raw.id, name: name?.trim() ?? "" };
}

/** The signed-in organiser (id and name), or null. Null during server rendering. */
export function useAuthUser(): AuthUser | null {
  return useSyncExternalStore(
    subscribe,
    () => user,
    () => null,
  );
}

/** The signed-in organiser's id for code outside React, e.g. the data stores. */
export function currentUserId(): string | null {
  start();
  return user?.id ?? null;
}

/** True for a signed-in organiser. Always false during server rendering. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => signedIn,
    () => false,
  );
}

/**
 * False until the stored session has been read, so pages can wait instead of flashing
 * the "please sign in" state at an organiser who is already signed in.
 */
export function useAuthReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

export interface AuthResult {
  /** Lithuanian message to show the organiser, or undefined on success. */
  error?: string;
  /** True when the browser is leaving for Google and will come back signed in. */
  redirected?: boolean;
}

export type SignInMethod = { provider: "google" } | { email: string; password: string };

/** Turns an auth error into a message an organiser understands. */
export function authErrorMessage(
  error: { message?: string | undefined; code?: string | undefined } | null,
): string {
  const text = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (text.includes("invalid_credentials") || text.includes("invalid login"))
    return "Neteisingas el. paštas arba slaptažodis.";
  if (text.includes("email_not_confirmed") || text.includes("not confirmed"))
    return "Pirmiausia patvirtinkite el. paštą: paspauskite nuorodą laiške, kurį jums atsiuntėme.";
  if (text.includes("user_already_exists") || text.includes("already registered"))
    return "Paskyra su šiuo el. paštu jau yra. Prisijunkite.";
  if (text.includes("weak_password") || text.includes("password should"))
    return "Slaptažodis per silpnas. Naudokite bent 8 simbolius.";
  if (text.includes("email_address_invalid") || text.includes("email address is not allowed"))
    return "Šis el. pašto adresas netinka. Patikrinkite, ar jis įvestas teisingai.";
  if (text.includes("rate limit") || text.includes("over_email_send_rate_limit"))
    return "Per daug bandymų. Palaukite kelias minutes ir bandykite dar kartą.";
  return "Nepavyko prisijungti. Bandykite dar kartą.";
}

/**
 * Signs the organiser in with Google or with email and password. For Google, the browser
 * may leave the page and come back signed in at `returnTo`.
 */
export async function signIn(method: SignInMethod, returnTo = "/ideti"): Promise<AuthResult> {
  if ("provider" in method) {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${returnTo}`,
    });
    if (result.error) return { error: "Nepavyko prisijungti su Google. Bandykite dar kartą." };
    return { redirected: "redirected" in result && Boolean(result.redirected) };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: method.email.trim(),
    password: method.password,
  });
  return error ? { error: authErrorMessage(error) } : {};
}

/**
 * Creates an organiser account. `needsConfirmation` is true when the organiser must first
 * click the link in the confirmation email; they are not signed in until then.
 */
export async function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult & { needsConfirmation?: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/ideti`,
      data: { full_name: input.name.trim() },
    },
  });
  if (error) return { error: authErrorMessage(error) };
  // An existing, confirmed address comes back with no identities instead of an error.
  if (data.user && data.user.identities?.length === 0)
    return { error: authErrorMessage({ code: "user_already_exists" }) };
  return { needsConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
