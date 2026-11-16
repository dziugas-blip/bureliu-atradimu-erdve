import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("./auth-store", () => ({ currentUserId: () => null }));

import { photoPath } from "./photo-upload";

describe("photoPath", () => {
  it("finds the file inside the photos bucket from its public URL", () => {
    expect(
      photoPath("https://abc.supabase.co/storage/v1/object/public/photos/6f1c2b9e/a%20b.jpg?t=1"),
    ).toBe("6f1c2b9e/a b.jpg");
  });

  it("ignores URLs that are not our stored photos, such as the built-in images", () => {
    expect(photoPath("/assets/listing-ballet.jpg")).toBeNull();
    expect(photoPath("https://example.com/photos/x.jpg")).toBeNull();
  });
});
