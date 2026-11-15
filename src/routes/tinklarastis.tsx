import { createFileRoute, Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tinklarastis")({
  head: () => ({
    meta: [
      { title: "Tinklaraštis – Veiklų Pasaulis" },
      {
        name: "description",
        content:
          "Patarimai, kaip išsirinkti veiklą vaikui ar sau, ir naujienos apie veiklas Lietuvoje.",
      },
      { property: "og:title", content: "Tinklaraštis – Veiklų Pasaulis" },
      {
        property: "og:description",
        content: "Patarimai ir naujienos apie veiklas vaikams ir suaugusiems.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <div className="container-page pt-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Tinklaraštis</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Patarimai, kaip išsirinkti veiklą vaikui ar sau, ir naujienos apie veiklas Lietuvoje.
      </p>

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
        <PenLine className="size-8 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-bold">Pirmieji straipsniai jau rašomi</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Kol jų dar nėra, peržiūrėkite veiklas, kurias jau galite rasti.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/bureliai" search={{}}>
            Žiūrėti visas veiklas
          </Link>
        </Button>
      </div>
    </div>
  );
}
