import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ListingCard } from "@/components/site/ListingCard";
import { Button } from "@/components/ui/button";
import { clearFavorites, useFavorites } from "@/lib/favorites-store";
import { useListings } from "@/lib/listings-store";

export const Route = createFileRoute("/megstami")({
  head: () => ({
    meta: [
      { title: "Mano mėgstamos veiklos – Veiklų Pasaulis" },
      { name: "description", content: "Jūsų išsaugotos veiklos vienoje vietoje." },
      { property: "og:title", content: "Mano mėgstamos veiklos – Veiklų Pasaulis" },
      { property: "og:description", content: "Jūsų išsaugotos veiklos vienoje vietoje." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const favoriteIds = useFavorites();
  const listings = useListings();
  // Keep the order in which they were saved; skip listings that no longer exist.
  const saved = favoriteIds.flatMap((id) => listings.find((l) => l.id === id) ?? []);

  return (
    <div className="container-page pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Mano mėgstamos veiklos</h1>
          <p className="mt-2 text-muted-foreground">
            Išsaugota veiklų: <strong className="text-foreground">{saved.length}</strong>
          </p>
        </div>
        {saved.length > 0 && (
          <Button variant="outline" onClick={clearFavorites}>
            Išvalyti sąrašą
          </Button>
        )}
      </div>

      {saved.length > 0 ? (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saved.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-bold">Dar nieko neišsaugojote</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Paspauskite širdutę ant veiklos kortelės, ir ji atsiras čia. Sąrašas saugomas šioje
            naršyklėje.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/bureliai" search={{}}>
              Žiūrėti visas veiklas
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
