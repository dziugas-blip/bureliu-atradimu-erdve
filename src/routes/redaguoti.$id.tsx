import { createFileRoute, Link } from "@tanstack/react-router";
import { ListingForm } from "@/components/site/ListingForm";
import { OrganizerGate } from "@/components/site/OrganizerGate";
import { Button } from "@/components/ui/button";
import { useListings } from "@/lib/listings-store";

export const Route = createFileRoute("/redaguoti/$id")({
  head: () => ({
    meta: [{ title: "Redaguoti veiklą – Veiklų Pasaulis" }, { name: "robots", content: "noindex" }],
  }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  // Only listings added from this browser can be edited, never the built-in samples.
  const listing = useListings().find((l) => l.id === id && l.userSubmitted);

  return (
    <OrganizerGate>
      {listing ? (
        // The key resets the form if the organiser jumps straight to another listing.
        <ListingForm key={listing.id} editing={listing} />
      ) : (
        <div className="container-page flex flex-col items-center py-24 text-center">
          <h1 className="text-2xl font-extrabold">Šios veiklos redaguoti negalima</h1>
          <p className="mt-2 text-muted-foreground">Ji neegzistuoja arba ją įdėjo kitas vadovas.</p>
          <Button className="mt-6" asChild>
            <Link to="/profilis">Mano veiklos</Link>
          </Button>
        </div>
      )}
    </OrganizerGate>
  );
}
