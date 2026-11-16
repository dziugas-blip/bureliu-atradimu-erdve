import { describe, expect, it } from "vitest";
import { pickCoordinates } from "./geocode";

describe("pickCoordinates", () => {
  it("reads the first match, whose numbers arrive as strings", () => {
    expect(pickCoordinates([{ lat: "54.6872", lon: "25.2797" }])).toEqual({
      lat: 54.6872,
      lng: 25.2797,
    });
  });

  it("skips a match outside Lithuania and takes the next one", () => {
    expect(
      pickCoordinates([
        { lat: "52.52", lon: "13.40" },
        { lat: "54.8985", lon: "23.9036" },
      ]),
    ).toEqual({ lat: 54.8985, lng: 23.9036 });
  });

  it("gives null when nothing was found or the response is not what we expect", () => {
    expect(pickCoordinates([])).toBeNull();
    expect(pickCoordinates({ error: "Unable to geocode" })).toBeNull();
    expect(pickCoordinates([{ lat: "abc", lon: "25.2" }, {}])).toBeNull();
  });
});
