import type { Database, Json } from "@/integrations/supabase/types";
import {
  AGE_GROUPS,
  CATEGORIES,
  PERKS,
  type AgeGroup,
  type Audience,
  type Category,
  type Gender,
  type Listing,
  type PerkId,
  type ScheduleSlot,
} from "./listings";

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

/** What an organiser fills in; the database assigns the rest. */
export type ListingData = Omit<Listing, "id" | "userSubmitted" | "createdAt" | "organizerId">;

const AUDIENCES: readonly Audience[] = ["Vaikams", "Suaugusiems", "Visiems"];
const GENDERS: readonly Gender[] = ["Berniukams", "Mergaitėms", "Visiems"];

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Keep only well-formed { day, time } rows; anything else in the column is ignored. */
function scheduleOf(value: Json): ScheduleSlot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((slot) => {
    if (!slot || typeof slot !== "object" || Array.isArray(slot)) return [];
    const { day, time } = slot as Record<string, Json | undefined>;
    return typeof day === "string" && typeof time === "string" ? [{ day, time }] : [];
  });
}

/**
 * Turns a database row into the app's listing shape. Values that are not one of the
 * known options (e.g. a category edited by hand in the database) fall back to a safe
 * default instead of breaking the page.
 */
export function rowToListing(row: ListingRow): Listing {
  const knownPerks = PERKS.map((p) => p.id) as readonly string[];
  return {
    id: row.id,
    organizerId: row.organizer_id,
    userSubmitted: true,
    createdAt: row.created_at,
    title: row.title,
    city: row.city,
    district: row.district,
    address: row.address,
    ...(row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : {}),
    category: oneOf<Category>(row.category, CATEGORIES, "Sportas"),
    audience: oneOf(row.audience, AUDIENCES, "Visiems"),
    ages: row.ages.filter((a): a is AgeGroup => (AGE_GROUPS as readonly string[]).includes(a)),
    gender: oneOf(row.gender, GENDERS, "Visiems"),
    price: Number(row.price) || 0,
    shortDescription: row.short_description,
    description: row.description,
    schedule: scheduleOf(row.schedule),
    ...(row.schedule_flexible ? { scheduleFlexible: true } : {}),
    perks: row.perks.filter((p): p is PerkId => knownPerks.includes(p)),
    ...(row.website ? { website: row.website } : {}),
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    ...(row.photos.length > 0 ? { photos: row.photos } : {}),
  };
}

/**
 * The columns an organiser controls. `organizer_id` is left out on purpose: the database
 * fills it with the signed-in user's id, so nobody can save a listing under someone else.
 */
export function listingToRow(data: ListingData): Omit<ListingInsert, "organizer_id"> {
  return {
    title: data.title,
    city: data.city,
    district: data.district,
    address: data.address,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    category: data.category,
    audience: data.audience,
    ages: data.ages,
    gender: data.gender,
    price: data.price,
    short_description: data.shortDescription,
    description: data.description,
    schedule: data.schedule.map((s) => ({ day: s.day, time: s.time })),
    schedule_flexible: data.scheduleFlexible ?? false,
    perks: data.perks ?? [],
    website: data.website ?? null,
    contact_name: data.contactName,
    phone: data.phone,
    email: data.email,
    photos: data.photos ?? [],
  };
}

/** How long a newly added listing carries the "Nauja" badge. */
const NEW_FOR_MS = 14 * 24 * 60 * 60 * 1000;

export function isNewListing(listing: Pick<Listing, "createdAt">, now = Date.now()): boolean {
  if (!listing.createdAt) return false;
  const age = now - new Date(listing.createdAt).getTime();
  return age >= 0 && age < NEW_FOR_MS;
}
