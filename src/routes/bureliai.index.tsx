import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { FilterBar } from "@/components/site/FilterBar";
import { ListingsGrid } from "@/components/site/ListingsGrid";
import { DEFAULT_FILTERS, filterListings, type Filters } from "@/lib/listings";
import { useListings } from "@/lib/listings-store";
import { filtersSearchSchema } from "@/lib/search-schema";

export const Route = createFileRoute("/bureliai/")({
  validateSearch: zodValidator(filtersSearchSchema),
  head: () => ({
    meta: [
      { title: "Visos veiklos – Veiklų Pasaulis" },
      {
        name: "description",
        content:
          "Visos veiklos vaikams ir suaugusiems: filtruokite pagal miestą, mikrorajoną, amžių, lytį ir kategoriją.",
      },
      { property: "og:title", content: "Visos veiklos – Veiklų Pasaulis" },
      {
        property: "og:description",
        content: "Filtruokite veiklas pagal miestą, mikrorajoną, amžių, lytį ir kategoriją.",
      },
    ],
  }),
  component: AllListings,
});

function AllListings() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/bureliai/" });
  const listings = useListings();
  const results = filterListings(listings, filters);

  const update = (patch: Partial<Filters>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  return (
    <div className="container-page pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Visos veiklos</h1>
      <p className="mt-2 text-muted-foreground">
        Rasta veiklų: <strong className="text-foreground">{results.length}</strong>
      </p>
      <FilterBar filters={filters} onChange={update} className="mt-6 shadow-card" />
      <div className="mt-10">
        <ListingsGrid listings={results} onReset={() => update(DEFAULT_FILTERS)} />
      </div>
    </div>
  );
}
