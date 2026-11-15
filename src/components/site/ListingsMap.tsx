import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MapItem {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  lat: number;
  lng: number;
  approximate: boolean;
}

interface ListingsMapProps {
  items: MapItem[];
  /** The listing to fly to and open, e.g. after a click in the side list. */
  activeId: string | null;
  className?: string;
}

const LITHUANIA_CENTRE: [number, number] = [55.17, 23.88];

const PIN_HTML =
  '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);' +
  "background:var(--primary);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)" +
  '"></div>';

/** Popup built from DOM nodes, so listing text typed by users is never parsed as HTML. */
function popupFor(item: MapItem): HTMLElement {
  const root = document.createElement("div");
  root.style.minWidth = "180px";

  const title = document.createElement("strong");
  title.textContent = item.title;
  title.style.display = "block";
  title.style.fontSize = "14px";

  const subtitle = document.createElement("div");
  subtitle.textContent = item.approximate ? `${item.subtitle} (apytikslė vieta)` : item.subtitle;
  subtitle.style.margin = "2px 0 6px";
  subtitle.style.opacity = "0.7";

  const price = document.createElement("div");
  price.textContent = `${item.price} / mėn.`;
  price.style.fontWeight = "700";

  const link = document.createElement("a");
  link.href = `/bureliai/${encodeURIComponent(item.id)}`;
  link.textContent = "Veiklos puslapis";
  link.style.display = "inline-block";
  link.style.marginTop = "6px";
  link.style.fontWeight = "600";

  root.append(title, subtitle, price, link);
  return root;
}

/** Leaflet map of listings. Leaflet needs `window`, so it is loaded only in the browser. */
export function ListingsMap({ items, activeId, className }: ListingsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;

    void import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current) return;

      let map = mapRef.current;
      if (!map) {
        map = L.map(containerRef.current).setView(LITHUANIA_CENTRE, 7);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
      }

      markers.forEach((m) => m.remove());
      markers.clear();
      const icon = L.divIcon({
        html: PIN_HTML,
        className: "",
        iconSize: [26, 26],
        iconAnchor: [13, 30],
        popupAnchor: [0, -28],
      });
      for (const item of items) {
        const marker = L.marker([item.lat, item.lng], { icon, title: item.title })
          .bindPopup(popupFor(item))
          .addTo(map);
        markers.set(item.id, marker);
      }
      if (items.length > 0) {
        map.fitBounds(L.latLngBounds(items.map((i) => [i.lat, i.lng])), {
          padding: [40, 40],
          maxZoom: 13,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = activeId ? markersRef.current.get(activeId) : undefined;
    if (!map || !marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.6 });
    marker.openPopup();
  }, [activeId]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  // `isolate` keeps Leaflet's high z-index panes below the sticky site header.
  return <div ref={containerRef} className={cn("isolate z-0", className)} />;
}
