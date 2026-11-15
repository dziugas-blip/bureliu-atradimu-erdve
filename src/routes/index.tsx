import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/site/FilterBar";
import { ListingsGrid } from "@/components/site/ListingsGrid";
import { ALL, DEFAULT_FILTERS, filterListings, type Filters } from "@/lib/listings";
import { useListings } from "@/lib/listings-store";
import { filtersSearchSchema } from "@/lib/search-schema";

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(filtersSearchSchema),
  head: () => ({
    meta: [
      { title: "Veiklų Erdvė – rask geriausias veiklas Vilniuje" },
      {
        name: "description",
        content:
          "Šokiai, sportas, menai, robotika, muzika ir kalbos. Palyginkite veiklas vaikams ir suaugusiems pagal mikrorajoną, amžių ir kainą.",
      },
      { property: "og:title", content: "Veiklų Erdvė – rask geriausias veiklas Vilniuje" },
      {
        property: "og:description",
        content: "Palyginkite veiklas vaikams ir suaugusiems pagal mikrorajoną, amžių ir kainą.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const listings = useListings();
  const results = filterListings(listings, filters);

  const update = (patch: Partial<Filters>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  return (
    <>
      <section className="bg-hero-wash">
        <div className="container-page pb-12 pt-12 sm:pt-16 lg:pb-16 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <h1 className="text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
              Rask geriausias veiklas{" "}
              <span className="text-brand-gradient">vaikams ir suaugusiems</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Šokiai, sportas, menai, robotika, muzika ir kalbos – vienoje vietoje.
            </p>
          </div>
          <FilterBar
            filters={filters}
            onChange={update}
            className="mx-auto mt-10 max-w-6xl animate-fade-up [animation-delay:120ms]"
          />
        </div>
      </section>

      <section className="container-page pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              {filters.city === ALL ? "Veiklos Lietuvoje" : `Veiklos: ${filters.city}`}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rasta veiklų: <strong className="text-foreground">{results.length}</strong>
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/bureliai" search={filters}>
              Žiūrėti visus <ArrowRight />
            </Link>
          </Button>
        </div>
        <ListingsGrid listings={results} onReset={() => update(DEFAULT_FILTERS)} />
      </section>

      <section className="container-page mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-10 text-primary-foreground sm:px-12 sm:py-14">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Organizuojate veiklą?</h2>
              <p className="mt-3 max-w-lg text-primary-foreground/85">
                Įdėkite savo veiklą nemokamai ir leiskite tėvams bei suaugusiems jus lengvai
                surasti.
              </p>
              <Button size="xl" variant="outline" className="mt-6 border-transparent text-foreground" asChild>
                <Link to="/ideti">
                  <Plus /> Įdėti veiklą
                </Link>
              </Button>
            </div>
            <ul className="space-y-3 text-sm font-medium">
              {[
                "Nemokamas skelbimas",
                "Užklausos tiesiai jūsų el. paštu",
                "Matomas pagal mikrorajoną ir amžių",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary-foreground/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-primary-foreground/10" />
        </div>
      </section>
    </>
  );
}
