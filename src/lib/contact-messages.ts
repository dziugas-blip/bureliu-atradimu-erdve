import { z } from "zod";

/**
 * Rules shared by the activity inquiry form and the help form. The server checks them
 * again before anything is sent, so a hand-crafted request cannot get around them.
 */

/** Anything that looks like an HTML tag, e.g. `<a`, `</p`, `<!--`, `<?php`. "a < b" or "<3" pass. */
const HTML_TAG = /<\s*[a-z!/?]/i;
const noHtml = (value: string) => !HTML_TAG.test(value);
const NO_HTML = "Nenaudokite HTML žymų.";

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
export const NAME_MAX = 100;

/** Name of the hidden field people never see; only bots fill it in. */
export const HONEYPOT_FIELD = "company";

const name = z
  .string()
  .trim()
  .min(2, "Įveskite vardą")
  .max(NAME_MAX, "Per ilgas vardas")
  .refine(noHtml, NO_HTML);
const email = z.string().trim().email("Neteisingas el. pašto adresas").max(255);
const message = z
  .string()
  .trim()
  .min(MESSAGE_MIN, "Žinutė per trumpa")
  .max(MESSAGE_MAX, "Žinutė per ilga")
  .refine(noHtml, NO_HTML);
const honeypot = z.string().max(500).optional();

export const inquirySchema = z.object({
  listingId: z.string().trim().min(1).max(100),
  name,
  email,
  phone: z
    .string()
    .trim()
    .max(30, "Per ilgas numeris")
    .regex(/^[+\d\s()-]*$/, "Neteisingas telefono numeris")
    .optional()
    .default(""),
  message,
  [HONEYPOT_FIELD]: honeypot,
});

export const helpSchema = z.object({
  name,
  email,
  message,
  [HONEYPOT_FIELD]: honeypot,
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type HelpInput = z.input<typeof helpSchema>;

/** True when the hidden field was filled in, i.e. the sender is almost certainly a bot. */
export function isBot(input: Record<string, unknown>): boolean {
  const value = input[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim() !== "";
}

/** At most this many messages per sender (IP address) in any rolling hour. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;

export function isRateLimited(recentCount: number): boolean {
  return recentCount >= RATE_LIMIT;
}
