import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listingToRow, rowToListing, type ListingData } from "./listings-db";
import { SAMPLE_LISTINGS, type Listing } from "./listings";
import { deletePhotos } from "./photo-upload";

/**
 * Activities from the database, shown before the built-in sample listings. Everyone can
 * read them; only the signed-in organiser who owns a listing can change or delete it
 * (enforced by the database's row level security, not just here).
 */
let dbListings: Listing[] = [];
let combined: Listing[] = SAMPLE_LISTINGS;
let status: "idle" | "loading" | "ready" = "idle";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function setListings(next: Listing[]) {
  dbListings = next;
  combined = [...dbListings, ...SAMPLE_LISTINGS];
  emit();
}

async function load() {
  status = "loading";
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    // The samples still show; a reload tries again.
    console.error("[listings] could not load", error);
  } else {
    dbListings = data.map(rowToListing);
    combined = [...dbListings, ...SAMPLE_LISTINGS];
  }
  status = "ready";
  emit();
}

function subscribe(listener: () => void) {
  if (status === "idle" && typeof window !== "undefined") void load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useListings(): Listing[] {
  return useSyncExternalStore(
    subscribe,
    () => combined,
    () => SAMPLE_LISTINGS,
  );
}

/**
 * False until the first load from the database has finished, so a page can wait instead
 * of saying "not found" for a listing that is still on its way.
 */
export function useListingsReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => status === "ready",
    () => false,
  );
}

export type SaveResult = { listing: Listing; error?: undefined } | { error: string };

function saveError(error: { code?: string; message?: string }): string {
  console.error("[listings] could not save", error);
  if (error.code === "42501" || /row-level security/i.test(error.message ?? "")) {
    return "Neturite teisės keisti šios veiklos. Prisijunkite iš naujo ir bandykite dar kartą.";
  }
  if (error.code === "PGRST116") return "Šios veiklos nebėra.";
  return "Nepavyko išsaugoti. Patikrinkite interneto ryšį ir bandykite dar kartą.";
}

/** Publishes a new activity under the signed-in organiser. */
export async function addListing(data: ListingData): Promise<SaveResult> {
  const { data: row, error } = await supabase
    .from("listings")
    .insert(listingToRow(data))
    .select()
    .single();
  if (error) return { error: saveError(error) };
  const listing = rowToListing(row);
  setListings([listing, ...dbListings]);
  return { listing };
}

/** Saves changes to one of the signed-in organiser's own activities. */
export async function updateListing(id: string, data: ListingData): Promise<SaveResult> {
  const { data: row, error } = await supabase
    .from("listings")
    .update(listingToRow(data))
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: saveError(error) };
  const listing = rowToListing(row);
  const before = dbListings.find((l) => l.id === id);
  setListings(dbListings.map((l) => (l.id === id ? listing : l)));
  // Photos taken off the listing are no longer shown anywhere.
  const kept = new Set(listing.photos ?? []);
  void deletePhotos((before?.photos ?? []).filter((url) => !kept.has(url)));
  return { listing };
}

/** Deletes one of the signed-in organiser's own activities, and its photos. */
export async function deleteListing(id: string): Promise<{ error?: string }> {
  const before = dbListings.find((l) => l.id === id);
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { error: saveError(error) };
  setListings(dbListings.filter((l) => l.id !== id));
  void deletePhotos(before?.photos ?? []);
  return {};
}

const noopSubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
