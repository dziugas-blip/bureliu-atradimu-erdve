import { createFileRoute, Link } from "@tanstack/react-router";
import { ListingView } from "@/components/site/ListingView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SAMPLE_LISTINGS } from "@/lib/listings";
import { useHydrated, useListings } from "@/lib/listings-store";

export const Route = createFileRoute("/bureliai/$id")({
  // Sample listings are known on the server; user-added ones live in the browser only.
  loader: ({ params }) => {
    const l = SAMPLE_LISTINGS.find((x) => x.id === params.id);
    return { title: l?.title ?? null, summary: l?.shortDescription ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} – Veiklų Pasaulis`
      : "Veikla – Veiklų Pasaulis";
    const description =
      loaderData?.summary ?? "Veiklos aprašymas, tvarkaraštis, kaina ir kontaktai.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const listings = useListings();
  const hydrated = useHydrated();
  const listing = listings.find((l) => l.id === id);

  if (listing) return <ListingView listing={listing} />;

  if (!hydrated) {
    return (
      <div className="container-page space-y-4 pt-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
      </div>
    );
  }
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-extrabold">Veikla nerasta</h1>
      <p className="mt-2 text-muted-foreground">Galbūt ji buvo pašalinta arba nuoroda klaidinga.</p>
      <Button className="mt-6" asChild>
        <Link to="/bureliai" search={{}}>
          Žiūrėti visas veiklas
        </Link>
      </Button>
    </div>
  );
}
