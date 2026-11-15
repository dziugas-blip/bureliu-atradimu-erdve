import { createFileRoute } from "@tanstack/react-router";
import { ListingForm } from "@/components/site/ListingForm";
import { OrganizerGate } from "@/components/site/OrganizerGate";

export const Route = createFileRoute("/ideti")({
  head: () => ({
    meta: [
      { title: "Įdėti veiklą – Veiklų Erdvė" },
      {
        name: "description",
        content: "Įdėkite savo veiklą nemokamai ir pasiekite tėvus bei suaugusiuosius jūsų mieste.",
      },
      { property: "og:title", content: "Įdėti veiklą – Veiklų Erdvė" },
      {
        property: "og:description",
        content: "Įdėkite savo veiklą nemokamai ir pasiekite tėvus bei suaugusiuosius.",
      },
    ],
  }),
  component: AddListing,
});

function AddListing() {
  return (
    <OrganizerGate>
      <ListingForm />
    </OrganizerGate>
  );
}
