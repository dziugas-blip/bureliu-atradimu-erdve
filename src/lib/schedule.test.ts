import { describe, expect, it } from "vitest";
import { fromScheduleSlots, invalidDays, toScheduleSlots } from "./schedule";

describe("schedule", () => {
  it("lists days Monday first, whatever order they were ticked in", () => {
    expect(
      toScheduleSlots({
        Šeštadienis: { from: "10:00", to: "11:00" },
        Pirmadienis: { from: "17:00", to: "18:30" },
      }),
    ).toEqual([
      { day: "Pirmadienis", time: "17:00 – 18:30" },
      { day: "Šeštadienis", time: "10:00 – 11:00" },
    ]);
  });

  it("loads a saved schedule back into the form unchanged", () => {
    const week = {
      Pirmadienis: { from: "17:00", to: "18:30" },
      Šeštadienis: { from: "10:00", to: "11:00" },
    };
    expect(fromScheduleSlots(toScheduleSlots(week))).toEqual(week);
  });

  it("skips rows it cannot read, such as free text from older listings", () => {
    expect(fromScheduleSlots([{ day: "Pirmadienis", time: "—" }])).toEqual({});
  });

  it("gives no rows when no day is ticked", () => {
    expect(toScheduleSlots({})).toEqual([]);
  });

  it("flags a day that ends before it starts or has an empty time", () => {
    expect(
      invalidDays({
        Pirmadienis: { from: "18:00", to: "17:00" },
        Antradienis: { from: "17:00", to: "18:00" },
        Trečiadienis: { from: "", to: "18:00" },
      }),
    ).toEqual(["Pirmadienis", "Trečiadienis"]);
  });
});
