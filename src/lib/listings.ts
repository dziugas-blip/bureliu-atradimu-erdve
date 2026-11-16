import robotics from "@/assets/listing-robotics.jpg";
import painting from "@/assets/listing-painting.jpg";
import guitar from "@/assets/listing-guitar.jpg";
import english from "@/assets/listing-english.jpg";
import contemporary from "@/assets/listing-contemporary.jpg";
import football from "@/assets/listing-football.jpg";

export const AUDIENCES = ["Vaikams", "Suaugusiems"] as const;
export const AGE_GROUPS = ["3-5 m.", "6-9 m.", "10-13 m.", "14-18 m.", "Suaugusiems"] as const;
export const GENDERS = ["Berniukams", "Mergaitėms"] as const;
export const CATEGORIES = [
  "Šokiai",
  "Sportas",
  "Menai",
  "IT ir robotika",
  "Muzika",
  "Kalbos",
] as const;

/** Extras an organiser can tick. `short` is the badge text on listing cards. */
export const PERKS = [
  { id: "nvs", label: "Taikomas NVŠ krepšelis", short: "NVŠ krepšelis" },
  { id: "trial", label: "Pirmas bandomasis užsiėmimas nemokamai", short: "Bandomasis nemokamai" },
] as const;
export type PerkId = (typeof PERKS)[number]["id"];

/**
 * Turns what an organiser typed ("facebook.com/klubas") into a safe link, or null if it is not
 * a web address. Only http(s) is allowed, so a "javascript:" value can never become a link.
 */
export function normalizeWebsite(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const isWeb = url.protocol === "http:" || url.protocol === "https:";
    return isWeb && url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/** A city, town or village name from `places.ts`. */
export type City = string;
export type Category = (typeof CATEGORIES)[number];
export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Audience = (typeof AUDIENCES)[number] | "Visiems";
export type Gender = (typeof GENDERS)[number] | "Visiems";

export interface ScheduleSlot {
  day: string;
  time: string;
}

export interface Listing {
  id: string;
  title: string;
  city: City;
  /** Microdistrict. Empty when the place has none. */
  district: string;
  address: string;
  /** Map position. Sample listings carry approximate coordinates; user-added ones have none. */
  lat?: number;
  lng?: number;
  category: Category;
  audience: Audience;
  ages: AgeGroup[];
  gender: Gender;
  price: number;
  shortDescription: string;
  description: string;
  schedule: ScheduleSlot[];
  /** No fixed timetable: times are agreed with each participant. */
  scheduleFlexible?: boolean;
  /** Set on listings added by a signed-in organiser. See `organizerIdOf`. */
  organizerId?: string;
  contactName: string;
  phone: string;
  email: string;
  perks?: PerkId[];
  /** Website or social profile, already normalised to an http(s) URL. */
  website?: string;
  image?: string;
  /** Photos uploaded by the owner, as data URLs. The first one is the cover. */
  photos?: string[];
  /** True for listings stored in the database, false/absent for the built-in samples. */
  userSubmitted?: boolean;
  /** When the listing was published (ISO timestamp); drives the "Nauja" badge. */
  createdAt?: string;
}

export const ALL = "all";

export interface Filters {
  q: string;
  city: string;
  district: string;
  audience: string;
  age: string;
  gender: string;
  category: string;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  city: ALL,
  district: ALL,
  audience: ALL,
  age: ALL,
  gender: ALL,
  category: ALL,
};

export const CATEGORY_IMAGES: Record<Category, string> = {
  Šokiai: contemporary,
  Sportas: football,
  Menai: painting,
  "IT ir robotika": robotics,
  Muzika: guitar,
  Kalbos: english,
};

export function listingImage(listing: Listing): string {
  return listing.photos?.[0] ?? listing.image ?? CATEGORY_IMAGES[listing.category];
}

/** Lowercase and strip Lithuanian diacritics so "sokiai" finds "Šokiai". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterListings(listings: Listing[], filters: Filters): Listing[] {
  const query = normalizeText(filters.q.trim());

  return listings.filter((l) => {
    if (query) {
      const haystack = normalizeText(
        [l.title, l.shortDescription, l.description, l.category, l.district, l.city].join(" "),
      );
      if (!haystack.includes(query)) return false;
    }
    if (filters.city !== ALL && l.city !== filters.city) return false;
    if (filters.district !== ALL && l.district !== filters.district) return false;
    if (filters.audience !== ALL && l.audience !== "Visiems" && l.audience !== filters.audience)
      return false;
    if (filters.age !== ALL && !l.ages.includes(filters.age as AgeGroup)) return false;
    if (filters.gender !== ALL && l.gender !== "Visiems" && l.gender !== filters.gender)
      return false;
    if (filters.category !== ALL && l.category !== filters.category) return false;
    return true;
  });
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 0 }).format(price)} €`;
}
