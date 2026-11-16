import { describe, expect, it } from "vitest";
import { isNewListing, listingToRow, rowToListing, type ListingRow } from "./listings-db";
import { SAMPLE_LISTINGS } from "@/test/fixtures/sample-listings";

const row: ListingRow = {
  id: "0b6d6a3e-1f0c-4d9a-9d9b-2a7c1e5f7a10",
  organizer_id: "6f1c2b9e-8a3d-4c55-b1e2-0d9f7a6c4b31",
  created_at: "2026-11-10T10:00:00Z",
  updated_at: "2026-11-10T10:00:00Z",
  title: "Krepšinio treniruotės „Šuolis“",
  city: "Vilnius",
  district: "Antakalnis",
  address: "Antakalnio g. 1, Vilnius",
  lat: 54.7,
  lng: 25.3,
  category: "Sportas",
  audience: "Vaikams",
  ages: ["6-9 m.", "10-13 m."],
  gender: "Visiems",
  price: 40,
  short_description: "Treniruotės vaikams.",
  description: "Treniruotės vaikams nuo 6 metų, daug dėmesio technikai.",
  schedule: [{ day: "Pirmadienis", time: "17:00 – 18:00" }],
  schedule_flexible: false,
  perks: ["nvs"],
  website: "https://facebook.com/suolis",
  contact_name: "Tomas Petrauskas",
  phone: "+370 600 00000",
  email: "tomas@example.com",
  photos: ["https://x.supabase.co/storage/v1/object/public/photos/u/a.jpg"],
};

describe("listing rows", () => {
  it("turns a database row into a listing owned by its organiser", () => {
    const listing = rowToListing(row);
    expect(listing.id).toBe(row.id);
    expect(listing.organizerId).toBe(row.organizer_id);
    expect(listing.contactName).toBe("Tomas Petrauskas");
    expect(listing.lat).toBe(54.7);
    expect(listing.perks).toEqual(["nvs"]);
    expect(listing.schedule).toEqual([{ day: "Pirmadienis", time: "17:00 – 18:00" }]);
  });

  it("writes back the same columns it reads, without the owner id", () => {
    const {
      id: _id,
      organizerId: _o,
      userSubmitted: _u,
      createdAt: _c,
      ...data
    } = rowToListing(row);
    const written = listingToRow(data);
    expect(written).not.toHaveProperty("organizer_id");
    const { id: _rid, organizer_id: _ro, created_at: _rc, updated_at: _ru, ...columns } = row;
    expect(written).toEqual(columns);
  });

  it("survives values edited by hand in the database", () => {
    const listing = rowToListing({
      ...row,
      category: "Nežinoma",
      ages: ["6-9 m.", "99 m."],
      perks: ["nvs", "senas-privalumas"],
      schedule: [{ day: "Pirmadienis" }, "tekstas", { day: "Antradienis", time: "18:00 – 19:00" }],
      lat: null,
      website: null,
      photos: [],
    });
    expect(listing.category).toBe("Sportas");
    expect(listing.ages).toEqual(["6-9 m."]);
    expect(listing.perks).toEqual(["nvs"]);
    expect(listing.schedule).toEqual([{ day: "Antradienis", time: "18:00 – 19:00" }]);
    expect(listing).not.toHaveProperty("lat");
    expect(listing).not.toHaveProperty("website");
    expect(listing).not.toHaveProperty("photos");
  });

  it("marks a listing as new for two weeks after it is published", () => {
    const now = new Date("2026-11-16T10:00:00Z").getTime();
    expect(isNewListing({ createdAt: "2026-11-10T10:00:00Z" }, now)).toBe(true);
    expect(isNewListing({ createdAt: "2026-10-01T10:00:00Z" }, now)).toBe(false);
    // The built-in samples have no publish date, so never carry the badge.
    expect(isNewListing(SAMPLE_LISTINGS[0]!, now)).toBe(false);
  });
});
