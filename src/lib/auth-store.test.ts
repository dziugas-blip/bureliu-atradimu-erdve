import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

type AuthCallback = (event: string, session: object | null) => void;
const auth = vi.hoisted(() => ({
  callback: undefined as undefined | ((event: string, session: object | null) => void),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: AuthCallback) => {
        auth.callback = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: auth.signInWithPassword,
      signUp: auth.signUp,
      signOut: auth.signOut,
    },
  },
}));
vi.mock("@/integrations/lovable", () => ({ lovable: { auth: { signInWithOAuth: vi.fn() } } }));

import { signIn, signUp, useAuthReady, useSignedIn } from "./auth-store";

beforeEach(() => {
  auth.signInWithPassword.mockReset();
  auth.signUp.mockReset();
});

describe("organiser sign-in", () => {
  it("follows the real session instead of the old simulated localStorage flag", () => {
    window.localStorage.setItem("veiklu-erdve:role", "vadovas");
    const signedIn = renderHook(() => useSignedIn());
    const ready = renderHook(() => useAuthReady());

    // The old flag alone does not sign anyone in, and is cleaned up.
    expect(signedIn.result.current).toBe(false);
    expect(window.localStorage.getItem("veiklu-erdve:role")).toBeNull();

    act(() => auth.callback?.("INITIAL_SESSION", null));
    expect(ready.result.current).toBe(true);
    expect(signedIn.result.current).toBe(false);

    act(() => auth.callback?.("SIGNED_IN", { user: { id: "u1" } }));
    expect(signedIn.result.current).toBe(true);

    act(() => auth.callback?.("SIGNED_OUT", null));
    expect(signedIn.result.current).toBe(false);
  });

  it("explains a wrong password in Lithuanian", async () => {
    auth.signInWithPassword.mockResolvedValue({
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    });
    const result = await signIn({ email: "a@b.lt", password: "blogas" });
    expect(result.error).toBe("Neteisingas el. paštas arba slaptažodis.");
  });

  it("does not treat a new account as signed in until the email is confirmed", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { id: "u1", identities: [{}] }, session: null },
      error: null,
    });
    const result = await signUp({ name: "Rūta", email: "ruta@b.lt", password: "slaptazodis" });
    expect(result).toEqual({ needsConfirmation: true });
  });

  it("reports an already registered email instead of pretending to sign up", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { id: "u1", identities: [] }, session: null },
      error: null,
    });
    const result = await signUp({ name: "Rūta", email: "ruta@b.lt", password: "slaptazodis" });
    expect(result.error).toBe("Paskyra su šiuo el. paštu jau yra. Prisijunkite.");
  });
});
