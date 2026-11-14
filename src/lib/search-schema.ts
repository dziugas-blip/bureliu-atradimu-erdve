import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ALL } from "./listings";

export const filtersSearchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  city: fallback(z.string(), ALL).default(ALL),
  district: fallback(z.string(), ALL).default(ALL),
  audience: fallback(z.string(), ALL).default(ALL),
  age: fallback(z.string(), ALL).default(ALL),
  gender: fallback(z.string(), ALL).default(ALL),
  category: fallback(z.string(), ALL).default(ALL),
});
