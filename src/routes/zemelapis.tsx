import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListingsMap, type MapItem } from "@/components/site/ListingsMap";
import { formatPrice } from "@/lib/listings";
import { useListings } from "@/lib/listings-store";
import { formatPlace, mapPointOf } from "@/lib/places";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zemelapis")({
  head: () => ({
    meta: [
      { title: "Veiklų žemėlapis – Veiklų Erdvė" },
      {
        name: "description",
        content:
          "Veiklos vaikams ir suaugusiems Lietuvos žemėlapyje: raskite, kas vyksta arti jūsų.",
      },
      { property: "og:title", content: "Veiklų žemėlapis – Veiklų Erdvė" },
      {
        property: "og:description",
        content: "Veiklos vaikams ir suaugusiems Lietuvos žemėlapyje.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const listings = useListings();
  const [activeId, setActiveId] = useState<string | null>(null);

  const items = useMemo<MapItem[]>(
    () =>
      listings.flatMap((l) => {
        const point = mapPointOf(l);
        if (!point) return [];
        return [
          {
            id: l.id,
            title: l.title,
            subtitle: `${l.category} · ${formatPlace(l)}`,
            price: formatPrice(l.price),
            ...point,
          },
        ];
      }),
    [listings],
  );
  const hidden = listings.length - items.length;

  return (
    <div className="container-page pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Veiklų žemėlapis</h1>
      <p className="mt-2 text-muted-foreground">
        Žemėlapyje veiklų: <strong className="text-foreground">{items.length}</strong>
        {hidden > 0 && ` (dar ${hidden} be žinomos vietos)`}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
        <ul className="order-2 max-h-[70vh] space-y-2 overflow-y-auto pr-1 lg:order-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                aria-pressed={activeId === item.id}
                className={cn(
                  "w-full cursor-pointer rounded-xl border bg-card p-3 text-left outline-none transition-colors hover:border-foreground/60 focus-visible:ring-2 focus-visible:ring-ring",
                  activeId === item.id && "border-primary bg-primary-soft",
                )}
              >
                <span className="block font-bold">{item.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{item.subtitle}</span>
                <span className="mt-1 block text-sm font-semibold">{item.price} / mėn.</span>
              </button>
            </li>
          ))}
        </ul>
        <ListingsMap
          items={items}
          activeId={activeId}
          className="order-1 h-[60vh] overflow-hidden rounded-2xl border lg:order-2 lg:h-[70vh]"
        />
      </div>
    </div>
  );
}
