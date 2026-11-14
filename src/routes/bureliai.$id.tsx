import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/components/site/CategoryBadge";
import { InquiryForm } from "@/components/site/InquiryForm";
import { SAMPLE_LISTINGS, formatPrice, listingImage } from "@/lib/listings";
import { useHydrated, useListings } from "@/lib/listings-store";

export const Route = createFileRoute("/bureliai/$id")({
  // Sample listings are known on the server; user-added ones live in the browser only.
  loader: ({ params }) => {
    const l = SAMPLE_LISTINGS.find((x) => x.id === params.id);
    return { title: l?.title ?? null, summary: l?.shortDescription ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ? `${loaderData.title} – Būrelių Erdvė` : "Būrelis – Būrelių Erdvė";
    const description =
      loaderData?.summary ?? "Būrelio aprašymas, tvarkaraštis, kaina ir kontaktai.";
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

  if (!listing) {
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
        <h1 className="text-2xl font-extrabold">Būrelis nerastas</h1>
        <p className="mt-2 text-muted-foreground">Galbūt jis buvo pašalintas arba nuoroda klaidinga.</p>
        <Button className="mt-6" asChild>
          <Link to="/bureliai" search={{}}>
            Žiūrėti visus būrelius
          </Link>
        </Button>
      </div>
    );
  }

  const facts = [
    { label: "Auditorija", value: listing.audience },
    { label: "Amžius", value: listing.ages.join(", ") },
    { label: "Lytis", value: listing.gender },
    { label: "Mikrorajonas", value: `${listing.district}, ${listing.city}` },
  ];

  return (
    <div className="container-page pt-6">
      <Link
        to="/bureliai"
        search={{}}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Visi būreliai
      </Link>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={listing.category} />
          {listing.userSubmitted && (
            <span className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal">
              Naujai įdėtas
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{listing.title}</h1>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4" /> {listing.address}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-muted">
        <img
          src={listingImage(listing)}
          alt={listing.title}
          width={1024}
          height={768}
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border p-4">
                <dt className="text-xs font-semibold text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 font-bold">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="text-xl font-extrabold">Apie būrelį</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/85">
              {listing.description}
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <CalendarDays className="size-5 text-primary" /> Tvarkaraštis
            </h2>
            {listing.schedule.length > 0 ? (
              <ul className="mt-4 divide-y rounded-xl border">
                {listing.schedule.map((s, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-semibold">{s.day}</span>
                    <span className="text-muted-foreground">{s.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Tvarkaraštį patikslinkite susisiekę su vadovu.
              </p>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-extrabold">
              <MapPin className="size-5 text-primary" /> Adresas
            </h2>
            <div className="mt-4 rounded-xl border bg-secondary p-4">
              <p className="font-semibold">{listing.address}</p>
              <p className="text-sm text-muted-foreground">
                {listing.district}, {listing.city}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Atidaryti žemėlapyje →
              </a>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-float">
            <p className="text-sm text-muted-foreground">
              <span className="text-3xl font-extrabold text-foreground">
                {formatPrice(listing.price)}
              </span>{" "}
              / mėn.
            </p>
            <div className="mt-5 space-y-2.5 border-y py-5 text-sm">
              <p className="flex items-center gap-2.5">
                <User className="size-4 text-muted-foreground" />
                <span className="font-semibold">{listing.contactName}</span>
              </p>
              <a href={`tel:${listing.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-primary">
                <Phone className="size-4 text-muted-foreground" /> {listing.phone}
              </a>
              <a href={`mailto:${listing.email}`} className="flex items-center gap-2.5 break-all hover:text-primary">
                <Mail className="size-4 text-muted-foreground" /> {listing.email}
              </a>
              <p className="flex items-center gap-2.5">
                <Users className="size-4 text-muted-foreground" /> {listing.gender} ·{" "}
                {listing.ages.join(", ")}
              </p>
            </div>
            <h2 className="mb-4 mt-5 text-lg font-extrabold">Susisiekti su būrelio vadovu</h2>
            <InquiryForm listingTitle={listing.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
