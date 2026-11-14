import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, SAMPLE_LISTINGS, filterListings } from "./listings";

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

  it("combines filters", () => {
    expect(run({ category: "Sportas", age: "6-9 m." })).toEqual([
      "futbolo-mokykla-pilaites-zaibas",
    ]);
  });
});
