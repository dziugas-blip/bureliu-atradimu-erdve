import { describe, expect, it } from "vitest";
import { SAMPLE_LISTINGS } from "@/test/fixtures/sample-listings";
import { DEFAULT_FILTERS, filterListings, normalizeWebsite } from "./listings";
import { ALL_PLACES, districtsOf, formatPlace } from "./places";
import { organizerIdOf } from "./profile-store";

const run = (patch: Partial<typeof DEFAULT_FILTERS>) =>
  filterListings(SAMPLE_LISTINGS, { ...DEFAULT_FILTERS, ...patch }).map((l) => l.id);

describe("filterListings", () => {
  it("shows all 8 sample listings with no filters", () => {
    expect(run({})).toHaveLength(8);
  });

  it("'Berniukams' keeps boys-only and unisex clubs but hides girls-only ones", () => {
    const ids = run({ gender: "Berniukams" });
    expect(ids).toContain("futbolo-mokykla-pilaites-zaibas");
    expect(ids).toContain("robotikos-klubas-robolab");
    expect(ids).not.toContain("baleto-studija-piruetas");
  });

  it("filters by district", () => {
    expect(run({ district: "Žvėrynas" })).toEqual(["baleto-studija-piruetas"]);
  });

  it("filters by age group", () => {
    expect(run({ age: "3-5 m." }).sort()).toEqual(
      ["baleto-studija-piruetas", "tapybos-studija-spalvu-sodas"].sort(),
    );
  });

  it("filters by audience 'Suaugusiems'", () => {
    expect(run({ audience: "Suaugusiems" })).toHaveLength(2);
  });

  it("returns nothing for a city with no listings", () => {
    expect(run({ city: "Kaunas" })).toEqual([]);
  });

  it("search ignores Lithuanian diacritics", () => {
    expect(run({ q: "zaibas" })).toEqual(["futbolo-mokykla-pilaites-zaibas"]);
  });

  it("every sample listing uses a known place and district", () => {
    for (const l of SAMPLE_LISTINGS) {
      expect(ALL_PLACES).toContain(l.city);
      expect(districtsOf(l.city)).toContain(l.district);
    }
  });

  it("place names are unique, so each one can be picked unambiguously", () => {
    expect(new Set(ALL_PLACES).size).toBe(ALL_PLACES.length);
  });

  it("formats a place without a microdistrict as just the town", () => {
    expect(formatPlace({ city: "Kernavė", district: "" })).toBe("Kernavė");
    expect(formatPlace({ city: "Vilnius", district: "Žvėrynas" })).toBe("Žvėrynas, Vilnius");
  });

  it("accepts a social link typed without https and rejects unsafe or non-web values", () => {
    expect(normalizeWebsite("facebook.com/klubas")).toBe("https://facebook.com/klubas");
    expect(normalizeWebsite(" https://www.instagram.com/klubas/ ")).toBe(
      "https://www.instagram.com/klubas/",
    );
    expect(normalizeWebsite("javascript:alert(1)")).toBeNull();
    expect(normalizeWebsite("tiesiog tekstas")).toBeNull();
    expect(normalizeWebsite("")).toBeNull();
  });

  it("groups a sample organiser's listings under one id derived from their name", () => {
    expect(organizerIdOf({ contactName: "Rūta Kazlauskienė" })).toBe("ruta-kazlauskiene");
    expect(organizerIdOf({ contactName: "Rūta Kazlauskienė", organizerId: "mano-profilis" })).toBe(
      "mano-profilis",
    );
  });

  it("combines filters", () => {
    expect(run({ category: "Sportas", age: "6-9 m." })).toEqual([
      "futbolo-mokykla-pilaites-zaibas",
    ]);
  });
});
