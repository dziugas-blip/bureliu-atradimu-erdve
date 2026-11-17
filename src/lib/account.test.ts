import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
  userId: "user-1" as string | null,
}));

vi.mock("./account.functions", () => ({ deleteAccount: m.deleteAccount }));
vi.mock("./auth-store", () => ({ currentUserId: () => m.userId, signOut: m.signOut }));

import { deleteMyAccount } from "./account";

beforeEach(() => {
  vi.clearAllMocks();
  m.userId = "user-1";
});

describe("deleteMyAccount", () => {
  it("deletes everything on the server, then signs out", async () => {
    m.deleteAccount.mockResolvedValue({ ok: true });
    expect(await deleteMyAccount()).toEqual({ loginDeleted: true });
    expect(m.deleteAccount).toHaveBeenCalledTimes(1);
    expect(m.signOut).toHaveBeenCalled();
  });

  it("returns an error and stays signed in when the server stops part-way", async () => {
    m.deleteAccount.mockResolvedValue({ ok: false, step: "photos" });
    const result = await deleteMyAccount();
    expect(result.error).toBeDefined();
    expect(result.loginDeleted).toBeUndefined();
    expect(m.signOut).not.toHaveBeenCalled();
  });

  it("returns an error when the request fails", async () => {
    m.deleteAccount.mockRejectedValue(new Error("Unauthorized"));
    expect((await deleteMyAccount()).error).toBeDefined();
    expect(m.signOut).not.toHaveBeenCalled();
  });

  it("does nothing when nobody is signed in", async () => {
    m.userId = null;
    expect((await deleteMyAccount()).error).toBeDefined();
    expect(m.deleteAccount).not.toHaveBeenCalled();
  });
});
