import { describe, expect, it } from "vitest";
import { fitWithin } from "./image-resize";

describe("fitWithin", () => {
  it("shrinks a landscape photo so its long side matches the limit", () => {
    expect(fitWithin(4000, 3000, 1000)).toEqual({ width: 1000, height: 750 });
  });

  it("shrinks a portrait photo by its height", () => {
    expect(fitWithin(3000, 4000, 1000)).toEqual({ width: 750, height: 1000 });
  });

  it("never enlarges a photo that is already small enough", () => {
    expect(fitWithin(640, 480, 1000)).toEqual({ width: 640, height: 480 });
  });
});
