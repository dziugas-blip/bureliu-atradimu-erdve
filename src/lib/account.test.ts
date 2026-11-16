import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  invoke: vi.fn(),
  ownListings: [] as { id: string }[],
  files: [] as { name: string }[],
  remove: vi.fn(),
  deleteListing: vi.fn(),
  saveProfile: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: m.invoke },
    from: () => ({
      select: () => ({ eq: async () => ({ data: m.ownListings, error: null }) }),
    }),
    storage: {
      from: () => ({ list: async () => ({ data: m.files }), remove: m.remove }),
    },
  },
}));
vi.mock("./auth-store", () => ({ currentUserId: () => "user-1", signOut: m.signOut }));
vi.mock("./listings-store", () => ({ deleteListing: m.deleteListing }));
vi.mock("./profile-store", () => ({ saveProfile: m.saveProfile }));

import { deleteMyAccount } from "./account";

beforeEach(() => {
  vi.clearAllMocks();
  m.deleteListing.mockResolvedValue({});
  m.saveProfile.mockResolvedValue({});
});

describe("deleteMyAccount", () => {
  it("uses the server function when it exists, and signs out", async () => {
    m.invoke.mockResolvedValue({ error: null });
    expect(await deleteMyAccount()).toEqual({ loginDeleted: true });
    expect(m.deleteListing).not.toHaveBeenCalled();
    expect(m.signOut).toHaveBeenCalled();
  });

  it("without the server function, deletes listings, blanks the profile and clears photos", async () => {
    m.invoke.mockResolvedValue({ error: new Error("Function not found") });
    m.ownListings = [{ id: "a" }, { id: "b" }];
    m.files = [{ name: "x.jpg" }];
    expect(await deleteMyAccount()).toEqual({ loginDeleted: false });
    expect(m.deleteListing).toHaveBeenCalledWith("a");
    expect(m.deleteListing).toHaveBeenCalledWith("b");
    expect(m.saveProfile).toHaveBeenCalledWith({
      name: "",
      headline: "",
      age: "",
      bio: "",
      photo: "",
    });
    expect(m.remove).toHaveBeenCalledWith(["user-1/x.jpg"]);
    expect(m.signOut).toHaveBeenCalled();
  });

  it("stops and stays signed in when a listing cannot be deleted", async () => {
    m.invoke.mockResolvedValue({ error: new Error("Function not found") });
    m.ownListings = [{ id: "a" }];
    m.deleteListing.mockResolvedValue({ error: "nepavyko" });
    const result = await deleteMyAccount();
    expect(result.error).toBeDefined();
    expect(m.signOut).not.toHaveBeenCalled();
  });
});
