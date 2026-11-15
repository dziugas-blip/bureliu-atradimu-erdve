import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/listings";
import { ListingCard } from "./ListingCard";

export function ListingsGrid({ listings, onReset }: { listings: Listing[]; onReset: () => void }) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <SearchX className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold">Veiklų nerasta</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Pabandykite pakeisti filtrus arba paieškos žodį. Kituose miestuose veiklų dar tik daugėja.
        </p>
        <Button variant="outline" className="mt-5" onClick={onReset}>
          Išvalyti filtrus
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
