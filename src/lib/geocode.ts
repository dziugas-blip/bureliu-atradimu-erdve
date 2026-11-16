export interface Coordinates {
  lat: number;
  lng: number;
}

/** Rough bounding box of Lithuania, used to reject a match in the wrong country. */
const LITHUANIA = { south: 53.8, north: 56.5, west: 20.9, east: 26.9 };

/**
 * Reads the first usable match out of a Nominatim search response. Returns null for
 * anything unexpected: no results, malformed numbers, or a point outside Lithuania.
 */
export function pickCoordinates(response: unknown): Coordinates | null {
  if (!Array.isArray(response)) return null;
  for (const item of response) {
    if (!item || typeof item !== "object") continue;
    const { lat, lon } = item as { lat?: unknown; lon?: unknown };
    const point = { lat: Number(lat), lng: Number(lon) };
    const inside =
      point.lat >= LITHUANIA.south &&
      point.lat <= LITHUANIA.north &&
      point.lng >= LITHUANIA.west &&
      point.lng <= LITHUANIA.east;
    if (lat != null && lon != null && inside) return point;
  }
  return null;
}

/**
 * Looks up where an address is, so the activity can be pinned on the map. Uses the public
 * OpenStreetMap Nominatim service: fine for the occasional lookup when a listing is saved,
 * but not meant for bulk use (their policy allows at most one request per second).
 * Resolves to null when the address is not found or the service does not answer in time.
 */
export async function geocodeAddress(address: string, city: string): Promise<Coordinates | null> {
  // The city is often already part of the address; repeating it does no harm to the search.
  const query = address.toLowerCase().includes(city.toLowerCase())
    ? address
    : `${address}, ${city}`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: `${query}, Lietuva`,
    format: "jsonv2",
    limit: "3",
    countrycodes: "lt",
  }).toString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return pickCoordinates(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
