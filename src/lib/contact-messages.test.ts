import { describe, expect, it } from "vitest";
import { helpSchema, inquirySchema, isBot, isRateLimited } from "./contact-messages";

const help = { name: "Ona", email: "ona@example.com", message: "Sveiki, turiu klausimą." };

describe("contact message rules", () => {
  it("accepts a name of 100 characters and rejects 101", () => {
    expect(helpSchema.safeParse({ ...help, name: "a".repeat(100) }).success).toBe(true);
    expect(helpSchema.safeParse({ ...help, name: "a".repeat(101) }).success).toBe(false);
  });

  it("requires a message of 10 to 2000 characters", () => {
    expect(helpSchema.safeParse({ ...help, message: "a".repeat(9) }).success).toBe(false);
    expect(helpSchema.safeParse({ ...help, message: "a".repeat(10) }).success).toBe(true);
    expect(helpSchema.safeParse({ ...help, message: "a".repeat(2000) }).success).toBe(true);
    expect(helpSchema.safeParse({ ...help, message: "a".repeat(2001) }).success).toBe(false);
  });

  it("rejects HTML in the message and the name", () => {
    expect(helpSchema.safeParse({ ...help, message: "Labas <a href=x>čia</a>" }).success).toBe(
      false,
    );
    expect(helpSchema.safeParse({ ...help, name: "<b>Ona</b>" }).success).toBe(false);
    expect(helpSchema.safeParse({ ...help, message: "Kaina 3 < 5 eurų, ačiū" }).success).toBe(
      true,
    );
  });

  it("makes the phone optional on activity inquiries", () => {
    const base = { ...help, listingId: "abc" };
    expect(inquirySchema.safeParse(base).success).toBe(true);
    expect(inquirySchema.safeParse({ ...base, phone: "+370 600 00000" }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...base, phone: "skambinkit" }).success).toBe(false);
  });

  it("treats a filled hidden field as a bot", () => {
    expect(isBot({ ...help, company: "" })).toBe(false);
    expect(isBot({ ...help, company: "Spam UAB" })).toBe(true);
  });

  it("allows 5 messages per hour and blocks the 6th", () => {
    expect(isRateLimited(4)).toBe(false);
    expect(isRateLimited(5)).toBe(true);
  });
});
